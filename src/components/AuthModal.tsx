'use client';

import { useState, useEffect } from 'react';

interface AuthModalProps {
  onLogin: (userId: string, username: string, scores: any, stats: any, scores2: any) => void;
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState({ a: 0, b: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, [isLogin]);

  const generateCaptcha = () => {
    setCaptchaChallenge({
      a: Math.floor(Math.random() * 10) + 1,
      b: Math.floor(Math.random() * 10) + 1
    });
    setCaptcha('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isVerifying) {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode })
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Verification failed');
        } else {
          setIsVerifying(false);
          setIsLogin(true);
          setError('Verification successful! Please login.');
          setVerificationCode('');
          setPassword('');
        }
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body: any = { email, password };
      
      if (!isLogin) {
        body.captcha = captcha;
        body.captchaAnswer = captchaChallenge.a + captchaChallenge.b;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        if (!isLogin) generateCaptcha();
      } else {
        if (isLogin) {
          onLogin(data.userId, data.username, data.scores, data.stats, data.scores2);
        } else {
          setIsVerifying(true);
          setError('Registration successful! Please check your email for a verification code.');
        }
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full border dark:border-gray-700 my-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 dark:text-indigo-400 mb-6 text-center">
          {isVerifying ? 'Verify Account' : (isLogin ? 'Login' : 'Register')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase mb-1">Email</label>
            <input
              type="email"
              required
              readOnly={isVerifying}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm ${isVerifying ? 'opacity-50' : ''}`}
              placeholder="example@email.com"
            />
          </div>

          {!isVerifying && (
            <div>
              <label className="block text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          )}

          {isVerifying && (
            <div>
              <label className="block text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase mb-1">Verification Code</label>
              <input
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="Check your email"
              />
            </div>
          )}

          {!isLogin && !isVerifying && (
            <div>
              <label className="block text-[10px] sm:text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase mb-1">
                CAPTCHA: {captchaChallenge.a} + {captchaChallenge.b} = ?
              </label>
              <input
                type="number"
                required
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="Answer"
              />
            </div>
          )}

          {error && (
            <p className={`text-xs sm:text-sm text-center ${error.includes('successful') || error.includes('Registration successful') ? 'text-green-500' : 'text-red-500'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 text-sm sm:text-base"
          >
            {loading ? 'Processing...' : (isVerifying ? 'Verify' : (isLogin ? 'Login' : 'Register'))}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {!isVerifying && (
            <>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </>
          )}
          {isVerifying && (
            <button
              onClick={() => {
                setIsVerifying(false);
                setIsLogin(false);
                setError('');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Back to registration
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

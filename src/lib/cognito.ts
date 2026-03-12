import { 
  CognitoUserPool, 
  CognitoUserAttribute, 
  AuthenticationDetails, 
  CognitoUser 
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID || '',
  ClientId: process.env.COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);

export const registerUser = (username: string, email: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      // For email-based login, username is often the same as email or Cognito might auto-generate it.
      // If the pool is configured to use Email as the primary sign-in, the 'username' parameter 
      // here is still needed, but often matches the email.
    ];

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      // Return the Cognito user object and its sub (UUID)
      resolve({ user: result?.user, sub: result?.userSub });
    });
  });
};

export const confirmUser = (email: string, code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const authenticateUser = (email: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        // Fetch user attributes to get the sub (UUID)
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
          } else {
            const subAttribute = attributes?.find(attr => attr.getName() === 'sub');
            const sub = subAttribute ? subAttribute.getValue() : null;
            resolve({ session: result, sub });
          }
        });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

import json
from pathlib import Path
import pandas as pd


def excel_to_json(excel_path, json_path):
    excel_path = Path(excel_path)
    json_path = Path(json_path)

    df = pd.read_excel(excel_path, dtype=str).fillna("")

    required_columns = {"id", "method", "chapter", "language", "dutch"}
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in Excel: {sorted(missing)}")

    records = df.to_dict(orient="records")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"JSON file written to: {json_path}")


if __name__ == "__main__":
    excel_to_json("words.xlsx", "../public/words.json")
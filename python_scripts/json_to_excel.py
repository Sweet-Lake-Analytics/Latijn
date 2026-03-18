import json
from pathlib import Path
import pandas as pd


def json_to_excel(json_path, excel_path, default_method="Minerva1"):
    json_path = Path(json_path)
    excel_path = Path(excel_path)

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("JSON root must be a list of objects.")

    converted = []
    counter = 1

    for entry in data:
        if not isinstance(entry, dict):
            raise ValueError("Each JSON item must be an object.")

        # Copy to avoid mutating original data
        row = dict(entry)

        # Rename latin -> language if needed
        if "latin" in row and "language" not in row:
            row["language"] = row.pop("latin")

        # Add method if missing
        if not row.get("method"):
            row["method"] = default_method

        # Add id if missing
        if not row.get("id"):
            row["id"] = f"{row['method']}_{counter:03d}"

        converted.append(row)
        counter += 1

    df = pd.DataFrame(converted)

    # Put columns in a nice order if present
    preferred_order = ["id", "method", "chapter", "language", "dutch"]
    other_cols = [col for col in df.columns if col not in preferred_order]
    df = df[[col for col in preferred_order if col in df.columns] + other_cols]

    df.to_excel(excel_path, index=False)
    print(f"Excel file written to: {excel_path}")


if __name__ == "__main__":
    json_to_excel("../public/latin_minerva.json", "words.xlsx", default_method="Minerva1")
# parser.py
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

def parse_user_input(user_input):
    prompt = f"""
You are a helpful assistant that converts payment instructions into structured JSON.
Convert the following instruction to JSON with keys: intent, amount, recipient, reason.
Return ONLY the JSON object, nothing else.

Instruction: "{user_input}"
"""
    response = model.generate_content(prompt)
    # Clean the response text and ensure it's valid JSON
    text = response.text.strip()
    # Remove any markdown code block markers if present
    text = text.replace('```json', '').replace('```', '').strip()
    try:
        # Validate JSON by parsing and re-stringifying
        parsed_json = json.loads(text)
        return json.dumps(parsed_json, indent=2)
    except json.JSONDecodeError:
        return json.dumps({
            "error": "Failed to parse instruction",
            "input": user_input
        }, indent=2)

def save_json(data, filename="output.json"):
    os.makedirs("outputs", exist_ok=True)
    with open(f"outputs/{filename}", "w") as f:
        json.dump(json.loads(data), f, indent=2)

if __name__ == "__main__":
    try:
        user_input = input().strip()
        parsed = parse_user_input(user_input)
        print(parsed)  # Print just the JSON string
        save_json(parsed)
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))

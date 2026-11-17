from flask import Flask, request, jsonify
from openai import OpenAI
from pymongo import MongoClient
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os,dotenv,flask_cors
from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# OpenAI Client
#client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# MongoDB Connection
load_dotenv()
mongo_client = MongoClient(
    os.getenv("MONGODB_URI")
)
db = mongo_client["chatbot_db"]
chat_collection = db["chat_history"]
users = db["users"]


def chat_with_gpt(prompt):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content.strip()

# REGISTER
@app.route("/register", methods=["POST"])
def register():

    data = request.json

    login_id = data["login_id"]
    password = data["password"]

    if users.find_one({"login_id": login_id}):
        return jsonify({"message": "User already exists"}), 400

    users.insert_one({
        "login_id": login_id,
        "password": generate_password_hash(password)
    })

    return jsonify({"message": "Registration successful"})


# LOGIN
@app.route("/login", methods=["POST"])
def login():

    data = request.json

    user = users.find_one({
        "login_id": data["login_id"]
    })

    if user and check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Login successful"})

    return jsonify({"message": "Invalid ID or Password"}), 401


# FORGOT PASSWORD / RESET PASSWORD
@app.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.json

    login_id = data["login_id"]
    new_password = data["new_password"]

    result = users.update_one(
        {"login_id": login_id},
        {"$set": {
            "password": generate_password_hash(new_password)
        }}
    )

    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "Password updated successfully"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()

    user_message = data.get("message", "")

    ai_response = chat_with_gpt(user_message)

    # Save Chat to MongoDB
    chat_collection.insert_one({
        "user_message": user_message,
        "ai_response": ai_response,
        "timestamp": datetime.utcnow()
    })

    return jsonify({
        "reply": ai_response
    })


@app.route('/history', methods=['GET'])
def get_history():
    chats = list(
        chat_collection.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1)
    )

    return jsonify(chats)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
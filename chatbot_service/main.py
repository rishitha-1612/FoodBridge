import json
import os
import unicodedata
from pathlib import Path
from typing import Literal

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = Path(os.getenv("FOODBRIDGE_MODEL_DIR", ROOT / "foodbridge_model")).resolve()
CONFIDENCE_THRESHOLD = float(os.getenv("CHATBOT_CONFIDENCE_THRESHOLD", "0.55"))

# The fine-tuned model has limited accuracy, especially for short or mixed-language
# questions. Handle common, unambiguous support phrases directly before asking it.
COMMON_INTENTS = [
    ("food_safety", ("food safety", "safe to eat", "allergen", "खाद्य सुरक्षा", "ಆಹಾರ ಸುರಕ್ಷತೆ", "ಸುರಕ್ಷತೆ")),
    ("ngo_approval", ("ngo approval", "ngo approve", "ngo verification", "ngo registration", "ngo मंज़ूरी", "ngo ಅನುಮೋದನೆ")),
    ("claim_donation", ("claim a donation", "claim donation", "accept a donation", "accept donation", "दान स्वीकार", "ದೇಣಿಗೆ ಸ್ವೀಕರ")),
    ("create_donation", ("donate", "donation कैसे", "दान कैसे", "ಆಹಾರ ದೇಣಿಗೆ", "ಆಹಾರ ದಾನ", "create a donation", "create donation", "donation listing", "list surplus food")),
    ("volunteer_registration", ("register as a volunteer", "volunteer registration", "become a volunteer", "स्वयंसेवक पंजीकरण", "ಸ್ವಯಂಸೇವಕ ನೋಂದಣಿ")),
    ("donor_registration", ("how do i register", "how can i register", "how to register", "register for foodbridge", "restaurant registration", "donor registration", "पंजीकरण कैसे", "ನೋಂದಣಿ ಹೇಗೆ")),
    ("pickup_assignment", ("pickup assignment", "pickups assigned", "pickup assigned", "assign a volunteer", "pickup कैसे", "ಪಿಕಪ್ ನಿಯೋಜನೆ")),
    ("account_login", ("log in", "login", "sign in", "account access", "लॉगिन", "ಲಾಗಿನ್")),
    ("delivery_status", ("delivery status", "track my donation", "track donation", "दान की स्थिति", "ವಿತರಣೆಯ ಸ್ಥಿತಿ")),
    ("about_foodbridge", ("what is foodbridge", "about foodbridge", "foodbridge platform", "what does foodbridge do", "tell me about foodbridge", "foodbridge क्या", "foodbridge ಎಂದರೇನು")),
]


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value.casefold())
    characters = (
        char if char.isalnum() or char.isspace() or unicodedata.category(char).startswith("M") else " "
        for char in value
    )
    return " ".join("".join(characters).split()).replace("food bridge", "foodbridge")

app = FastAPI(title="FoodBridge Chatbot Inference", version="1.0.0")
tokenizer = None
model = None
id2label: dict[int, str] = {}


class PredictRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    language: Literal["en", "hi", "kn"]


@app.on_event("startup")
def load_model() -> None:
    global tokenizer, model, id2label
    required = ["model.safetensors", "config.json", "tokenizer.json", "tokenizer_config.json", "label_mapping.json"]
    missing = [name for name in required if not (MODEL_DIR / name).is_file()]
    if missing:
        raise RuntimeError(f"Model directory {MODEL_DIR} is missing: {', '.join(missing)}")
    try:
        mapping = json.loads((MODEL_DIR / "label_mapping.json").read_text(encoding="utf-8"))
        id2label = {int(key): value for key, value in mapping["id2label"].items()}
        tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR), local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR), local_files_only=True)
        model.eval()
    except Exception as exc:
        raise RuntimeError(f"Could not load local FoodBridge model: {exc}") from exc


@app.get("/health")
def health():
    return {"status": "ok" if model is not None and tokenizer is not None else "not_ready", "model_loaded": model is not None}


@app.post("/predict")
def predict(payload: PredictRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message must not be empty.")
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    try:
        message = normalize_text(payload.message.strip())
        for intent, phrases in COMMON_INTENTS:
            if any(normalize_text(phrase) in message for phrase in phrases):
                return {
                    "intent": intent,
                    "confidence": 0.99,
                    "language": payload.language,
                    "fallback": False,
                    "threshold": CONFIDENCE_THRESHOLD,
                }

        inputs = tokenizer(message, return_tensors="pt", truncation=True, max_length=256)
        with torch.inference_mode():
            logits = model(**inputs).logits
            probabilities = torch.softmax(logits, dim=-1)[0]
        index = int(torch.argmax(probabilities).item())
        confidence = float(probabilities[index].item())
        return {
            "intent": id2label.get(index, "out_of_scope"),
            "confidence": confidence,
            "language": payload.language,
            "fallback": confidence < CONFIDENCE_THRESHOLD,
            "threshold": CONFIDENCE_THRESHOLD,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Inference failed.") from exc

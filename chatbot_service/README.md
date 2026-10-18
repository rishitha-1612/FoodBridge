# FoodBridge chatbot inference service

Python 3.10+ service loading the local fine-tuned model from `../foodbridge_model` at startup. It does not download or train a model. Install dependencies in a virtual environment, then run from the repository root:

```powershell
py -3.10 -m venv chatbot_service/.venv
chatbot_service/.venv/Scripts/python -m pip install -r chatbot_service/requirements.txt
chatbot_service/.venv/Scripts/python -m uvicorn main:app --app-dir chatbot_service --host 127.0.0.1 --port 8000
```

Check `http://127.0.0.1:8000/health`. `POST /predict` accepts `{"message":"...", "language":"en"}`; language must be `en`, `hi`, or `kn`. Language is selected by the user, not detected by the classifier. Set `FOODBRIDGE_MODEL_DIR` to override the model location, and `CHATBOT_CONFIDENCE_THRESHOLD` to tune the fallback threshold (default `0.55`).

The pinned versions support Python 3.10 and the saved BERT sequence-classification model. PyTorch wheels are platform-specific; if installation fails on a deployment platform, install the appropriate PyTorch 2.1 wheel for that platform, then install the remaining pinned requirements.

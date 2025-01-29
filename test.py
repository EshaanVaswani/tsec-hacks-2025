# Load model directly
from transformers import AutoTokenizer, AutoModelForPreTraining

tokenizer = AutoTokenizer.from_pretrained("law-ai/InLegalBERT")
model = AutoModelForPreTraining.from_pretrained("law-ai/InLegalBERT")
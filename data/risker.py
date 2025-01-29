import pandas as pd
from sklearn.model_selection import train_test_split
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from transformers import DataCollatorWithPadding
from datasets import Dataset

# Load the CSV data
data_path = "D:\\ApartFC\\hackathon\\rubix\\tsec-hacks-2025\\data\\risk_data.csv"  # Replace with the actual CSV file path
df = pd.read_csv(data_path)

# Preprocess the data
df = df[['Clause Text', 'Risk Level']]  # Select relevant columns
df = df.dropna()  # Drop rows with missing values

# Encode target labels (High: 1, Low: 0)
df['Risk Level'] = df['Risk Level'].map({'High': 1, 'Low': 0})

# Split data into train and test sets
train_texts, test_texts, train_labels, test_labels = train_test_split(
    df['Clause Text'].tolist(), df['Risk Level'].tolist(), test_size=0.2, random_state=42
)
print("Data preprocessing complete.")

# Load the tokenizer and model
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=2)

print("Model and tokenizer loaded.")
# Tokenize the data
train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=512)
test_encodings = tokenizer(test_texts, truncation=True, padding=True, max_length=512)

print("Data tokenization complete.")
# Convert to Dataset objects
train_dataset = Dataset.from_dict({"input_ids": train_encodings['input_ids'], "attention_mask": train_encodings['attention_mask'], "labels": train_labels})
test_dataset = Dataset.from_dict({"input_ids": test_encodings['input_ids'], "attention_mask": test_encodings['attention_mask'], "labels": test_labels})

print("Dataset creation complete.")
# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=4,
    weight_decay=0.01,
)

# Data collator for padding
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
)

# Train the model
trainer.train()

# Save the trained model
model.save_pretrained("clause_risk_model")
tokenizer.save_pretrained("clause_risk_model")

print("Model training complete and saved.")

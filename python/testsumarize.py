from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("varma007ut/Indian_Legal_Assitant")
model = AutoModelForCausalLM.from_pretrained("varma007ut/Indian_Legal_Assitant")

prompt = "What are the fundamental rights in the Indian Constitution?"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_length=200)
print(tokenizer.decode(outputs[0]))

import kagglehub

# Download latest version
path = kagglehub.dataset_download("omdabral/indian-penal-code-complete-dataset")

print("Path to dataset files:", path)
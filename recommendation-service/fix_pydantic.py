import os

def fix_pydantic_in_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Replace orm_mode with from_attributes
    content = content.replace('orm_mode = True', 'from_attributes = True')
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Fixed Pydantic config in {file_path}")

# Find all Python files in src directory
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.py'):
            file_path = os.path.join(root, file)
            if 'orm_mode' in open(file_path).read():
                fix_pydantic_in_file(file_path)

print("Pydantic configuration fixed successfully")

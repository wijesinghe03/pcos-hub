import os

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Patterns to remove (both clean and garbled)
        # Note: 'âœ“' is often followed by a space
        patterns = [
            'âœ“ ', 'âœ“',
            '✓ ', '✓'
        ]
        
        for p in patterns:
            content = content.replace(p, '')
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Cleaned: {filepath}")
            return True
    except Exception as e:
        # If utf-8 fails, try latin-1 just in case, but we should be careful
        try:
            with open(filepath, 'r', encoding='latin-1') as f:
                content = f.read()
            
            original_content = content
            for p in patterns:
                content = content.replace(p, '')
            
            if content != original_content:
                with open(filepath, 'w', encoding='latin-1') as f:
                    f.write(content)
                print(f"Cleaned (latin-1): {filepath}")
                return True
        except:
            print(f"Failed to process: {filepath} - {e}")
    return False

def main():
    root_dir = r'c:\xampp\htdocs\pcos-hub'
    extensions = ['.php', '.html', '.js', '.css']
    
    count = 0
    for root, dirs, files in os.walk(root_dir):
        # Skip some directories if needed
        if 'node_modules' in root or '.git' in root:
            continue
            
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                if clean_file(os.path.join(root, file)):
                    count += 1
    
    print(f"Total files cleaned: {count}")

if __name__ == "__main__":
    main()

import os

def clean_file(filepath):
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
        
        # Checkmark in UTF-8: E2 9C 93
        # Garbled version 1 (literal âœ“ characters in UTF-8)
        p1 = 'âœ“ '.encode('utf-8')
        p2 = 'âœ“'.encode('utf-8')
        # Garbled version 2 (actual checkmark bytes followed by space)
        p3 = b'\xe2\x9c\x93 '
        p4 = b'\xe2\x9c\x93'
        
        patterns = [p1, p2, p3, p4]
        
        original_data = data
        for p in patterns:
            data = data.replace(p, b'')
            
        if data != original_data:
            with open(filepath, 'wb') as f:
                f.write(data)
            print(f"Cleaned: {filepath}")
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    root_dir = r'c:\xampp\htdocs\pcos-hub'
    extensions = ['.php', '.html', '.js', '.css']
    
    count = 0
    for root, dirs, files in os.walk(root_dir):
        if any(d in root for d in ['.git', 'node_modules', 'libs']):
            continue
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                if clean_file(os.path.join(root, file)):
                    count += 1
    print(f"Total files cleaned: {count}")

if __name__ == "__main__":
    main()

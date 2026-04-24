import os

def fix_file(path):
    with open(path, 'rb') as f:
        data = f.read()
    
    # The file is "double encoded" or "Latin-1 interpreted as UTF-8"
    # To fix: Read as UTF-8 string -> Encode as Latin-1 bytes -> Decode as UTF-8 string
    try:
        content = data.decode('utf-8')
        raw_bytes = content.encode('latin-1')
        fixed_content = raw_bytes.decode('utf-8')
        
        # Now remove the checkmarks as requested
        # Common patterns: "✓ ", "✓", "âœ“ ", "âœ“"
        # Since we just fixed the content, they should be "✓" now.
        
        # Remove literal checkmarks from translation values
        # They usually appear like: key: "✓ Value"
        fixed_content = fixed_content.replace('✓ ', '')
        fixed_content = fixed_content.replace('✓', '')
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"Fixed {path}")
    except Exception as e:
        print(f"Error fixing {path}: {e}")

# Target files
files_to_fix = [
    r'c:\xampp\htdocs\pcos-hub\assets\js\utils.js',
]

for p in files_to_fix:
    fix_file(p)

# Also handle literal checkmarks in other files without the encoding fix if they aren't corrupted
other_files = [
    r'c:\xampp\htdocs\pcos-hub\assets\js\components.js',
    r'c:\xampp\htdocs\pcos-hub\src\pages\features.html',
    r'c:\xampp\htdocs\pcos-hub\src\pages\lab-results.html',
    r'c:\xampp\htdocs\pcos-hub\src\pages\pcos-info.html',
    r'c:\xampp\htdocs\pcos-hub\src\pages\learn-more.html',
    r'c:\xampp\htdocs\pcos-hub\src\pages\privacy-policy.html',
    r'c:\xampp\htdocs\pcos-hub\src\pages\signup-choice.html',
]

for p in other_files:
    if not os.path.exists(p): continue
    with open(p, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Remove checkmarks
    # Some are in <i> tags, some are just text
    new_content = content.replace('<i style="color:#27ae60">✓</i>', '')
    new_content = new_content.replace('<i style="color:var(--purple-primary);margin-right:10px">✓</i>', '')
    new_content = new_content.replace('<i>✓</i>', '')
    new_content = new_content.replace('✓ ', '')
    new_content = new_content.replace('✓', '')
    # Handle CSS content: '✓'
    new_content = new_content.replace("content: '✓';", "content: '';")
    new_content = new_content.replace('content: "✓";', 'content: "";')

    if content != new_content:
        with open(p, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned {p}")

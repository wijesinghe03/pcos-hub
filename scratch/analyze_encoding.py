import os

def check_file(filepath):
    with open(filepath, 'rb') as f:
        data = f.read()
    
    # Checkmark in UTF-8: E2 9C 93
    checkmark = b'\xe2\x9c\x93'
    count = data.count(checkmark)
    print(f"Found {count} checkmarks in {filepath}")
    
    # Look for common mojibake
    mojibake = [
        (b'\xe2\x80\x94', 'em dash'),
        (b'\xe2\x80\x9c', 'left double quote'),
        (b'\xe2\x80\x9d', 'right double quote'),
        (b'\xe2\x80\xa6', 'ellipsis'),
        (b'\xe2\x86\x92', 'arrow'),
        (b'\xe2\x9c\x93', 'checkmark'),
        (b'\xe2\x9c\x94', 'heavy checkmark'),
        (b'\xc3\xa2\xe2\x80\x9c\xc2\xac', 'weird mojibake'),
    ]
    
    for m, name in mojibake:
        if m in data:
            print(f"Found {name} ({m.hex()}) in {filepath}")

check_file(r'c:\xampp\htdocs\pcos-hub\assets\js\utils.js')
check_file(r'c:\xampp\htdocs\pcos-hub\src\pages\features.html')

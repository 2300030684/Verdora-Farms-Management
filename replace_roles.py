import os, glob, re

path = 'c:/Users/GANES/Downloads/AI-Dairy-Farm-Management/AI-Dairy-Farm-Management/backend/src/main/java/com/dairycare/controller/*.java'
for file in glob.glob(path):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We only want to touch PreAuthorize annotations that contain USER or FARMER to avoid breaking others
    # but wait, the prompt says "Dairy Farm Owner (Admin)". 
    # Let's just blindly replace all PreAuthorize to ADMIN in these specific controllers.
    # Actually, some might be public. If they have PreAuthorize, they should be ADMIN.
    
    if "AuthController" in file or "DairyProduct" in file or "ProductSale" in file:
        continue # Skip auth and storefront controllers
        
    new_content = re.sub(r'@PreAuthorize\([^)]+\)', '@PreAuthorize("hasRole(\'ADMIN\')")', content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {os.path.basename(file)}')

const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/GANES/Downloads/AI-Dairy-Farm-Management/AI-Dairy-Farm-Management/backend/src/main/java/com/dairycare/controller';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file === 'AuthController.java' || file === 'DairyProductController.java' || file === 'ProductSaleController.java' || file === 'UserController.java') {
        return; // skip
    }
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace @PreAuthorize("hasRole(...)") with @PreAuthorize("hasRole('ADMIN')")
    const newContent = content.replace(/@PreAuthorize\([^)]+\)/g, '@PreAuthorize("hasRole(\'ADMIN\')")');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${file}`);
    }
});

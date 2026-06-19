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
    
    // Split by lines and replace any line containing @PreAuthorize with the correct one
    const lines = content.split('\n');
    const newLines = lines.map(line => {
        if (line.includes('@PreAuthorize')) {
            // Match the leading whitespace to preserve indentation
            const match = line.match(/^(\s*)/);
            const indent = match ? match[1] : '';
            return indent + '@PreAuthorize("hasRole(\'ADMIN\')")';
        }
        return line;
    });
    
    const newContent = newLines.join('\n');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Fixed ${file}`);
    }
});

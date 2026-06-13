const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
                walk(dirPath, callback);
            }
        } else {
            if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx') || dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
                callback(dirPath);
            }
        }
    });
}

walk('.', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace features with modules
    content = content.replace(/(["'])@\/src\/features\//g, '$1@/src/modules/');
    content = content.replace(/(["'])\.\.\/features\//g, '$1../modules/');

    // Replace lib/db with src/config/database
    content = content.replace(/(["'])@\/lib\/db(["'])/g, '$1@/src/config/database$2');
    content = content.replace(/(["'])\.\.\/\.\.\/lib\/db(["'])/g, '$1@/src/config/database$2');

    // Replace src/lib/api-handler with src/core/exceptions/api-handler
    content = content.replace(/(["'])@\/src\/lib\/api-handler(["'])/g, '$1@/src/core/exceptions/api-handler$2');

    // Replace src/lib/logger with src/config/logger
    content = content.replace(/(["'])@\/src\/lib\/logger(["'])/g, '$1@/src/config/logger$2');

    // Replace lib/firebase with config
    content = content.replace(/(["'])@\/lib\/firebase-admin(["'])/g, '$1@/src/config/firebase-admin$2');
    content = content.replace(/(["'])@\/lib\/firebase-client(["'])/g, '$1@/src/config/firebase-client$2');

    // Replace other lib/ with src/core/utils/
    content = content.replace(/(["'])@\/lib\/([^"'\n]+)(["'])/g, '$1@/src/core/utils/$2$3');

    // Special fixes for api-handler
    if (filePath.includes('api-handler.ts')) {
        content = content.replace(/from "\.\/logger"/g, 'from "@/src/config/logger"');
    }

    if (content !== original) {
        console.log(`Updated ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

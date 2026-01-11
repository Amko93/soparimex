import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, '..'); // Le dossier du site
const backupBaseDir = path.join(__dirname, '..', '_BACKUPS'); // Dossier des backups

// On ignore ces dossiers (trop lourds)
const ignore = ['node_modules', '.git', '_BACKUPS', 'dist'];

// Fonction pour copier
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    
    fs.readdirSync(from).forEach(element => {
        if (ignore.includes(element)) return;
        
        const stat = fs.lstatSync(path.join(from, element));
        if (stat.isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

// Création du nom avec la date (ex: backup-2023-10-25_14h30)
const date = new Date();
const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const targetDir = path.join(backupBaseDir, `backup-${timestamp}`);

console.log(`📦 Création de la sauvegarde dans : ${targetDir}...`);
copyFolderSync(sourceDir, targetDir);
console.log(`✅ Sauvegarde terminée !`);
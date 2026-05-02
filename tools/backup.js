import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, '..');
const backupBaseDir = path.join(__dirname, '..', '_BACKUPS');
const ignore = ['node_modules', '.git', '_BACKUPS', 'dist', '.env']; // On ignore aussi .env par sécurité

// Interface pour poser la question
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonction pour copier (identique à avant)
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

console.log("\n🛑 ATTENTION : Ne fais pas de sauvegarde si tu as une erreur !");
console.log("---------------------------------------------------------");

// On demande à l'utilisateur ce qu'il a fait
rl.question('📝 Décris tes changements (ex: Ajout page login) : ', (message) => {
    
    // 1. Création du dossier avec la date
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const folderName = `backup-${timestamp}`;
    const targetDir = path.join(backupBaseDir, folderName);

    console.log(`\n📦 Création de la sauvegarde dans : ${folderName}...`);
    
    // 2. Copie des fichiers
    try {
        copyFolderSync(sourceDir, targetDir);

        // 3. Création du fichier LOG dans la sauvegarde
        const logContent = `DATE : ${date.toLocaleString()}\nMESSAGE : ${message || "Aucune description"}\n`;
        fs.writeFileSync(path.join(targetDir, 'info-backup.txt'), logContent);

        console.log(`✅ Sauvegarde terminée avec succès !`);
        console.log(`📄 Note enregistrée dans : info-backup.txt`);
    } catch (e) {
        console.error("❌ Erreur pendant la copie :", e);
    }

    rl.close();
});
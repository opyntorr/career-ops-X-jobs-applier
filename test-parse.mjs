import fs from 'fs';
const lines = fs.readFileSync('data/applications.md', 'utf8').split('\n');
for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---') || line.includes('Date | Company')) continue;
    const parts = line.split('|').map(s => s.trim());
    console.log("PARTS LENGTH:", parts.length);
    console.log("PARTS:", parts);
    if (parts.length < 9) continue;
    const score = parseFloat(parts[5]);
    console.log("SCORE:", score);
}

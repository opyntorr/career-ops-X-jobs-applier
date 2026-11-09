const fs = require('fs');
const content = fs.readFileSync('reports/005-nxp-semiconductors-2026-07-05.md', 'utf8');
const chunks = [];
let currentChunk = '';
for (const line of content.split('\n')) {
    if (currentChunk.length + line.length + 1 > 1950) {
        chunks.push(currentChunk);
        currentChunk = line + '\n';
    } else {
        currentChunk += line + '\n';
    }
}
if (currentChunk) chunks.push(currentChunk);
console.log("Total chunks:", chunks.length);

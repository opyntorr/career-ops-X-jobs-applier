import fs from 'fs';
const lines = fs.readFileSync('data/applications.md', 'utf8').split('\n');
const notifiedState = fs.existsSync('data/discord-bot-state.json') ? JSON.parse(fs.readFileSync('data/discord-bot-state.json')) : {};
for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---') || line.includes('Date | Company')) continue;
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 9) continue;
    const company = parts[3];
    const role = parts[4];
    const scoreStr = parts[5];
    const score = parseFloat(scoreStr);
    const uniqueKey = `${company}-${role}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    console.log(`Checking: ${company} - ${role} | Score: ${score} | Key: ${uniqueKey}`);
    if (isNaN(score) || score < 3.5) {
        console.log(`  -> Skipped (Score < 3.5)`);
        continue;
    }
    if (notifiedState[uniqueKey]) {
        console.log(`  -> Skipped (Already notified)`);
        continue;
    }
    console.log(`  -> WOULD NOTIFY!`);
}

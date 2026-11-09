import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const DISCORD_CONFIG = 'config/discord.yml';
const TRACKER_FILE = 'data/applications.md';
const STATE_FILE = 'data/discord-state.json';

async function main() {
    if (!fs.existsSync(DISCORD_CONFIG)) {
        console.log("No discord.yml found. Exiting.");
        return;
    }

    const config = yaml.load(fs.readFileSync(DISCORD_CONFIG, 'utf8'));
    let notifiedState = {};
    if (fs.existsSync(STATE_FILE)) {
        notifiedState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }

    if (!fs.existsSync(TRACKER_FILE)) return;
    
    const lines = fs.readFileSync(TRACKER_FILE, 'utf8').split('\n');
    let updated = false;

    for (const line of lines) {
        if (!line.startsWith('|') || line.includes('---') || line.includes('Date | Company')) continue;
        
        // Parse markdown table: | # | Date | Company | Role | Score | Status | PDF | Report | Notes |
        const parts = line.split('|').map(s => s.trim());
        if (parts.length < 9) continue;

        const date = parts[2];
        const company = parts[3];
        const role = parts[4];
        const scoreStr = parts[5];

        const score = parseFloat(scoreStr);
        if (isNaN(score) || score < config.min_score) continue;

        // Create a unique key for this application
        const uniqueKey = `${company}-${role}`.toLowerCase();
        if (notifiedState[uniqueKey]) continue; // Already notified

        // Determine which webhook to use based on keywords in the role title
        let webhookUrl = config.webhooks.default;
        const roleLower = role.toLowerCase();
        
        if ((roleLower.includes('robot') || roleLower.includes('ros') || roleLower.includes('simulation') || roleLower.includes('gazebo')) && config.webhooks.robotica) {
            webhookUrl = config.webhooks.robotica;
        } else if ((roleLower.includes('design') || roleLower.includes('3d') || roleLower.includes('mechanical') || roleLower.includes('cad') || roleLower.includes('jewelry')) && config.webhooks.diseno_3d) {
            webhookUrl = config.webhooks.diseno_3d;
        } else if ((roleLower.includes('embedded') || roleLower.includes('firmware') || roleLower.includes('hardware') || roleLower.includes('electronic')) && config.webhooks.embebidos) {
            webhookUrl = config.webhooks.embebidos;
        } else if ((roleLower.includes('software') || roleLower.includes('developer') || roleLower.includes('engineer')) && config.webhooks.software) {
            webhookUrl = config.webhooks.software;
        }

        if (!webhookUrl) continue;

        const reportMatch = parts[8] ? (parts[8].match(/href="([^"]+)"/) || parts[8].match(/\]\(([^)]+)\)/)) : null;
        let jobUrl = null;
        if (reportMatch) {
            const reportPath = path.resolve('data', reportMatch[1]);
            if (fs.existsSync(reportPath)) {
                const reportContent = fs.readFileSync(reportPath, 'utf8');
                const urlMatch = reportContent.match(/\*\*URL:\*\*\s*(https?:\/\/[^\s\n]+)/i) || reportContent.match(/URL:\s*(https?:\/\/[^\s\n]+)/i);
                if (urlMatch) jobUrl = urlMatch[1].trim();
            }
        }

        // Send to Discord
        const fields = [
            { name: "Empresa", value: company, inline: true },
            { name: "Score", value: `${score} / 5.0 ⭐`, inline: true },
            { name: "Fecha", value: date, inline: true }
        ];

        if (jobUrl) {
            fields.push({ name: "Enlace a la Vacante", value: `[Ver en Portal](${jobUrl})`, inline: false });
        }

        const embed = {
            title: `🎯 Nuevo Match: ${role}`,
            color: 0x00FF00, // Green
            fields: fields
        };

        let sent = false;
        let attempts = 0;
        while (!sent && attempts < 3) {
            attempts++;
            try {
                console.log(`Sending ${company} - ${role} to Discord... (attempt ${attempts})`);
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `¡He encontrado una nueva vacante que supera tu filtro de ${config.min_score}!`,
                        embeds: [embed]
                    })
                });
                if (response.ok) {
                    notifiedState[uniqueKey] = true;
                    updated = true;
                    sent = true;
                } else {
                    const errText = await response.text();
                    console.error("Discord error:", errText);
                    if (errText.includes("Unknown Webhook")) {
                        console.error("Webhook URL en config/discord.yml es inválida o ha expirado.");
                        attempts = 3;
                        break;
                    }
                    if (response.status === 429 || errText.includes("rate limited")) {
                        let waitMs = 1500;
                        try {
                            const errJson = JSON.parse(errText);
                            if (errJson.retry_after) waitMs = Math.ceil(errJson.retry_after * 1000) + 200;
                        } catch (e) {}
                        console.log(`Rate limited by Discord. Waiting ${waitMs}ms before retry...`);
                        await new Promise(r => setTimeout(r, waitMs));
                    }
                }
            } catch (err) {
                console.error("Error sending to Discord:", err);
            }
        }
        await new Promise(r => setTimeout(r, 1200));
    }



    if (updated) {
        fs.writeFileSync(STATE_FILE, JSON.stringify(notifiedState, null, 2));
    }
}

main();

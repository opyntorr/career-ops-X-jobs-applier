import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionsBitField } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const TRACKER_FILE = 'data/applications.md';
const STATE_FILE = 'data/discord-bot-state.json';
const MIN_SCORE = 3.0;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

let notifiedState = {};
if (fs.existsSync(STATE_FILE)) {
    notifiedState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

async function getOrCreateCategory(guild, name) {
    let category = guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildCategory);
    if (!category) {
        category = await guild.channels.create({
            name: name,
            type: ChannelType.GuildCategory
        });
    }
    return category;
}

function updateApplicationStatus(uniqueKey, newStatus) {
    if (!fs.existsSync(TRACKER_FILE)) return false;
    let lines = fs.readFileSync(TRACKER_FILE, 'utf8').split('\n');
    let updated = false;
    
    // We need to match uniqueKey. uniqueKey is derived from company + role
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith('|') || lines[i].includes('---') || lines[i].includes('Date | Company')) continue;
        const parts = lines[i].split('|').map(s => s.trim());
        if (parts.length < 9) continue;
        
        const company = parts[3];
        const role = parts[4];
        const currentUniqueKey = `${company}-${role}`.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 60);
        
        if (currentUniqueKey === uniqueKey) {
            // Reconstruct the line with new status
            // The format is | ID | Date | Company | Role | Score | Status | PDF | Report | Notes |
            parts[6] = newStatus;
            lines[i] = '| ' + parts.slice(1).join(' | ') + ' |';
            updated = true;
            break;
        }
    }
    
    if (updated) {
        fs.writeFileSync(TRACKER_FILE, lines.join('\n'));
    }
    return updated;
}

function extractDetails(reportPath) {
    let tldr = 'Resumen no disponible.';
    let keywords = 'No especificadas.';
    let compensation = null;
    let coverLetter = null;
    let jobUrl = null;
    
    try {
        if (reportPath && fs.existsSync(reportPath)) {
            const content = fs.readFileSync(reportPath, 'utf8');
            const tldrMatch = content.match(/\|\s*TL;DR\s*\|\s*(.*?)\s*\|/);
            if (tldrMatch) tldr = tldrMatch[1].trim();

            const kwMatch = content.match(/## Keywords extracted\s*\n+([\s\S]*?)(?:\n##|\n---|$)/);
            if (kwMatch) keywords = kwMatch[1].trim();
            
            const compMatch = content.match(/\|\s*(?:Compensation|Salary|Salario|Compensación)\s*\|\s*(.*?)\s*\|/i);
            if (compMatch && compMatch[1].trim().toLowerCase() !== 'not specified') {
                compensation = compMatch[1].trim();
            }
            
            const urlMatch = content.match(/\*\*URL:\*\*\s*(https?:\/\/[^\s\n]+)/i) || content.match(/URL:\s*(https?:\/\/[^\s\n]+)/i);
            if (urlMatch) {
                jobUrl = urlMatch[1].trim();
            }

            const coverMatch = content.match(/## Draft Cover Letter[\s\S]*?(?=\n##|$)/i) || content.match(/## Borrador[\s\S]*?(?=\n##|$)/i);
            if (coverMatch) {
                coverLetter = coverMatch[0].trim();
            }
        }
    } catch(e) {}
    return { tldr, keywords, compensation, coverLetter, jobUrl };
}

client.once('ready', async () => {
    console.log(`🤖 Bot conectado exitosamente como ${client.user.tag}`);
    
    // Registrar Slash Commands
    try {
        await client.application.commands.create({
            name: 'scan',
            description: 'Ejecuta el escáner de vacantes (career-ops scan)',
        });
        console.log('✅ Comandos Slash registrados.');
    } catch (error) {
        console.error('Error registrando comandos Slash:', error);
    }
    
    for (const guild of client.guilds.cache.values()) {
        try {
            await guild.channels.fetch();
        } catch(e) {}

        const generalChannel = guild.channels.cache.find(c => c.name === 'nuevas-ofertas' || c.name === 'general' || c.name === 'chamba');
        const rankingChannel = guild.channels.cache.find(c => c.name === 'ranking-ofertas');
        
        if (generalChannel) {
            console.log(`✅ Publicando en: ${guild.name} (#${generalChannel.name})`);
            checkNewJobs(generalChannel, rankingChannel, guild);
            setInterval(() => checkNewJobs(generalChannel, rankingChannel, guild), 15 * 60 * 1000);
            setInterval(() => checkFollowups(guild), 60 * 60 * 1000); // Check followups every hour

            // Monitor instant changes on data/applications.md
            let debounceTimer = null;
            if (fs.existsSync(TRACKER_FILE)) {
                fs.watch(TRACKER_FILE, (eventType) => {
                    if (eventType === 'change') {
                        if (debounceTimer) clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            console.log('⚡ Detectado cambio instantáneo en data/applications.md — verificando nuevas ofertas...');
                            checkNewJobs(generalChannel, rankingChannel, guild);
                        }, 1000);
                    }
                });
            }
        }
    }
});

async function checkFollowups(guild) {
    if (!fs.existsSync(TRACKER_FILE)) return;
    const lines = fs.readFileSync(TRACKER_FILE, 'utf8').split('\n');
    
    for (const line of lines) {
        if (!line.startsWith('|') || line.includes('---') || line.includes('Date | Company')) continue;
        const parts = line.split('|').map(s => s.trim());
        if (parts.length < 9) continue;
        
        const dateStr = parts[2];
        const company = parts[3];
        const role = parts[4];
        const status = parts[6];
        
        if (status === 'Applied') {
            const applyDate = new Date(dateStr);
            const today = new Date();
            const diffDays = Math.floor((today - applyDate) / (1000 * 60 * 60 * 24));
            
            const uniqueKey = `${company}-${role}`.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 60);
            const safeCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 15);
            const channelName = `oferta-${safeCompany}`;
            
            if (diffDays >= 7 && (!notifiedState[uniqueKey] || !notifiedState[uniqueKey].followup_7_days)) {
                const channel = guild.channels.cache.find(c => c.name === channelName);
                if (channel) {
                    await channel.send(`⏰ **¡Recordatorio de Follow-up!**\nHan pasado ${diffDays} días desde que aplicaste a esta vacante. ¿Es hora de mandar un correo de seguimiento al reclutador? Usa \`/career-ops followup\` en tu terminal.`);
                    
                    if (!notifiedState[uniqueKey]) notifiedState[uniqueKey] = {};
                    notifiedState[uniqueKey].followup_7_days = true;
                    fs.writeFileSync(STATE_FILE, JSON.stringify(notifiedState, null, 2));
                }
            }
        }
    }
}

async function checkNewJobs(generalChannel, rankingChannel, guild) {
    if (!fs.existsSync(TRACKER_FILE)) return;
    
    const lines = fs.readFileSync(TRACKER_FILE, 'utf8').split('\n');
    let updated = false;
    let allValidJobs = [];

    for (const line of lines) {
        if (!line.startsWith('|') || line.includes('---') || line.includes('Date | Company')) continue;
        
        const parts = line.split('|').map(s => s.trim());
        if (parts.length < 9) continue;

        const date = parts[2];
        const company = parts[3];
        const role = parts[4];
        const scoreStr = parts[5];
        
        const reportMatch = parts[8].match(/href="([^"]+)"/) || parts[8].match(/\]\(([^)]+)\)/);
        let reportPath = reportMatch ? reportMatch[1] : '';
        if (reportPath && !reportPath.startsWith('/')) {
            reportPath = path.resolve(path.dirname(TRACKER_FILE), reportPath);
        }

        const pdfMatch = parts[7] ? (parts[7].match(/href="([^"]+)"/) || parts[7].match(/\]\(([^)]+)\)/)) : null;
        let pdfPath = pdfMatch ? pdfMatch[1] : '';
        if (pdfPath && !pdfPath.startsWith('/')) {
            pdfPath = path.resolve(path.dirname(TRACKER_FILE), pdfPath);
        } else if (parts[7] && parts[7].includes('✅')) {
            // Find the most recent PDF in output/ matching the company or report number
            const outputDir = path.resolve(path.dirname(TRACKER_FILE), '../output');
            if (fs.existsSync(outputDir)) {
                const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.pdf'));
                const safeComp = company.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                const reportNum = reportPath ? path.basename(reportPath).split('-')[0] : null;
                
                let bestMatch = null;
                let bestTime = 0;
                for (const file of files) {
                    const fLower = file.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (fLower.includes(safeComp) || (reportNum && file.startsWith(reportNum))) {
                        const stat = fs.statSync(path.join(outputDir, file));
                        if (stat.mtimeMs > bestTime) {
                            bestTime = stat.mtimeMs;
                            bestMatch = path.join(outputDir, file);
                        }
                    }
                }
                if (bestMatch) pdfPath = bestMatch;
            }
        }

        const score = parseFloat(scoreStr);
        if (isNaN(score) || score < MIN_SCORE) continue;

        const uniqueKey = `${company}-${role}`.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 60);
        
        const { tldr, keywords, compensation, jobUrl } = extractDetails(reportPath);
        
        const jobInfo = { company, role, reportPath, pdfPath, score, date, uniqueKey, tldr, keywords, compensation, jobUrl };
        allValidJobs.push(jobInfo);

        if (notifiedState[uniqueKey] && notifiedState[uniqueKey].posted) continue;

        console.log(`Enviando nueva oferta: ${company} - ${role}`);

        let desc = `**Puntuación:** ${score} / 5.0 ⭐\n\n`;
        if (compensation) desc += `**💰 Salario:** ${compensation}\n\n`;
        desc += `**📝 Resumen:**\n${tldr}\n\n**🛠️ Tecnologías:**\n${keywords}`;

        const embed = new EmbedBuilder()
            .setTitle(`🎯 Nuevo Match: ${role}`)
            .setDescription(desc)
            .addFields(
                { name: '🏢 Empresa', value: company, inline: true },
                { name: '📅 Fecha', value: date, inline: true }
            )
            .setColor(0x00A2FF);

        const button = new ButtonBuilder()
            .setCustomId(`me_interesa_${uniqueKey}`)
            .setLabel('🚀 Me interesa (Crear Canal)')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        if (jobUrl) {
            const urlButton = new ButtonBuilder()
                .setLabel('🔗 Ver Vacante Original')
                .setStyle(ButtonStyle.Link)
                .setURL(jobUrl);
            row.addComponents(urlButton);
        }

        try {
            await generalChannel.send({ embeds: [embed], components: [row] });
            if (!notifiedState[uniqueKey]) notifiedState[uniqueKey] = {};
            notifiedState[uniqueKey].posted = true;
            notifiedState[uniqueKey].company = company;
            notifiedState[uniqueKey].role = role;
            notifiedState[uniqueKey].reportPath = reportPath;
            notifiedState[uniqueKey].pdfPath = pdfPath;
            updated = true;
        } catch (err) {
            console.error('Error enviando mensaje a Discord:', err);
        }
    }

    if (updated) {
        fs.writeFileSync(STATE_FILE, JSON.stringify(notifiedState, null, 2));
    }

    if (rankingChannel && allValidJobs.length > 0) {
        allValidJobs.sort((a, b) => b.score - a.score);
        try {
            const fetched = await rankingChannel.messages.fetch({ limit: 100 });
            if (fetched.size > 0) await rankingChannel.bulkDelete(fetched);
        } catch(e) {}
        
        let rank = 1;
        for (const job of allValidJobs) {
            const color = rank === 1 ? 0xFFD700 : (rank === 2 ? 0xC0C0C0 : (rank === 3 ? 0xCD7F32 : 0x00A2FF));
            let rankDesc = `**Puntuación:** ${job.score} / 5.0 ⭐\n\n`;
            if (job.compensation) rankDesc += `**💰 Salario:** ${job.compensation}\n\n`;
            rankDesc += `**📝 Resumen:**\n${job.tldr}\n\n**🛠️ Tecnologías:**\n${job.keywords}`;

            const embed = new EmbedBuilder()
                .setTitle(`#${rank} - ${job.role} en ${job.company}`)
                .setDescription(rankDesc)
                .setColor(color);

            const btn = new ButtonBuilder()
                .setCustomId(`me_interesa_${job.uniqueKey}`)
                .setLabel('🚀 Me interesa (Crear Canal)')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(btn);
            try {
                await rankingChannel.send({ embeds: [embed], components: [row] });
            } catch(e) {}
            rank++;
        }
    }
}

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isCommand()) {
            if (interaction.commandName === 'scan') {
                await interaction.reply('🔍 Iniciando escáner en el servidor remoto... (Esto puede tomar varios minutos).');
                exec('node scan.mjs', { cwd: '/home/opyntorr/career-ops' }, async (error, stdout, stderr) => {
                    let replyText = '✅ **Escáner completado.**\n\n```text\n';
                    if (stdout) {
                        const lines = stdout.split('\n');
                        const summary = lines.slice(-15).join('\n').substring(0, 1800);
                        replyText += summary;
                    }
                    replyText += '\n```';
                    await interaction.followUp(replyText).catch(() => {});
                });
                return;
            }
        }

        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith('me_interesa_')) {
            try {
                await interaction.deferReply({ ephemeral: true });
            } catch (err) {
                if (err.code === 10062) return; // Interaction expired, skip silently
            }
            const uniqueKey = interaction.customId.replace('me_interesa_', '');
            const jobData = notifiedState[uniqueKey];
            if (!jobData) return interaction.editReply({ content: 'Datos no encontrados.' }).catch(() => {});

            let roleClean = jobData.role
                .replace(/^Strategic Student Program\s*\(SSP\)\s*-\s*/i, '')
                .replace(/^Programa de Becarios\s*-\s*/i, '');
            const safeCompany = jobData.company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 15);
            const safeRole = (roleClean || jobData.role).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30);
            const channelName = `oferta-${safeCompany}-${safeRole}`.replace(/-+$/, '');
            const guild = interaction.guild;

            const existingChannel = guild.channels.cache.find(c => c.name === channelName);
            if (existingChannel) return interaction.editReply({ content: `¡Ya tienes el canal ${existingChannel}!` }).catch(() => {});

            try {
                const pendingCategory = await getOrCreateCategory(guild, '🟡 Pendientes');
                const newChannel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: pendingCategory.id,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                    ],
                });

                await interaction.editReply({ content: `✅ Espacio creado: ${newChannel}` }).catch(() => {});

                let extraInfo = `¡Bienvenido <@${interaction.user.id}>!\nVacante: **${jobData.role}** en **${jobData.company}**.\n\n`;
                
                let finalReportPath = jobData.reportPath;
                if (finalReportPath && !finalReportPath.startsWith('/')) finalReportPath = path.resolve(path.dirname(TRACKER_FILE), finalReportPath);

                if (finalReportPath && fs.existsSync(finalReportPath)) {
                    const content = fs.readFileSync(finalReportPath, 'utf8');
                    const urlMatch = content.match(/\*\*URL:\*\*\s*(.+)/);
                    if (urlMatch) extraInfo += `🔗 **Enlace:** ${urlMatch[1]}\n`;

                    const btnApplied = new ButtonBuilder().setCustomId(`action_applied_${uniqueKey}`).setLabel('✅ Aplicada').setStyle(ButtonStyle.Success);
                    const btnDraft = new ButtonBuilder().setCustomId(`action_draft_${uniqueKey}`).setLabel('✉️ Ver Correo').setStyle(ButtonStyle.Primary);
                    const btnRejected = new ButtonBuilder().setCustomId(`action_rejected_${uniqueKey}`).setLabel('❌ Rechazada').setStyle(ButtonStyle.Danger);
                    const rowActions = new ActionRowBuilder().addComponents(btnApplied, btnDraft, btnRejected);

                    const sendOptions = { content: extraInfo, components: [rowActions] };
                    
                    if (jobData.pdfPath && fs.existsSync(jobData.pdfPath)) {
                        sendOptions.files = [jobData.pdfPath];
                    }

                    await newChannel.send(sendOptions);

                    const chunks = [];
                    let currentChunk = '';
                    for (const line of content.split('\n')) {
                        if (currentChunk.length + line.length > 1900) {
                            chunks.push(currentChunk);
                            currentChunk = line + '\n';
                        } else currentChunk += line + '\n';
                    }
                    if (currentChunk) chunks.push(currentChunk);

                    for (const chunk of chunks) await newChannel.send(chunk);

                } else {
                    await newChannel.send(extraInfo);
                }
            } catch (error) {
                console.error(error);
            }
        }
        
        // Actions for Private Channel buttons
        if (interaction.customId.startsWith('action_')) {
            try {
                await interaction.deferUpdate();
            } catch (err) {
                if (err.code === 10062) return;
            }
            const actionParts = interaction.customId.split('_');
            const actionType = actionParts[1];
            const uniqueKey = actionParts[2];
            const jobData = notifiedState[uniqueKey];
            const guild = interaction.guild;
            const channel = interaction.channel;

            if (actionType === 'applied') {
                updateApplicationStatus(uniqueKey, 'Applied');
                try {
                    const cat = await getOrCreateCategory(guild, '🔵 Aplicadas');
                    await channel.setParent(cat.id, { lockPermissions: false });
                } catch(e) {
                    console.error('Error al mover canal a Aplicadas:', e);
                }
                await channel.send('✅ **¡Excelente!** La vacante fue movida a la categoría **🔵 Aplicadas** y el archivo interno fue actualizado.').catch(() => {});
            } 
            else if (actionType === 'rejected') {
                updateApplicationStatus(uniqueKey, 'Rejected');
                try {
                    const cat = await getOrCreateCategory(guild, '🔴 Rechazadas');
                    await channel.setParent(cat.id, { lockPermissions: false });
                } catch(e) {
                    console.error('Error al mover canal a Rechazadas:', e);
                }
                await channel.send('🔴 **Entendido.** Vacante movida a la categoría **🔴 Rechazadas**. Categoría actualizada.').catch(() => {});
            }
            else if (actionType === 'draft') {
                if (jobData && jobData.reportPath) {
                    let p = jobData.reportPath;
                    if (!p.startsWith('/')) p = path.resolve(path.dirname(TRACKER_FILE), p);
                    const { coverLetter } = extractDetails(p);
                    if (coverLetter) {
                        await channel.send(`**✉️ Borrador Generado:**\n\n${coverLetter}`).catch(() => {});
                    } else {
                        await channel.send('No se encontró un borrador de correo en el reporte.').catch(() => {});
                    }
                } else {
                    await channel.send('No hay datos guardados para generar el borrador.').catch(() => {});
                }
            }
        }
    } catch (err) {
        console.error("Error en handler de interacción:", err);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    if (message.content.startsWith('!gemini ')) {
        const promptText = message.content.substring('!gemini '.length).trim();
        if (!promptText) return;
        
        await message.reply('🧠 Pensando...');
        
        // Escape double quotes and backticks safely for bash
        const safePrompt = promptText.replace(/"/g, '\\"').replace(/`/g, '\\`');
        
        exec(`agy --print "${safePrompt}"`, { cwd: '/home/opyntorr/career-ops' }, async (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return message.channel.send(`❌ Error ejecutando Antigravity: ${error.message}`);
            }
            
            const responseText = stdout || stderr || 'Sin respuesta.';
            
            // Discord message limit is 2000 chars
            const chunks = [];
            let currentChunk = '';
            for (const line of responseText.split('\n')) {
                if (currentChunk.length + line.length > 1900) {
                    chunks.push(currentChunk);
                    currentChunk = line + '\n';
                } else currentChunk += line + '\n';
            }
            if (currentChunk) chunks.push(currentChunk);

            for (const chunk of chunks) {
                await message.channel.send(chunk);
            }
        });
    }
});

client.on('error', err => {
    console.error('Discord client error (handled):', err.message);
});

process.on('unhandledRejection', reason => {
    console.error('Unhandled rejection (caught):', reason);
});

client.login(TOKEN);

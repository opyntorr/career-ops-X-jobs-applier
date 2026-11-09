#!/bin/bash
# Career-Ops Discord Bot Launcher Script
DIR="/home/opyntorr/career-ops"
cd "$DIR" || exit 1

# Load NVM or set PATH to modern Node version
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

# Fallback: Ensure modern Node version (v20+) is in PATH for GUI launches
if ! command -v node > /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
    if [ -f "$HOME/.nvm/versions/node/v20.20.2/bin/node" ]; then
        export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
    elif [ -f "$HOME/.nvm/versions/node/v24.18.0/bin/node" ]; then
        export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
    fi
fi

# Check if bot is already running
if pgrep -f "discord-bot.mjs" > /dev/null; then
    if command -v notify-send > /dev/null; then
        notify-send "Career-Ops Discord Bot" "El Bot de Discord ya se encuentra en ejecución." -i dialog-information
    fi
    echo "Discord bot is already running."
    exit 0
fi

if command -v notify-send > /dev/null; then
    notify-send "Career-Ops Discord Bot" "Iniciando Bot de Discord..." -i dialog-information
fi

# Run the bot in background logging output
nohup node discord-bot.mjs > "$DIR/discord-bot.log" 2>&1 &

sleep 2
if pgrep -f "discord-bot.mjs" > /dev/null; then
    if command -v notify-send > /dev/null; then
        notify-send "Career-Ops Discord Bot" "¡Bot de Discord iniciado correctamente!" -i dialog-positive
    fi
    echo "Discord bot started successfully."
else
    if command -v notify-send > /dev/null; then
        notify-send "Career-Ops Discord Bot" "Error al iniciar el bot. Revisa discord-bot.log" -i dialog-error
    fi
    echo "Failed to start Discord bot. Check discord-bot.log"
fi

#!/usr/bin/env bash
# Career-Ops Telegram Bot Service Launcher
# Control del bot autonomo desde terminal

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

# Detectar interprete de Python prioritariamente desde el entorno virtual local
if [ -f "$DIR/.venv/bin/python" ]; then
    PYTHON_VENV="$DIR/.venv/bin/python"
elif [ -f "$DIR/venv/bin/python" ]; then
    PYTHON_VENV="$DIR/venv/bin/python"
elif [ -f "/home/opyntorr/Jobs_Applier_AI_Agent/.venv/bin/python" ]; then
    PYTHON_VENV="/home/opyntorr/Jobs_Applier_AI_Agent/.venv/bin/python"
else
    PYTHON_VENV="$(which python3)"
fi
LOG_FILE="$DIR/data/telegram-bot.log"
PID_FILE="$DIR/data/telegram-bot.pid"

mkdir -p "$DIR/data"

status() {
    if pgrep -f "telegram_bot.py" > /dev/null; then
        echo "[STATUS] El Bot de Telegram esta EN EJECUCION."
        pgrep -a -f "telegram_bot.py"
    else
        echo "[STATUS] El Bot de Telegram esta DETENIDO."
    fi
}

start() {
    if pgrep -f "telegram_bot.py" > /dev/null; then
        echo "[INFO] El Bot de Telegram ya se encuentra en ejecucion."
        exit 0
    fi

    echo "[INFO] Iniciando Bot de Telegram en segundo plano..."
    export PYTHONPATH="$DIR"
    setsid "$PYTHON_VENV" "$DIR/telegram_bot.py" >> "$LOG_FILE" 2>&1 &
    BOT_PID=$!
    echo $BOT_PID > "$PID_FILE"
    echo $BOT_PID > "$PID_FILE"
    sleep 2

    if pgrep -f "telegram_bot.py" > /dev/null; then
        echo "[OK] Bot de Telegram iniciado exitosamente (PID: $BOT_PID)."
        echo "[LOGS] Salida registrada en $LOG_FILE"
    else
        echo "[ERROR] El Bot no pudo iniciar. Revisa los logs en $LOG_FILE"
        exit 1
    fi
}

stop() {
    if pgrep -f "telegram_bot.py" > /dev/null; then
        echo "[INFO] Deteniendo Bot de Telegram..."
        pkill -f "telegram_bot.py"
        rm -f "$PID_FILE"
        sleep 1
        echo "[OK] Bot detenido."
    else
        echo "[INFO] El Bot no estaba en ejecucion."
    fi
}

logs() {
    tail -n 30 -f "$LOG_FILE"
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 1
        start
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac

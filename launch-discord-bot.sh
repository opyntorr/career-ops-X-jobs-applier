#!/bin/bash
# Career-Ops Discord Command Center Launcher
DIR="/home/opyntorr/career-ops"
cd "$DIR" || exit 1

PYTHON="/home/opyntorr/Jobs_Applier_AI_Agent/.venv/bin/python"
LOGFILE="$DIR/discord-bot.log"
PIDFILE="$DIR/discord-bot.pid"

case "$1" in
    stop)
        if [ -f "$PIDFILE" ]; then
            PID=$(cat "$PIDFILE")
            if kill -0 "$PID" 2>/dev/null; then
                kill "$PID"
                echo "[OK] Bot de Discord detenido (PID $PID)."
            else
                echo "[Info] Proceso con PID $PID no encontrado."
            fi
            rm -f "$PIDFILE"
        else
            PIDS=$(pgrep -f "discord_bot.py")
            if [ -n "$PIDS" ]; then
                kill $PIDS
                echo "[OK] Procesos discord_bot.py detenidos."
            else
                echo "[Info] No hay ningun bot de Discord en ejecucion."
            fi
        fi
        exit 0
        ;;
    status)
        PIDS=$(pgrep -f "discord_bot.py")
        if [ -n "$PIDS" ]; then
            echo "[OK] Bot de Discord ACTIVO (PID: $PIDS)."
        else
            echo "[Inactivo] El bot de Discord NO esta en ejecucion."
        fi
        exit 0
        ;;
    logs)
        tail -n 50 -f "$LOGFILE"
        exit 0
        ;;
    *)
        PIDS=$(pgrep -f "discord_bot.py")
        if [ -n "$PIDS" ]; then
            echo "[Aviso] El bot de Discord ya se encuentra en ejecucion (PID: $PIDS)."
            exit 0
        fi

        echo "[Inicio] Arrancando Career-Ops Discord Command Center..."
        mkdir -p "$DIR/data"
        export PYTHONPATH="$DIR"
        setsid "$PYTHON" -u "$DIR/discord_bot.py" >> "$LOGFILE" 2>&1 &
        BOT_PID=$!
        echo "$BOT_PID" > "$PIDFILE"

        sleep 2
        if kill -0 "$BOT_PID" 2>/dev/null; then
            echo "[OK] Bot de Discord iniciado correctamente con PID $BOT_PID."
            echo "Logs disponibles en: $LOGFILE"
        else
            echo "[Error] No se pudo iniciar el bot de Discord. Consulta $LOGFILE."
            exit 1
        fi
        ;;
esac

#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/.venv/bin/python" ]; then
    PYTHON_VENV="$SCRIPT_DIR/.venv/bin/python"
elif [ -f "$SCRIPT_DIR/venv/bin/python" ]; then
    PYTHON_VENV="$SCRIPT_DIR/venv/bin/python"
elif [ -f "/home/opyntorr/Jobs_Applier_AI_Agent/.venv/bin/python" ]; then
    PYTHON_VENV="/home/opyntorr/Jobs_Applier_AI_Agent/.venv/bin/python"
else
    PYTHON_VENV="$(which python3)"
fi

if [ -z "$PYTHON_VENV" ]; then
    echo "Error: No se encontro un interprete de Python valido."
    exit 1
fi

exec "$PYTHON_VENV" "$SCRIPT_DIR/auto_run.py" "$@"

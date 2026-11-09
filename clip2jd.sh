#!/usr/bin/env bash
set -e

URL=""
NAME=""

# Detectar si el primer argumento es una URL
if [[ "$1" =~ ^https?:// ]]; then
    URL="$1"
    NAME="${2:-vacante-manual}"
else
    NAME="${1:-vacante-manual}"
    URL="${2:-}"
fi

# Obtener contenido del portapapeles (soporta X11 y Wayland)
TEXT=""
if command -v xclip >/dev/null 2>&1; then
    TEXT=$(xclip -selection clipboard -o 2>/dev/null || true)
elif command -v wl-paste >/dev/null 2>&1; then
    TEXT=$(wl-paste 2>/dev/null || true)
elif command -v xsel >/dev/null 2>&1; then
    TEXT=$(xsel -b -o 2>/dev/null || true)
fi

if [ -z "$TEXT" ]; then
    echo "❌ Error: El portapapeles esta vacio. Copia el texto de la vacante con Ctrl+C en el navegador primero."
    exit 1
fi

SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-z0-9]/-/g' -e 's/-\+/-/g' | cut -c 1-50)
FILEPATH="jds/${SLUG}.txt"

mkdir -p jds

{
  if [ -n "$URL" ]; then
    echo "URL: $URL"
    echo ""
  fi
  echo "$TEXT"
} > "$FILEPATH"

echo "✅ Vacante guardada en: $FILEPATH"

# Ejecutar evaluacion local con Ollama
if [ -f "ollama-eval.mjs" ]; then
    echo "🤖 Evaluando vacante con Ollama local..."
    node ollama-eval.mjs --file "$FILEPATH" || true
fi

# Notificar a Discord
if [ -f "notify-discord.mjs" ]; then
    echo "📢 Enviando notificaciones a Discord..."
    node notify-discord.mjs || true
fi

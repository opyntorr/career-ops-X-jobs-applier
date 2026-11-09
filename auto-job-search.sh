#!/usr/bin/env bash
set -e

echo "Iniciando búsqueda automatizada de empleo..."

# 1. Scraping via Apify API (Google Jobs & LinkedIn)
if [ -f "apify-scrape.mjs" ]; then
    echo "Extrayendo vacantes con Apify API..."
    node apify-scrape.mjs || true
fi

# 2. Scraping de portales estáticos (scan.mjs)
if [ -f "scan.mjs" ]; then
    echo "Escaneando portales configurados..."
    node scan.mjs || true
fi

# 3. Evaluación local con Ollama
if [ -d "jds" ]; then
    echo "Evaluando vacantes locales con Ollama..."
    for file in jds/*.txt; do
        if [ -f "$file" ]; then
            echo "Procesando $file..."
            node ollama-eval.mjs --file "$file" || true
        fi
    done
fi

# 4. Notificación a Discord
if [ -f "notify-discord.mjs" ]; then
    echo "Enviando notificaciones a Discord..."
    node notify-discord.mjs || true
fi

echo "Proceso finalizado con éxito."

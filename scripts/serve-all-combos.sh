#!/bin/bash
# Script para levantar múltiples proyectos Angular DESY en paralelo
# para visualización en el navegador.

COMBOS=(
  "01-minimal-basico:4200"
  "03-standard-sidebar:4202"
  "04-standard-subheader:4203"
  "05-standard-sidebar-subheader:4204"
  "08-advanced-all:4207"
  "09-edit-fixed:4208"
)

BASE_DIR="/tmp/desy-combos"

# Matar procesos ng serve existentes en estos puertos
for combo in "${COMBOS[@]}"; do
  port="${combo##*:}"
  pids=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pids" ]; then
    echo "🛑  Matando proceso en puerto $port"
    kill -9 $pids 2>/dev/null
  fi
done

# Matar cualquier ng serve residual
killall -9 ng 2>/dev/null || true

echo "🚀  Levantando proyectos Angular DESY..."
echo ""

for combo in "${COMBOS[@]}"; do
  name="${combo%%:*}"
  port="${combo##*:}"
  dir="$BASE_DIR/$name"

  if [ ! -d "$dir" ]; then
    echo "⚠️  $name no existe, saltando..."
    continue
  fi

  logfile="/tmp/ng-serve-$name.log"
  cd "$dir"

  # Usamos nohup para que persista y redirigimos logs
  nohup toolbox run -c backstage-dev npx ng serve --port $port --host 0.0.0.0 --disable-host-check > "$logfile" 2>&1 &
  pid=$!

  echo "  📦 $name → http://localhost:$port (PID: $pid)"
  echo "     Log: $logfile"
done

echo ""
echo "⏳  Esperando a que los servidores estén listos (compilando)..."
sleep 15

echo ""
echo "✅  Estado de los servidores:"
for combo in "${COMBOS[@]}"; do
  name="${combo%%:*}"
  port="${combo##*:}"
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port | grep -q "200"; then
    echo "   ✅ $name (puerto $port) — LISTO"
  else
    echo "   ⏳ $name (puerto $port) — compilando..."
  fi
done

echo ""
echo "🌐  URLs disponibles:"
for combo in "${COMBOS[@]}"; do
  name="${combo%%:*}"
  port="${combo##*:}"
  echo "   http://localhost:$port  →  $name"
done

#!/bin/bash
# Levanta un único proyecto Angular DESY generado por test-all-combos.cjs
# Uso:
#   ./scripts/serve-one.sh <nombre-combo> [puerto]
#
# Ejemplos:
#   ./scripts/serve-one.sh 01-minimal-basico
#   ./scripts/serve-one.sh 03-standard-sidebar 4202
#   ./scripts/serve-one.sh 12-ens-alto-full 4211

COMBO_NAME="${1:-02-standard-basico}"
PORT="${2:-4200}"
BASE_DIR="/tmp/desy-combos"
DIR="$BASE_DIR/$COMBO_NAME"

if [ ! -d "$DIR" ]; then
  echo "❌  No existe el proyecto: $DIR"
  echo "    Ejecuta primero: toolbox run -c backstage-dev node scripts/test-all-combos.cjs"
  exit 1
fi

# Matar cualquier proceso en ese puerto
pids=$(lsof -ti :$PORT 2>/dev/null)
if [ -n "$pids" ]; then
  echo "🛑  Matando proceso en puerto $PORT"
  kill -9 $pids 2>/dev/null
fi

echo "🚀  Levantando $COMBO_NAME en http://localhost:$PORT"
echo "    Presiona Ctrl+C para detener"
echo ""

cd "$DIR"
toolbox run -c backstage-dev npx ng serve --port $PORT --host 0.0.0.0 --disable-host-check

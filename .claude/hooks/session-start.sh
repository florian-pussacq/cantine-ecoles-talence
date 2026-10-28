#!/bin/bash
# Prépare une session Claude Code dans le cloud : l'outillage qu'exigent les
# vérifications de CLAUDE.md, aux versions que le dépôt déclare.
#
# - Node : celui de `.nvmrc`, comme la CI et Netlify. Le conteneur en fournit un
#   autre, hors des `engines`, dont le npm échoue sur ce verrou.
# - Chromium : celui qu'attend la version de `@playwright/test` du verrou, et pas
#   celui préinstallé dans le conteneur. Un navigateur d'une autre révision ferait
#   passer ou échouer les tests de bout en bout pour d'autres raisons qu'en CI.
#
# Sans effet hors du cloud : sur un poste, chacun gère son outillage.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

export NVM_DIR="${NVM_DIR:-/opt/nvm}"
# nvm.sh lit des variables non définies : il ne supporte pas `set -u`.
set +u
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
nvm install >/dev/null
nvm use >/dev/null
set -u

# La session doit trouver ce Node-là, et non celui du conteneur.
echo "export PATH=\"$(dirname "$(nvm which current)"):\$PATH\"" >> "$CLAUDE_ENV_FILE"

npm install --no-audit --no-fund
pip install --quiet --root-user-action=ignore -r scripts/requirements.txt

if ! npx playwright install chromium; then
  cat <<'MSG'
Chromium de Playwright NON installé : le réseau du conteneur refuse sans doute
cdn.playwright.dev. `npm run test:e2e` échouera tant que ce domaine n'est pas
autorisé (réglages de l'environnement cloud → Network access → Allowed domains).
Ne pas le remplacer par le Chromium préinstallé : sa révision diffère de celle
que la CI utilise.
MSG
fi

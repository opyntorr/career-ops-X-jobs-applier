#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "Validating JSON syntax..."
node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"

echo "Packaging Career-Ops FastApply extension..."
rm -f career-ops-autofill.zip career-ops-autofill.xpi
zip -r career-ops-autofill.zip manifest.json profile.js content.js styles.css popup.html popup.js icons/
cp career-ops-autofill.zip career-ops-autofill.xpi

echo "Build successful: career-ops-autofill.zip / career-ops-autofill.xpi ready!"

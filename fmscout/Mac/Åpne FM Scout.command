#!/bin/bash
# Reserveutgang: gjør akkurat det samme som appen, men startes fra Terminal,
# som slipper unna App Translocation. Nyttig hvis appen ikke vil starte.
HER="$(cd "$(dirname "$0")" && pwd)"
exec "$HER/FM Scout.app/Contents/MacOS/fmscout"

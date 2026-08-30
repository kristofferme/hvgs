#!/bin/bash
# Lager en rapport om hva som ligger i en savefil, uten å prøve å åpne den.
# Rapporten havner på skrivebordet, og er ment å sendes videre når noe stopper.
HER="$(cd "$(dirname "$0")" && pwd)"
export FMSCOUT_KOMMANDO=sjekk
exec "$HER/FM Scout.app/Contents/MacOS/fmscout"

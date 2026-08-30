#!/usr/bin/env python3
"""Terminal-inngangen til fmscout.

Selve koden ligger inne i Mac-appen, under
«Mac/FM Scout.app/Contents/Resources». Det er ikke der man vanligvis legger en
Python-pakke, og grunnen er verdt å vite om: macOS kopierer nedlastede apper til
et midlertidig, skrivebeskyttet sted og kjører dem derfra – uten mappa rundt.
Ligger koden ved siden av appen, ser appen den ikke. Ligger den inni, blir den
med. Så det er én kopi av koden, og den bor der appen kan nå den.

Denne fila gjør at det ikke merkes fra terminalen:

    python3 fmscout.py åpne save.fm
"""

from __future__ import annotations

import runpy
import sys
from pathlib import Path

KODE = Path(__file__).resolve().parent / "Mac" / "FM Scout.app" / "Contents" / "Resources"

if not (KODE / "fmscoutlib").is_dir():
    sys.exit(f"Fant ikke koden. Den skal ligge i {KODE}")

sys.path.insert(0, str(KODE))
runpy.run_path(str(KODE / "fmscout.py"), run_name="__main__")

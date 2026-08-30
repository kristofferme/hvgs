"""Strenger i utpakkede blokker.

Her ligger bare det som skal lete etter tekst i rådata: lese en streng som står
på et bestemt sted, og ta en stikkprøve av hva slags tekst en blokk inneholder.
Selve strengtabellen bygges i profil.Strengpool.
"""

from __future__ import annotations

import re

LESBAR = re.compile(rb"[\x20-\x7e\x80-\xff]{3,64}")
_BOKSTAV = re.compile(r"[^\W\d_]")


def _ser_ut_som_tekst(s: str) -> bool:
    if len(s) < 3 or "\ufffd" in s:
        return False
    bokstaver = len(_BOKSTAV.findall(s))
    if bokstaver < max(3, int(0.7 * len(s))):
        return False
    # Tilfeldige bytes gir gjerne lange rekker med store bokstaver om hverandre.
    return not (len(s) > 5 and s.isupper() and " " not in s)


def les_fast_streng(data, offset: int, lengde: int) -> str | None:
    """Leser en streng lagret i et fast antall bytes (nullfylt)."""
    if offset < 0 or offset + lengde > len(data):
        return None
    rå = bytes(data[offset:offset + lengde])
    null = rå.find(b"\x00")
    if null >= 0:
        rå = rå[:null]
    s = rå.decode("utf-8", "replace").strip()
    return s if _ser_ut_som_tekst(s) else None


_VOKALER = set("aeiouyæøåéèóàáíúüö")


def _ser_ut_som_ord(s: str) -> bool:
    """Strengere enn _ser_ut_som_tekst – for smakebitene i «sjekk».

    Tilfeldige bytes blir fort til fire tegn som teknisk sett er bokstaver.
    Krav om vokal, små bokstaver og latinsk skrift luker vekk nesten alt.
    """
    if len(s) < 5:
        return False
    for c in s:
        if c in " .'-":
            continue
        if not c.isalpha() or ord(c) > 0x17F:
            return False
    if sum(1 for c in s if c.islower()) < 2:
        return False
    return any(c.lower() in _VOKALER for c in s)


def stikkprove(data, antall: int = 40, hopp: int = 0) -> list[str]:
    """Et lite utvalg lesbare strenger – til «sjekk»-rapporten."""
    ut: list[str] = []
    sett = set()
    for m in LESBAR.finditer(data, hopp):
        try:
            s = m.group(0).decode("utf-8").strip()
        except UnicodeDecodeError:
            continue
        if _ser_ut_som_ord(s) and s not in sett:
            sett.add(s)
            ut.append(s)
            if len(ut) >= antall:
                break
    return ut

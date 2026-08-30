"""Én vei inn: gi meg en fil, få et datasett.

Filendelsen bestemmer hva som skjer. .fm går gjennom beholderen og et skjema,
alt annet leses som en eksport fra FM.
"""

from __future__ import annotations

from pathlib import Path

from .beholder import Beholder
from .datasett import Datasett
from .felles import arbeidsmappe, filnokkel, si
from .kalibrer import kalibrer
from .leseksport import les_eksport
from .profil import Profil

EKSPORTENDELSER = {".html", ".htm", ".rtf", ".csv", ".tsv", ".txt"}


def skjemamappe() -> Path:
    mappe = arbeidsmappe() / "profiler"
    mappe.mkdir(parents=True, exist_ok=True)
    return mappe


def skjema_for(sti: Path) -> Path:
    """Der skjemaet for akkurat denne saven havner."""
    return skjemamappe() / f"{sti.stem}-{filnokkel(sti)}.json"


def last_save(sti: Path, *, skjema=None, ankere=None, tving_kalibrering: bool = False,
              grense: int | None = None, melding=si) -> Datasett:
    beholder = Beholder.apne(sti, melding=melding)
    merknader: list[str] = []
    if skjema:
        profil = Profil.last(skjema)
    else:
        lagret = skjema_for(sti)
        if lagret.exists() and not tving_kalibrering:
            profil = Profil.last(lagret)
            melding(f"Bruker skjemaet fra {lagret}")
        else:
            melding("Ingen skjema for denne saven ennå – kalibrerer.")
            profil, rapport = kalibrer(beholder, ankere, melding=melding)
            profil.lagre(lagret)
            melding(f"Skjema lagret: {lagret}")
            merknader = rapport.get("merknader", [])
    rader = list(profil.les(beholder, grense=grense, melding=melding))
    if not rader:
        raise RuntimeError("Skjemaet ga ingen spillere. Kjør «kalibrer» på nytt.")
    return Datasett(rader, navn=sti.name, kilde=str(sti), merknader=merknader)


def last_eksport(stier: list[Path], *, melding=si) -> Datasett:
    rader: list[dict] = []
    merknader: list[str] = []
    navn = []
    for sti in stier:
        del_, info = les_eksport(sti)
        if info.get("feil"):
            raise RuntimeError(f"{sti.name}: {info['feil']}")
        melding(f"{sti.name}: {len(del_)} spillere, {info['gjenkjent']} av "
                f"{info['kolonner']} kolonner gjenkjent")
        if info.get("ukjente_kolonner"):
            merknader.append(
                f"{sti.name}: hoppet over kolonnene "
                + ", ".join(info["ukjente_kolonner"][:8])
            )
        rader.extend(del_)
        navn.append(sti.name)
    # Samme spiller i to eksporter: behold den med flest utfylte felt.
    beste: dict[tuple, dict] = {}
    for rad in rader:
        nokkel = (rad.get("id") or rad.get("navn"), rad.get("klubb"))
        gammel = beste.get(nokkel)
        if gammel is None or len(rad) > len(gammel):
            beste[nokkel] = rad
    ut = list(beste.values())
    if len(ut) < len(rader):
        merknader.append(f"{len(rader) - len(ut)} dobbeloppføringer slått sammen")
    return Datasett(ut, navn=" + ".join(navn), kilde=", ".join(str(s) for s in stier),
                    merknader=merknader)


def last(stier, *, skjema=None, ankere=None, tving_kalibrering=False,
         grense=None, melding=si) -> Datasett:
    stier = [Path(s).expanduser() for s in (stier if isinstance(stier, (list, tuple)) else [stier])]
    for sti in stier:
        if not sti.exists():
            raise FileNotFoundError(f"Fant ikke {sti}")
    saver = [s for s in stier if s.suffix.lower() == ".fm"]
    if saver and len(stier) > 1:
        raise RuntimeError("Åpne én save om gangen (eksportfiler kan du gjerne slå sammen).")
    if saver:
        return last_save(saver[0], skjema=skjema, ankere=ankere,
                         tving_kalibrering=tving_kalibrering, grense=grense, melding=melding)
    return last_eksport(stier, melding=melding)

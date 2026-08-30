"""Én vei inn: gi meg en fil, få et datasett.

Filendelsen bestemmer hva som skjer. .fm går gjennom beholderen og et skjema,
alt annet leses som en eksport fra FM.

Økt-klassen holder på det som er åpent akkurat nå, slik at nettsida kan bytte
fil og kalibrere på nytt uten at noe må startes om.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from .beholder import Beholder
from .datasett import Datasett
from .felles import arbeidsmappe, filnokkel, si
from .kalibrer import Anker, kalibrer
from .leseksport import les_eksport
from .profil import Profil
from .rapport import skriv_rapport

EKSPORTENDELSER = {".html", ".htm", ".rtf", ".csv", ".tsv", ".txt"}


def skjemamappe() -> Path:
    mappe = arbeidsmappe() / "profiler"
    mappe.mkdir(parents=True, exist_ok=True)
    return mappe


def skjema_for(sti: Path) -> Path:
    """Der skjemaet for akkurat denne saven havner."""
    return skjemamappe() / f"{sti.stem}-{filnokkel(sti)}.json"


def _rader(profil: Profil, beholder: Beholder, grense, melding) -> list[dict]:
    rader = list(profil.les(beholder, grense=grense, melding=melding))
    if not rader:
        raise RuntimeError("Skjemaet ga ingen spillere. Kalibrer saven på nytt.")
    return rader


def last_save(sti: Path, *, skjema=None, ankere=None, tving_kalibrering: bool = False,
              grense: int | None = None, melding=si) -> tuple[Datasett, Beholder]:
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
            try:
                profil, rapport = kalibrer(beholder, ankere, melding=melding)
            except RuntimeError as e:
                # Det hjelper ingen å bare få vite at det ikke gikk. Skriv ned
                # hva som faktisk ligger i fila, så er det noe å gå videre på.
                melding("Skriver en rapport om hva som ligger i fila …")
                fil = skriv_rapport(sti, melding=melding)
                raise RuntimeError(
                    f"{e}\n\nJeg skrev en rapport om hva fila inneholder:\n{fil}"
                ) from e
            profil.lagre(lagret)
            melding(f"Skjema lagret: {lagret}")
            merknader = rapport.get("merknader", [])
    datasett = Datasett(_rader(profil, beholder, grense, melding),
                        navn=sti.name, kilde=str(sti), merknader=merknader)
    return datasett, beholder


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
    if not rader:
        raise RuntimeError("Fant ingen spillere i fila.")
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


def _rydd(stier) -> list[Path]:
    stier = [Path(s).expanduser() for s in
             (stier if isinstance(stier, (list, tuple)) else [stier])]
    for sti in stier:
        if not sti.exists():
            raise FileNotFoundError(f"Fant ikke {sti}")
    saver = [s for s in stier if s.suffix.lower() == ".fm"]
    if saver and len(stier) > 1:
        raise RuntimeError("Åpne én save om gangen (eksportfiler kan du gjerne slå sammen).")
    return stier


def last(stier, *, skjema=None, ankere=None, tving_kalibrering=False,
         grense=None, melding=si) -> Datasett:
    stier = _rydd(stier)
    if stier[0].suffix.lower() == ".fm":
        return last_save(stier[0], skjema=skjema, ankere=ankere,
                         tving_kalibrering=tving_kalibrering,
                         grense=grense, melding=melding)[0]
    return last_eksport(stier, melding=melding)


@dataclass
class Okt:
    """Det som er åpent nå. Nettsida bytter fil og kalibrerer gjennom denne."""

    datasett: Datasett
    sti: Path | None = None
    beholder: Beholder | None = None
    logg: list[str] = field(default_factory=list)

    @classmethod
    def apne(cls, stier, *, skjema=None, grense=None, melding=si) -> "Okt":
        stier = _rydd(stier)
        if stier[0].suffix.lower() == ".fm":
            datasett, beholder = last_save(stier[0], skjema=skjema,
                                           grense=grense, melding=melding)
            return cls(datasett, stier[0], beholder)
        return cls(last_eksport(stier, melding=melding), stier[0])

    @property
    def kan_kalibreres(self) -> bool:
        return self.beholder is not None

    def bytt_fil(self, stier, *, melding=si) -> "Okt":
        ny = Okt.apne(stier, melding=melding)
        self.datasett, self.sti, self.beholder = ny.datasett, ny.sti, ny.beholder
        return self

    def kalibrer_med(self, ankere: list[Anker], *, melding=si) -> dict:
        """Kjører kalibreringa på nytt med nye ankere og laster spillerne om."""
        if not self.kan_kalibreres:
            raise RuntimeError("Kalibrering gjelder bare .fm-filer.")
        profil, rapport = kalibrer(self.beholder, ankere, melding=melding)
        profil.lagre(skjema_for(self.sti))
        self.datasett = Datasett(_rader(profil, self.beholder, None, melding),
                                 navn=self.sti.name, kilde=str(self.sti),
                                 merknader=rapport.get("merknader", []))
        return rapport

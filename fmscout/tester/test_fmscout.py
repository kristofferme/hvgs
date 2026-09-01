"""Tester for fmscout.

Den viktigste av dem er test_kalibrering_finner_alt: den lager en fil med samme
form som en FM-save – zlib-blokker, strengpool, en tabell med like store
records – og sjekker at kalibreringa finner igjen alle spillerne uten at et
eneste offset er skrevet inn i koden på forhånd.

    python3 -m unittest discover -s tester
"""

from __future__ import annotations

import json
import os
import tempfile
import unittest
import urllib.request
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
KODE = ROT / "Mac" / "FM Scout.app" / "Contents" / "Resources"
os.sys.path.insert(0, str(KODE))
_MIDLERTIDIG = tempfile.mkdtemp(prefix="fmscout-test-")
os.environ["FMSCOUT_HOME"] = _MIDLERTIDIG

from fmscoutlib import csvut                                        # noqa: E402
from fmscoutlib.beholder import Beholder                            # noqa: E402
from fmscoutlib.datasett import Datasett                            # noqa: E402
from fmscoutlib.demo import (DEMOATTRIBUTTER, lag_demosave,         # noqa: E402
                             lag_demospillere)
from fmscoutlib.felles import flat, les_penger, les_tall            # noqa: E402
from fmscoutlib.kalibrer import Anker, kalibrer                     # noqa: E402
from fmscoutlib.leseksport import les_eksport                       # noqa: E402
from fmscoutlib import pakking                                      # noqa: E402
from fmscoutlib.profil import Profil, Strengpool                    # noqa: E402
from fmscoutlib.spillere import fullfor, les_posisjoner             # noqa: E402
from fmscoutlib.tabeller import finn_evnekandidater, finn_tabeller  # noqa: E402

ANTALL = 400


class Save(unittest.TestCase):
    """Alt som handler om å lese en .fm-fil."""

    @classmethod
    def setUpClass(cls):
        cls.mappe = Path(tempfile.mkdtemp(prefix="fmscout-save-"))
        cls.sti, cls.profil = lag_demosave(cls.mappe / "test.fm", antall=ANTALL)
        cls.fasit = lag_demospillere(ANTALL)
        cls.beholder = Beholder.apne(cls.sti, tving=True, melding=lambda *_: None)

    def test_beholderen_finner_blokkene(self):
        self.assertEqual(len(self.beholder), 4)
        self.assertGreater(self.beholder.utpakket, ANTALL * 160)

    def test_beholderen_bruker_mellomlageret(self):
        på_nytt = Beholder.apne(self.sti, melding=lambda *_: None)
        self.assertEqual([b.storrelse for b in på_nytt.blokker],
                         [b.storrelse for b in self.beholder.blokker])

    def test_tabellen_blir_funnet(self):
        tabeller = finn_tabeller(self.beholder)
        self.assertTrue(tabeller)
        tabell = tabeller[0]
        self.assertEqual(tabell.stride, 160)
        self.assertEqual(tabell.antall, ANTALL)
        self.assertEqual(tabell.stripeoffset, 48)
        self.assertEqual(tabell.stripelengde, len(DEMOATTRIBUTTER))

    def test_ca_og_pa_kjennes_igjen(self):
        tabell = finn_tabeller(self.beholder)[0]
        kandidater = finn_evnekandidater(self.beholder.data(tabell.blokk), tabell)
        ca = next(k for k in kandidater if k.slag == "ca")
        pa = next(k for k in kandidater if k.slag == "pa")
        self.assertEqual(ca.offset, 8)
        self.assertEqual(pa.offset, 9)
        self.assertGreater(ca.korrelasjon, 0.8)

    def test_skjemaet_leser_alle_spillerne(self):
        rader = list(Profil.fra_dict(self.profil).les(self.beholder))
        self.assertEqual(len(rader), ANTALL)
        for lest, fasit in zip(rader, self.fasit):
            self.assertEqual(lest["navn"], fasit["navn"])
            self.assertEqual(lest["klubb"], fasit["klubb"])
            self.assertEqual(lest["ca"], fasit["ca"])
            self.assertEqual(lest["passing"], fasit["passing"])

    def test_pa_som_intervall_blir_merket(self):
        rader = list(Profil.fra_dict(self.profil).les(self.beholder))
        anslag = [r for r in rader if r.get("pa_anslag")]
        self.assertTrue(anslag, "demofila skal ha noen PA lagret som intervall")
        for rad in anslag:
            self.assertLessEqual(rad["pa"], 200)
            self.assertGreaterEqual(rad["pa"], rad["ca"])

    def test_kalibrering_finner_alt(self):
        ankere = [
            Anker(p["navn"], {k: p[k] for k in DEMOATTRIBUTTER}, p["alder"],
                  p["klubb"], p["nasjonalitet"], p["posisjoner"])
            for p in (self.fasit[i] for i in (3, 55, 210, 380, 399))
        ]
        profil, rapport = kalibrer(self.beholder, ankere, melding=lambda *_: None)
        self.assertEqual(rapport["attributter_navngitt"], len(DEMOATTRIBUTTER))
        self.assertEqual(rapport["attributter_ukjent"], 0)
        self.assertEqual(rapport["tvil"], [])
        rader = list(profil.les(self.beholder))
        self.assertEqual(len(rader), ANTALL)
        for felt in ("navn", "klubb", "nasjonalitet", "posisjoner", "alder", "ca",
                     "passing", "pace", "aerial_reach"):
            like = sum(1 for lest, fasit in zip(rader, self.fasit)
                       if lest.get(felt) == fasit.get(felt))
            self.assertEqual(like, ANTALL, f"{felt} stemmer bare for {like} av {ANTALL}")

    def test_faa_ankere_gir_heller_ingen_navn_enn_feil_navn(self):
        """To ankere med få tall skal la det tvetydige stå åpent, ikke gjette."""
        ankere = [
            Anker(p["navn"], {k: p[k] for k in DEMOATTRIBUTTER[:12]}, p["alder"],
                  p["klubb"], p["nasjonalitet"], p["posisjoner"])
            for p in (self.fasit[i] for i in (7, 123))
        ]
        profil, rapport = kalibrer(self.beholder, ankere, melding=lambda *_: None)
        rader = list(profil.les(self.beholder))
        navngitte = [n for n in profil.attributter if not n.startswith("attributt_")]
        self.assertTrue(navngitte, "noe skal la seg navngi med to ankere")
        for nokkel in navngitte:
            like = sum(1 for lest, fasit in zip(rader, self.fasit)
                       if lest.get(nokkel) == fasit.get(nokkel))
            self.assertEqual(like, ANTALL, f"{nokkel} fikk feil navn")
        self.assertTrue(rapport["tvil"], "det uavklarte skal rapporteres")

    def test_tre_ankere_holder_til_full_navngiving(self):
        ankere = [
            Anker(p["navn"], {k: p[k] for k in DEMOATTRIBUTTER[:12]}, p["alder"],
                  p["klubb"], p["nasjonalitet"], p["posisjoner"])
            for p in (self.fasit[i] for i in (7, 123, 55))
        ]
        _, rapport = kalibrer(self.beholder, ankere, melding=lambda *_: None)
        self.assertEqual(rapport["attributter_navngitt"], 12)
        self.assertEqual(rapport["tvil"], [])

    def test_kalibrering_uten_ankere_gir_nummererte_attributter(self):
        profil, rapport = kalibrer(self.beholder, [], melding=lambda *_: None)
        self.assertEqual(rapport["attributter_navngitt"], 0)
        self.assertTrue(all(n.startswith("attributt_") for n in profil.attributter))
        self.assertIn("ca", profil.felt)

    def test_skjema_kan_lagres_og_lastes(self):
        sti = Path(self.mappe) / "skjema.json"
        Profil.fra_dict(self.profil).lagre(sti)
        igjen = Profil.last(sti)
        self.assertEqual(igjen.stride, 160)
        self.assertEqual(igjen.attributter, self.profil["attributter"])


@unittest.skipIf(pakking.tilgjengelig() is None, "ingen zstd på denne maskinen")
class Zstdsave(unittest.TestCase):
    """FM26 pakker med zstd, i tusenvis av små rammer.

    Det som skiller denne fra zlib-saven er at rammene til sammen er én lang
    strøm. Settes de ikke sammen igjen, blir spillertabellen klippet i biter på
    hver rammegrense – og da finnes den ikke.
    """

    ANTALL = 3000

    @classmethod
    def setUpClass(cls):
        cls.mappe = Path(tempfile.mkdtemp(prefix="fmscout-zstd-"))
        cls.sti, cls.profil = lag_demosave(cls.mappe / "fm26.fm",
                                           antall=cls.ANTALL, metode="zstd")
        cls.fasit = lag_demospillere(cls.ANTALL)
        cls.beholder = Beholder.apne(cls.sti, tving=True, melding=lambda *_: None)

    def test_fila_ser_ut_som_en_fm26save(self):
        hode = self.sti.open("rb").read(6)
        self.assertEqual(hode[2:6], b"fmf.")

    def test_rammene_settes_sammen_til_en_blokk(self):
        self.assertEqual(len(self.beholder), 1)
        blokk = self.beholder.blokker[0]
        self.assertEqual(blokk.metode, "zstd")
        self.assertGreater(blokk.rammer, 10, "fila skal bestå av mange rammer")
        self.assertGreater(blokk.storrelse, self.ANTALL * 160)

    def test_skjemaet_leser_alle_spillerne(self):
        rader = list(Profil.fra_dict(self.profil).les(self.beholder))
        self.assertEqual(len(rader), self.ANTALL)
        for lest, fasit in zip(rader, self.fasit):
            self.assertEqual(lest["navn"], fasit["navn"])
            self.assertEqual(lest["ca"], fasit["ca"])
            self.assertEqual(lest["passing"], fasit["passing"])

    def test_kalibrering_finner_spillerne(self):
        ankere = [
            Anker(p["navn"], {k: p[k] for k in DEMOATTRIBUTTER[:12]}, p["alder"],
                  p["klubb"], p["nasjonalitet"], p["posisjoner"])
            for p in (self.fasit[i] for i in (7, 1230, self.ANTALL - 1))
        ]
        profil, rapport = kalibrer(self.beholder, ankere, melding=lambda *_: None)
        rader = list(profil.les(self.beholder))
        self.assertEqual(len(rader), self.ANTALL)
        # Alt som får navn skal være riktig – heller unavngitt enn feil.
        navngitte = [n for n in profil.attributter if not n.startswith("attributt_")]
        self.assertGreaterEqual(len(navngitte), 8)
        for nokkel in navngitte + ["navn", "klubb", "nasjonalitet", "alder", "ca"]:
            like = sum(1 for lest, fasit in zip(rader, self.fasit)
                       if lest.get(nokkel) == fasit.get(nokkel))
            self.assertEqual(like, self.ANTALL, f"{nokkel} stemmer bare for {like}")

    def test_anker_i_halen_forveksles_ikke_med_navnebror(self):
        """Den siste spilleren har navnebrødre lenger framme i tabellen.

        Attributtverdiene alene skiller dem ikke – tolv tall mellom 1 og 20
        treffer like godt hos en tilfeldig navnebror. Klubben gjør det.
        """
        siste = self.fasit[self.ANTALL - 1]
        ankere = [
            Anker(p["navn"], {k: p[k] for k in DEMOATTRIBUTTER[:12]}, p["alder"],
                  p["klubb"], p["nasjonalitet"], p["posisjoner"])
            for p in (self.fasit[7], self.fasit[1230], siste)
        ]
        profil, rapport = kalibrer(self.beholder, ankere, melding=lambda *_: None)
        self.assertEqual(len(rapport["ankere_funnet"]), 3)
        rader = list(profil.les(self.beholder))
        self.assertEqual(rader[self.ANTALL - 1]["navn"], siste["navn"])
        self.assertEqual(rader[self.ANTALL - 1]["klubb"], siste["klubb"])


class Pakkemetoder(unittest.TestCase):
    def test_zstd_finnes_eller_sies_klart_ifra(self):
        navn = pakking.tilgjengelig()
        self.assertTrue(navn is None or isinstance(navn, str))

    @unittest.skipIf(pakking.tilgjengelig() is None, "ingen zstd på denne maskinen")
    def test_ramme_gir_eksakt_lengde(self):
        motor = pakking.motor()
        pakket = motor.komprimer(b"fmscout " * 500)
        ramme = pakking.pakk_ut_ramme(pakket + b"etterslep", 0)
        self.assertEqual(ramme.data, b"fmscout " * 500)
        self.assertEqual(ramme.brukt, len(pakket))


class Strenger(unittest.TestCase):
    def test_poolen_finner_både_offset_og_nummer(self):
        import struct
        rå = bytearray()
        plass = []
        for ord_ in ("Hustadvika FK", "Averøy IL", "Ødegård"):
            plass.append(len(rå))
            b = ord_.encode("utf-8")
            rå.extend(struct.pack("<I", len(b)))
            rå.extend(b)
        pool = Strengpool(bytes(rå))
        self.assertEqual(len(pool), 3)
        self.assertEqual(pool.ved_offset(plass[1]), "Averøy IL")
        self.assertEqual(pool.ved_indeks(2), "Ødegård")
        self.assertIsNone(pool.ved_indeks(9))


class Verdier(unittest.TestCase):
    def test_posisjoner(self):
        self.assertEqual(les_posisjoner("D (RC), DM"), ["DR", "DC", "DM"])
        self.assertEqual(les_posisjoner("M/AM (C)"), ["MC", "AMC"])
        self.assertEqual(les_posisjoner("ST (C)"), ["ST"])
        self.assertEqual(les_posisjoner("AMR, AMC, AML"), ["AMR", "AMC", "AML"])
        self.assertEqual(les_posisjoner("D/WB (RL)"), ["DR", "DL", "WBR", "WBL"])
        self.assertEqual(les_posisjoner(""), [])

    def test_penger(self):
        self.assertEqual(les_penger("£1.2M")[0], 1_200_000)
        self.assertEqual(les_penger("€12,000 p/w")[0], 12_000)
        self.assertEqual(les_penger("kr 3 500 000")[0], 3_500_000)
        self.assertEqual(les_penger("£1M - £3M")[0], 2_000_000)
        self.assertIsNone(les_penger("N/A")[0])
        self.assertEqual(les_penger("£450K")[1], "£")

    def test_tall_og_flat(self):
        self.assertEqual(les_tall("183 cm"), 183)
        self.assertIsNone(les_tall("-"))
        self.assertEqual(flat("Ødegaard, Martin"), "degaard martin")

    def test_avledede_felt(self):
        rad = fullfor({"navn": "A", "ca": 120, "pa": 160, "passing": 15,
                       "vision": 13, "posisjoner": "M (C)"})
        self.assertEqual(rad["rom"], 40)
        self.assertEqual(rad["posisjonsliste"], ["MC"])
        self.assertEqual(rad["snitt_teknisk"], 15.0)


class Eksportimport(unittest.TestCase):
    def setUp(self):
        self.mappe = Path(tempfile.mkdtemp(prefix="fmscout-eksport-"))

    def test_html(self):
        sti = self.mappe / "e.html"
        sti.write_text(
            "<table>"
            "<tr><th>Name</th><th>Age</th><th>Club</th><th>Position</th>"
            "<th>Value</th><th>Acc</th><th>Fin</th><th>Left Foot</th></tr>"
            "<tr><td>Martin Berg</td><td>21</td><td>Hustadvika FK</td>"
            "<td>AM (RLC)</td><td>&#163;1.2M</td><td>16</td><td>12-15</td>"
            "<td>Very Strong</td></tr>"
            "</table>", encoding="utf-8")
        rader, info = les_eksport(sti)
        self.assertEqual(info["form"], "html")
        self.assertEqual(len(rader), 1)
        rad = rader[0]
        self.assertEqual(rad["navn"], "Martin Berg")
        self.assertEqual(rad["verdi"], 1_200_000)
        self.assertEqual(rad["acceleration"], 16)
        self.assertEqual(rad["finishing"], 14)      # midt i intervallet 12–15
        self.assertEqual(rad["fot_venstre"], 20)
        self.assertEqual(rad["posisjonsliste"], ["AMR", "AMC", "AML"])

    def test_rtf(self):
        sti = self.mappe / "e.rtf"
        sti.write_text(
            "{\\rtf1\\ansi\\par | Name | Age | Club | CA | PA |"
            "\\par |---|---|---|---|---|"
            "\\par | Erling H\\'f8y | 19 | Bud BK | 145 | 180 |\\par }",
            encoding="cp1252")
        rader, info = les_eksport(sti)
        self.assertEqual(info["form"], "rtf")
        self.assertEqual(rader[0]["navn"], "Erling Høy")
        self.assertEqual(rader[0]["rom"], 35)

    def test_csv_og_tvetydig_nat(self):
        sti = self.mappe / "e.csv"
        sti.write_text("Name;Age;Nat;Club\nOla Vik;29;Norge;Averøy IL\n", encoding="utf-8")
        rader, _ = les_eksport(sti)
        self.assertEqual(rader[0]["nasjonalitet"], "Norge")

        sti2 = self.mappe / "e2.csv"
        sti2.write_text("Name;Age;Nat;Pac\nOla Vik;29;14;13\n", encoding="utf-8")
        rader2, _ = les_eksport(sti2)
        self.assertEqual(rader2[0]["natural_fitness"], 14)

    def test_uten_navnekolonne_gir_beskjed(self):
        sti = self.mappe / "tom.csv"
        sti.write_text("Age;Club\n21;Bud BK\n", encoding="utf-8")
        rader, info = les_eksport(sti)
        self.assertEqual(rader, [])
        self.assertIn("navnekolonne", info["feil"])


class Tabellen(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.datasett = Datasett(lag_demospillere(300), navn="test")

    def test_meta(self):
        meta = self.datasett.meta()
        self.assertEqual(meta["antall"], 300)
        self.assertIn("klubb", meta["fasetter"])
        self.assertTrue(meta["posisjoner"])
        self.assertIn("ca", meta["grenser"])

    def test_filtrering(self):
        svar = self.datasett.sok({"omrader": {"ca": {"min": 140}}})
        self.assertTrue(all(r[svar["kolonner"].index("ca") + 1] >= 140 for r in svar["rader"]))
        self.assertEqual(svar["total"],
                         sum(1 for r in self.datasett.rader if r["ca"] >= 140))

    def test_posisjonsfilter(self):
        en = self.datasett.sok({"posisjoner": ["MC", "AMC"], "posisjonsmodus": "en"})
        alle = self.datasett.sok({"posisjoner": ["MC", "AMC"], "posisjonsmodus": "alle"})
        self.assertGreaterEqual(en["total"], alle["total"])

    def test_attributtkrav_og_tekst(self):
        svar = self.datasett.sok({"attributtkrav": [{"nokkel": "passing", "min": 15}]})
        self.assertEqual(svar["total"],
                         sum(1 for r in self.datasett.rader if (r.get("passing") or 0) >= 15))
        klubb = self.datasett.rader[0]["klubb"]
        treff = self.datasett.sok({"tekst": klubb})
        self.assertTrue(treff["total"] >= 1)

    def test_sortering_og_paginering(self):
        svar = self.datasett.sok({"sortering": [{"nokkel": "ca", "retning": "ned"}],
                                  "kolonner": ["navn", "ca"], "sidestorrelse": 10})
        verdier = [r[2] for r in svar["rader"]]
        self.assertEqual(verdier, sorted(verdier, reverse=True))
        self.assertEqual(len(svar["rader"]), 10)
        side2 = self.datasett.sok({"sortering": [{"nokkel": "ca", "retning": "ned"}],
                                   "kolonner": ["navn", "ca"], "sidestorrelse": 10, "side": 1})
        self.assertLessEqual(side2["rader"][0][2], verdier[-1])

    def test_tomme_kolonner_skjules(self):
        rader = [fullfor({"navn": "A", "ca": 100})]
        d = Datasett(rader)
        self.assertIn("lonn", d.tomme)
        self.assertNotIn("lonn", [k["nokkel"] for k in d.meta()["kolonner"]])


class CsvUt(unittest.TestCase):
    def test_semikolon_og_desimalkomma(self):
        rader = [fullfor({"navn": "Ø. Berg", "ca": 150, "snittkarakter": 7.25})]
        tekst = csvut.til_tekst(rader, ["navn", "ca", "snittkarakter"])
        linjer = tekst.strip().splitlines()
        self.assertEqual(linjer[0], "Navn;CA;Snitt")
        self.assertEqual(linjer[1], "Ø. Berg;150;7,25")

    def test_komma_gir_punktum(self):
        rader = [fullfor({"navn": "A", "snittkarakter": 7.25})]
        tekst = csvut.til_tekst(rader, ["navn", "snittkarakter"], skilletegn=",")
        self.assertIn("7.25", tekst)


class Tjeneren(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import threading
        from http.server import ThreadingHTTPServer

        from fmscoutlib.last import Okt
        from fmscoutlib.tjener import Handler, ledig_port
        Handler.okt = Okt(Datasett(lag_demospillere(120), navn="test.fm", kilde="test.fm"))
        cls.port = ledig_port(0)
        cls.tjener = ThreadingHTTPServer(("127.0.0.1", cls.port), Handler)
        cls.tråd = threading.Thread(target=cls.tjener.serve_forever, daemon=True)
        cls.tråd.start()

    @classmethod
    def tearDownClass(cls):
        cls.tjener.shutdown()
        cls.tjener.server_close()

    def url(self, sti):
        return f"http://127.0.0.1:{self.port}{sti}"

    def test_nettsida_svarer(self):
        with urllib.request.urlopen(self.url("/")) as svar:
            self.assertEqual(svar.status, 200)
            self.assertIn(b"fmscout", svar.read())

    def test_meta_og_sok(self):
        meta = json.load(urllib.request.urlopen(self.url("/api/meta")))
        self.assertEqual(meta["antall"], 120)
        krav = json.dumps({"omrader": {"alder": {"maks": 21}},
                           "kolonner": ["navn", "alder"]}).encode()
        be = urllib.request.Request(self.url("/api/sok"), krav,
                                    {"Content-Type": "application/json"})
        svar = json.load(urllib.request.urlopen(be))
        self.assertTrue(all(r[2] <= 21 for r in svar["rader"]))

    def test_csv_lastes_ned(self):
        import urllib.parse
        q = urllib.parse.quote(json.dumps({"kolonner": ["navn", "ca"]}))
        with urllib.request.urlopen(self.url(f"/api/csv?q={q}")) as svar:
            self.assertIn("attachment", svar.headers["Content-Disposition"])
            tekst = svar.read().decode("utf-8-sig")
        self.assertEqual(tekst.splitlines()[0], "Navn;CA")
        self.assertEqual(len(tekst.strip().splitlines()), 121)

    def test_ukjent_sti_gir_404(self):
        with self.assertRaises(urllib.error.HTTPError) as feil:
            urllib.request.urlopen(self.url("/finnes-ikke"))
        self.assertEqual(feil.exception.code, 404)


if __name__ == "__main__":
    unittest.main()

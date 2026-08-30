"""Landnavn – brukes til å kjenne igjen nasjonalitetsfeltet i en save.

Lista trenger ikke være komplett. Den skal bare være god nok til at et felt med
landnavn skiller seg tydelig fra et felt med klubbnavn.
"""

from .felles import flat

_RÅ = """
Norge Norway Sverige Sweden Danmark Denmark Island Iceland Finland Finnland
England Scotland Skottland Wales Nord-Irland Northern Ireland Ireland Irland
Spania Spain Portugal Frankrike France Tyskland Germany Italia Italy
Nederland Netherlands Holland Belgia Belgium Sveits Switzerland Austria Østerrike
Polen Poland Tsjekkia Czechia Slovakia Ungarn Hungary Romania Bulgaria
Kroatia Croatia Serbia Slovenia Bosnia-Hercegovina Bosnia Montenegro
Nord-Makedonia Macedonia Albania Hellas Greece Tyrkia Turkey Kypros Cyprus
Russland Russia Ukraina Ukraine Hviterussland Belarus Litauen Lithuania
Latvia Estland Estonia Moldova Georgia Armenia Aserbajdsjan Azerbaijan
Kasakhstan Kazakhstan Usbekistan Uzbekistan Israel Libanon Lebanon
Brasil Brazil Argentina Uruguay Paraguay Chile Peru Bolivia Ecuador Colombia
Venezuela Mexico Costa Rica Panama Honduras Guatemala Jamaica Trinidad
USA United States Canada Cuba Haiti
Nigeria Ghana Senegal Kamerun Cameroon Elfenbenskysten Ivory Coast
Mali Marokko Morocco Algerie Algeria Tunisia Egypt Libya Sudan Etiopia Ethiopia
Kenya Uganda Tanzania Zambia Zimbabwe Sør-Afrika South Africa Angola
Kongo Congo Gabon Guinea Burkina Faso Togo Benin Niger Tsjad Chad
Japan Kina China Sør-Korea South Korea Nord-Korea Australia New Zealand
India Indonesia Thailand Vietnam Malaysia Singapore Filippinene Philippines
Iran Irak Iraq Saudi-Arabia Saudi Arabia Qatar Emiratene Emirates Kuwait
Jordan Syria Oman Bahrain Afghanistan Pakistan Bangladesh
"""

NASJONER = {flat(n) for n in _RÅ.split()} | {
    flat(n) for n in (
        "Nord-Irland", "Northern Ireland", "Costa Rica", "United States",
        "Sør-Afrika", "South Africa", "Sør-Korea", "South Korea",
        "New Zealand", "Saudi-Arabia", "Elfenbenskysten", "Ivory Coast",
        "Burkina Faso", "Bosnia-Hercegovina", "Nord-Makedonia",
    )
}


def andel_landnavn(verdier) -> float:
    if not verdier:
        return 0.0
    return sum(1 for v in verdier if flat(v) in NASJONER) / len(verdier)

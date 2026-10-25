# Interface du portail dans les trois standards

**Phase 1, adoptée le 2026-10-25** (ADR 2026-10-25-interface-trois-standards.md).

Les boutons EN, ZAP, SRE et IST de l'en-tête traduisent désormais :
- l'en-tête et la navigation ;
- la recherche ;
- le pied de page ;
- le fil d'Ariane.

Le contenu des pages reste en anglais, et une note sous l'en-tête le signale. Le choix est
mémorisé dans le navigateur. La source de vérité est `portail/data/i18n.json`.

## Règles de choix des mots

1. **Forme commune d'abord.** Quand un même mot sert aux trois standards, on le prend :
   Registracija, Sigurnost, Karta, Konfederacija. C'est la règle des noms d'organes.
2. **Sinon, la forme propre à chaque standard** :
   - zapadni : base slovène ;
   - središnji : base štokavienne ;
   - istočni : base bulgare, dans la ligne des libellés de la carte citoyenne (Graždanska
     karta, Obština na proizhod).
3. **Au središnji, on évite les mots qui séparent le serbe et le croate.** On choisit alors
   un internationalisme ou une tournure commune : *Participacija* plutôt que *učešće* ou
   *sudjelovanje*, *Uključite se* plutôt que *učestvujte* ou *sudjelujte*. Quand aucune
   solution neutre n'existe, on suit la ligne de la carte citoyenne (*Izdavač*, *Važi do*,
   *opština*) : *odbrana*, *Službeni glasnik*.
4. **Pas de mot à yat sans nécessité.** Au zapadni et à l'istočni, qui sont ekaviens, le
   réflexe s'écrit *e* (*vestnik*), comme pour les noms de lieux (ADR
   2026-10-25-ekavien-sans-yat.md).
5. **Alphabet v3** : ñ, ļ, ã, x (*Zemļevid*, *Dãržavi*, *Tãrsene*). La marque Balkanska
   Konfederacija et la devise Naš dom ne se traduisent pas ; la devise remplace le
   sous-titre anglais.

## Libellés

| EN | ZAP | SRE | IST |
|---|---|---|---|
| Official portal of the Balkan Confederation | Uradni portal Balkanske konfederacije | Službeni portal Balkanske konfederacije | Oficialen portal na Balkanskata konfederacija |
| Balkan Confederation | Naš dom | Naš dom | Naš dom |
| Home | Domov | Početna | Načalo |
| States | Države | Države | Dãržavi |
| Map | Zemļevid | Karta | Karta |
| Institutions | Institucije | Institucije | Institucii |
| Security | Varnost | Sigurnost | Sigurnost |
| Constitution | Ustava | Ustav | Konstitucija |
| Identity | Identiteta | Identitet | Identičnost |
| Participation | Sodelovanje | Participacija | Učastie |
| Register | Registracija | Registracija | Registracija |
| My card | Moja izkaznica | Moja karta | Mojata karta |
| Search the portal | Iskanje po portalu | Pretraga portala | Tãrsene v portala |
| Search states, communities, peoples, letters, pages… | Iščite države, skupnosti, narode, črke, strani… | Tražite države, zajednice, narode, slova, stranice… | Tãrsete dãržavi, obštnosti, narodi, bukvi, stranici… |
| navigate | premik | kretanje | dviženie |
| open | odpri | otvori | otvori |
| close | zapri | zatvori | zatvori |
| Open menu | Odpri meni | Otvori meni | Otvori menjuto |
| Toggle light / dark theme | Tema | Tema | Tema |
| The Confederation | Konfederacija | Konfederacija | Konfederacijata |
| Law & identity | Pravo in identiteta | Pravo i identitet | Pravo i identičnost |
| Participate | Sodelujte | Uključite se | Učastvajte |
| States & territories | Države in ozemļa | Države i teritorije | Dãržavi i teritorii |
| Interactive map | Interaktivni zemļevid | Interaktivna karta | Interaktivna karta |
| Security and Defence | Varnost in obramba | Sigurnost i odbrana | Sigurnost i otbrana |
| Autonomous communities | Avtonomne skupnosti | Autonomne zajednice | Avtonomni obštnosti |
| Official Journal | Uradni list | Službeni glasnik | Dãržaven vestnik |
| Unified alphabet | Enotna abeceda | Jedinstvena abeceda | Edinna azbuka |
| Symbols & heraldry | Simboli in heraldika | Simboli i heraldika | Simvoli i heraldika |
| Become a citizen | Postanite državljan | Postanite državljanin | Stanete graždanin |
| Citizen card | Državljanska izkaznica | Državljanska karta | Graždanska karta |
| Membership dashboard | Pregled članstva | Pregled članstva | Pregled na členstvoto |
| digital portal | digitalni portal | digitalni portal | digitalen portal |

La note « contenu en anglais » et la phrase du pied de page sont dans `i18n.json`.

## Suite (phase 2)

- Traduire les titres et les intertitres des pages, puis les pages elles-mêmes, standard par
  standard.
- Le lecteur de la Constitution attend la version officielle dans les trois standards : selon
  l'art. 151, elles font également foi.

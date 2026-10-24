# Cyrillique confédéral — proposition

**Statut : proposition, à valider.** Ce document n'est pas canonique tant qu'aucune ADR ne
l'a adopté.

## Objet

L'art. 129 de la Constitution garantit l'usage libre du cyrillique. Il ne dit pas comment la
Confédération écrit elle-même en cyrillique lorsqu'elle le fait, par exemple :
- pour une inscription bilingue (enseigne, insigne de service) ;
- pour une édition cyrillique du Journal officiel ;
- pour une transcription automatique.

Le **cyrillique confédéral** répond à ce besoin. Il compte une lettre cyrillique pour chacune
des 32 lettres de l'alphabet v3, et réciproquement. La conversion est donc **réversible**
dans les deux sens, sans dictionnaire.

## Table (32 lettres)

| Latin v3 | Cyrillique | | Latin v3 | Cyrillique |
|---|---|---|---|---|
| A a | А а | | L l | Л л |
| Ã ã | Ъ ъ | | Ļ ļ | Љ љ |
| B b | Б б | | M m | М м |
| C c | Ц ц | | N n | Н н |
| Č č | Ч ч | | Ñ ñ | Њ њ |
| Ć ć | Ћ ћ | | O o | О о |
| D d | Д д | | P p | П п |
| Đ đ | Ђ ђ | | R r | Р р |
| E e | Е е | | S s | С с |
| Ě ě | Ѣ ѣ | | Š š | Ш ш |
| F f | Ф ф | | T t | Т т |
| G g | Г г | | U u | У у |
| H h | Х х | | V v | В в |
| I i | И и | | X x | Џ џ |
| J j | Ј ј | | Z z | З з |
| K k | К к | | Ž ž | Ж ж |

## Choix

- **Socle serbe et macédonien.** Il compte une lettre par phonème : ј, љ, њ, џ, ћ, ђ.
  Il s'aligne donc naturellement sur le latin v3, qui suit la même logique (Karadžić).
- **ъ pour ã.** C'est la lettre bulgare du schwa, celle d'où vient ã.
- **ѣ pour ě.** Le yat retrouve sa lettre d'origine. Comme en latin, il se lit selon le
  standard du lecteur (e, je, ije, ja), sans prononciation imposée (art. 130). Les polices
  du portail couvrent déjà ѣ (ADR 2026-10-23-typographie.md).
- **ћ et ђ pour ć et đ.** Le macédonien réalise ces phonèmes en /c ɟ/ et les écrit ќ ѓ. Le
  latin v3 les a déjà fusionnés (`v1.md`, principe 4). Le cyrillique confédéral suit la même
  fusion, et ќ ѓ restent libres dans l'usage macédonien.
- **Lettres bulgares hors table**, écrites en toutes lettres :
  - щ s'écrit шт : площад → *ploštad* → плоштад ;
  - ю s'écrit ју, я s'écrit ја, й s'écrit ј ;
  - ьо s'écrit јо, ou љо et њо après л et н : шофьор → *šofjor* → шофјор,
    Кольо → *Koļo* → Кољо.

  On retrouve exactement les séquences du latin v3 (*št*, *ju*, *ja*).
- **ç** n'a pas d'équivalent : les noms albanais et turcs restent en latin dans leur langue.

## Exemples

| Latin v3 | Cyrillique confédéral |
|---|---|
| Balkanska Konfederacija | Балканска Конфедерација |
| Naš dom | Наш дом |
| Konfederalna Žandarmerija | Конфедерална Жандармерија |
| Konfederalna Obavěštajna Agencija | Конфедерална Обавѣштајна Агенција |
| Ļubļana | Љубљана |
| Sěverna Trakija | Сѣверна Тракија |
| Južna Dobruxa | Јужна Добруџа |
| Bãlgari | Българи |
| Bošñaci | Бошњаци |
| Opština porěkla | Општина порѣкла |

## Sens inverse (saisie)

La saisie d'un nom en cyrillique dans le parcours citoyen suit déjà
`docs/canon/citoyennete.md` : њ → ñ, љ → ļ, џ et дж → x, ъ → ã, ѓ → đ, ќ → ć, ѕ → dz, щ → št.
Le cyrillique confédéral en est l'inverse exact sur les 32 lettres. Les lettres propres au
bulgare et au macédonien (ѓ, ќ, ѕ, щ, ю, я, й, ь) sont acceptées en entrée, mais ne sont
jamais produites en sortie.

Une divergence est à régler en même temps que l'adoption. La saisie traite ю comme *ju*
partout, alors que `v1.md` note *лю* par la latérale palatale (*любов* → *ļubov*). La
proposition retient la règle de `v1.md` : ль, лю, ля donnent ļ, ļu, ļa, et нь, ню, ня
donnent ñ, ñu, ña.

## Usage prévu

- **Inscriptions bilingues** : latin en haut, cyrillique en bas, sur une même hauteur de
  capitale (par exemple ŽANDARMERIJA / ЖАНДАРМЕРИЈА). Cette règle d'insigne reste à
  valider séparément.
- **Édition cyrillique du Journal officiel** : texte généré automatiquement depuis le
  latin, puisque la conversion est sans perte.
- Les standards et les États restent libres de leur propre orthographe cyrillique, serbe,
  macédonienne ou bulgare (art. 129 et 130). Le cyrillique confédéral n'est que l'écriture
  des institutions confédérales.

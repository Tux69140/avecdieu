"""Petites capitales sans accent (choix du porteur du projet, 2026-10-08).

Les petites capitales de Cormorant SC ont la forme de majuscules : dans les
apps du porteur, elles ne portent pas d'accent (« BENEDICTION »). Cette police
ne contient que les lettres accentuées, chacune dessinée par sa lettre de base ;
la cédille reste (« Ç »). Déclarée après Cormorant SC pour ces seuls
caractères (jetons.css), elle les remplace à l'affichage : le texte, lui,
garde ses accents (lecteur d'écran, copier-coller).

Usage, depuis la racine du dépôt (fonttools et brotli installés) :
    python3 scripts/generer-capitales-sans-accent.py
"""

import unicodedata

from fontTools import subset
from fontTools.ttLib import TTFont

SOURCE = 'node_modules/@fontsource/cormorant-sc/files/cormorant-sc-latin-{}-normal.woff2'
CIBLE = 'src/styles/polices/capitales-sans-accent-{}.woff2'
NOM = 'Capitales sans accent'


def accentuees():
    for cp in list(range(0xC0, 0x100)) + [0x178]:
        lettre = chr(cp)
        base = unicodedata.normalize('NFD', lettre)[0]
        # La cédille n'est pas un accent ; Æ, Ø, ß… n'ont pas de lettre de base.
        if lettre in 'çÇ' or base == lettre or not base.isalpha():
            continue
        yield cp, ord(base)


def generer(graisse):
    police = TTFont(SOURCE.format(graisse))
    paires = list(accentuees())
    for table in police['cmap'].tables:
        if table.isUnicode():
            for cp, base in paires:
                if base in table.cmap:
                    table.cmap[cp] = table.cmap[base]
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = []
    sous = subset.Subsetter(options)
    sous.populate(unicodes=[cp for cp, _ in paires])
    sous.subset(police)
    for nom in police['name'].names:
        if nom.nameID in (1, 4, 16):
            nom.string = NOM
        elif nom.nameID == 6:
            nom.string = NOM.replace(' ', '') + '-' + str(graisse)
    police.flavor = 'woff2'
    police.save(CIBLE.format(graisse))
    return len(paires)


if __name__ == '__main__':
    for graisse in (400, 500, 600):
        print(graisse, generer(graisse), 'lettres')

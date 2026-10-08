# Polices embarquées hors paquets

- `signes-liturgiques.woff2` : les signes ℣ (U+2123) et ℟ (U+211F) seuls, extraits de
  **FreeSerif** (GNU FreeFont, version 20211204). Licence : GNU GPL v3 ou ultérieure, avec
  l'exception pour les polices (« font exception ») qui permet de les inclure dans un document
  ou une application sans que la GPL s'étende à celle-ci. Choix du porteur du projet,
  2026-10-06.

  Pour la refaire (fonttools) :

  ```
  pyftsubset /usr/share/fonts/truetype/freefont/FreeSerif.ttf \
    --unicodes=U+2123,U+211F --flavor=woff2 \
    --output-file=src/styles/polices/signes-liturgiques.woff2
  ```

- `capitales-sans-accent-400.woff2`, `-500`, `-600` : les lettres accentuées de **Cormorant SC**
  (paquet `@fontsource/cormorant-sc`), chacune dessinée par sa lettre de base, la cédille
  gardée. Les petites capitales de l'app ne portent ainsi aucun accent (choix du porteur du
  projet, 2026-10-08). Licence : SIL Open Font License 1.1, comme Cormorant ; la police
  modifiée porte un autre nom (« Capitales sans accent »).

  Pour la refaire (fonttools et brotli) :

  ```
  python3 scripts/generer-capitales-sans-accent.py
  ```

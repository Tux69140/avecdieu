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

# Portfolio d'Emilie — site d'origine

Site statique (HTML, CSS, JS, pas de build) : ouvrir `index.html` dans le navigateur. Les textes FR + EN sont dans `js/content.js`.

Une refonte « sobre » de l'accueil vit dans un autre dépôt, `portfolio-sobre`. Ce dépôt-ci est le site d'origine.

## Travailler à deux

- `git pull` avant de commencer, commit + `git push` quand une modif est finie.
- Réponses courtes : 3 à 5 lignes, ce qui a changé et ce qu'il faut valider. Pas de détails techniques sauf demande.

## Pages projets : ne pas toucher

`projets/*.html`, `css/brol.css`, `css/aline.css`, `css/touffe.css` et leurs images ne changent pas sans demande explicite. Chaque projet garde la DA de sa campagne ou de sa charte.

- `css/style.css` est partagé avec les pages projets : tout style propre à l'accueil passe par la classe `.pg-home` (sur le body d'`index.html`).
- Après un changement de style, vérifier par captures avant/après que les pages projets restent identiques au pixel.
- Ajouts déjà validés, à garder : boutons « essayer l'app ↗ » et écrans nets sur la page aline, bouton « voir la preview du site ↗ » dans l'en-tête de la page Touffe.

## DA de l'accueil

- Accueil d'origine, titres en Emilie Display, hero et « À propos » en collage, contact en collage miroir du hero.
- Palette « Ciel et cerise » sur `.pg-home` : ciel #A3DAF8, cerise #B00C28 (nom, rôle), marine #1F2F8F (accents, contact), beurre #FFE29A (papier), rose #FFB3C1 (post-it).
- Pas d'effet déchiré ou arraché : bords droits, photos en rectangles nets, penchées avec une ombre. Les post-its, la flèche dessinée et les titres penchés restent.
- À éviter si une refonte revient : projets dans des cadres arrondis, projets qui se recouvrent au scroll. Garder l'index des projets (affiche qui suit le logo survolé), la frise du CV en pointillés et les logos des projets dans leurs couleurs.
- La police est intégrée en base64 dans `css/emilie-display.css` (sinon Safari en local `file://` ne la charge pas). La source est `assets/fonts/emilie-display-black.woff2` : la réencoder si la police change. Tester aussi dans Safari.

## Ton des textes de l'accueil

Source : `assets/Dossier_ADN_portfolio_Claude_Code.docx`, à relire avant toute réécriture.

- Phrases courtes, « je » assumé, concret, un peu d'humour de temps en temps, accords au féminin.
- Pas de clichés ni d'anglicismes de façade ; montrer plutôt que s'attribuer des qualités.
- Ne jamais s'attribuer seule un projet d'équipe, ne rien inventer (surtout pour aline).
- Recherche : stage de six mois dès février 2027. L'accroche « Curieuse de tout. Créative surtout. » n'apparaît qu'une fois (post-it d'« À propos »).
- Les textes des pages projets (`pages.*`, `ui.*` dans `content.js`) ne se réécrivent pas sans demande.

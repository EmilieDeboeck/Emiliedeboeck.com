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

- Tout l'accueil suit la DA de l'affiche du haut (choix d'Emilie, octobre 2026) : titres en Rubik Black capitales qui arrivent de côté (un titre de la droite, le suivant de la gauche, mots sans se croiser), texte en Figtree, rectangles aux coins légèrement adoucis comme ceux de Rubik (`--round-s` 6px, `--round-m` 14px : cartes projets, boutons, étiquettes en petites bandes, photos), jamais de grands arrondis ni de formes organiques. Emilie Display reste sur les pages projets et le logo de l'en-tête. « À propos » et contact : une photo d'Emilie posée de biais à côté du texte (deux portraits différents), sans post-it ni flèche dessinée (retirés à sa demande). L'ancien hero a été retiré : l'affiche le remplace.
- Quatre couleurs sur `.pg-home` : cerise #B00C28, rose #FFB3C1, crème #FFFDF7, encre #14213D. Sections alternées : affiche cerise, manifeste rose, projets cerise (bande crème pour les logos, sinon le U rose de Touffe disparaît), À propos rose (papier crème), CV cerise, contact rose. Le rose sur cerise (4,3:1) seulement pour les grands textes ; petit texte en crème sur cerise, en encre sur rose.
- Affiche des compétences en haut de l'accueil (avant le manifeste), en Rubik Black : au chargement, seul le nom arrive ; puis, pendant que l'affiche reste fixée, les autres lignes arrivent de gauche et de droite au fil du scroll. Bande rose « Emilie Deboeck » au centre, lettres sur toute la hauteur et chaque ligne étirée sur toute la largeur. Le seul `h1` de la page est caché dans l'affiche.
- Pas d'effet déchiré ou arraché : bords nets, photos en rectangles (coins à peine adoucis), penchées avec une ombre. Le titre penché du contact reste.
- À éviter si une refonte revient : projets dans des cadres arrondis, projets qui se recouvrent au scroll. Garder l'index des projets (affiche qui suit le logo survolé), la frise du CV en pointillés et les logos des projets dans leurs couleurs.
- La police est intégrée en base64 dans `css/emilie-display.css` (sinon Safari en local `file://` ne la charge pas). La source est `assets/fonts/emilie-display-black.woff2` : la réencoder si la police change. Tester aussi dans Safari.

## Ton des textes de l'accueil

Source : `assets/Dossier_ADN_portfolio_Claude_Code.docx`, à relire avant toute réécriture.

- Phrases courtes, « je » assumé, concret, un peu d'humour de temps en temps, accords au féminin.
- Pas de clichés ni d'anglicismes de façade ; montrer plutôt que s'attribuer des qualités.
- Ne jamais s'attribuer seule un projet d'équipe, ne rien inventer (surtout pour aline).
- Recherche : stage dès février 2027. Emilie a retiré « de six mois » du texte du contact ; la meta description le mentionne encore. L'accroche « Curieuse de tout. Créative surtout. » a été retirée du site.
- Les textes des pages projets (`pages.*`, `ui.*` dans `content.js`) ne se réécrivent pas sans demande.

# Candle Ice

*Une enquête en une nuit.* Un jeu narratif en anglais, dans l'esprit de *Disco Elysium* : presque tout se joue en dialogues et en choix, avec seize voix intérieures qui interrompent le protagoniste, des jets de dés, des pensées à « internaliser » et plusieurs fins.

> Aubade, la dernière nuit de l'hiver. Sur le port gelé se dresse *the Glass*, une ville d'hiver bâtie sur la glace. Sous la glace, devant le dancing, un homme regarde vers le haut, la main levée comme pour frapper. C'est le gardien de la glace. Dans une lettre envoyée six jours plus tôt, il avait demandé un enquêteur en particulier : toi.

Tu incarnes **Aurel Marrow**, Examinateur de la Troisième Chambre, 56 ans, 4 106 verdicts rendus. Tu reviens d'un congé forcé et tu poses le pied sur la glace du port pour la première fois depuis quarante-quatre ans.

## Jouer

- Ouvre `index.html` dans un navigateur, ou le fichier unique `dist/candle-ice.html` (aucun serveur nécessaire).
- Compte 4 à 6 heures pour une partie (et bien davantage pour tout voir). La sauvegarde est automatique à chaque choix, dans le navigateur.
- Touches : `1`–`9` pour choisir, `Espace` pour continuer ou accélérer le texte, `F` dossier, `D` tiroir des pensées, `J` dossier d'enquête, `Échap` pour fermer.
- **Le son** est coupé par défaut ; le bouton *Sound* l'active. Il comprend :
  - **une musique par lieu** (27 morceaux génératifs) : chaque pièce a une forme (introduction, sections A/B/C, parties qui entrent au deuxième passage), une vraie mélodie composée une fois pour toutes et qui revient, des contre-chants, des lignes de basse avec notes d'approche, des accords enchaînés comme les jouerait une main, et une vingtaine d'instruments synthétisés (cordes frottées, cor, clarinette, flûte, célesta, guitare, cloche tubulaire, piano feutré, accordéon, orgue, chœur, boîte à musique…) ;
  - **des ambiances** (vent, glace qui chante, pluie du dégel, poêles, foule, machines, eau sous la glace) ;
  - **un bruitage pour chaque évènement** : dés, réussite et échec, nouvelle pensée, indice, tâche, blessure, perte de moral, portes, pas, plume, papier, cloche, glace qui craque… ;
  - **les voix intérieures doublées** : les seize compétences parlent avec une voix grave et granuleuse de vieux narrateur, inspirée de celle de *Disco Elysium* ; les morts (le Gardien, Feliks, le Froid, la mère d'Aurel) ont chacun leur propre voix traitée. Environ 610 répliques. La musique s'efface sous les voix pendant qu'elles parlent.
  - Le menu permet de régler séparément musique, effets et voix, et de couper les voix.
- **Les images** sont des scènes 3D (Three.js) passées dans un filtre de peinture à l'huile (filtre de Kuwahara, coups de pinceau orientés selon les formes, contours à l'encre, toile). 27 lieux et 23 **plans rapprochés** (la main sous la glace, la montre arrêtée à 3 h 12, le registre du Gardien, la corde coupée, la cloche, le cairn des Narrows…) qui s'affichent le temps d'un passage, cadre resserré, puis rendent la main au décor. Sur une machine sans WebGL, ou depuis le menu, le jeu revient aux croquis 2D.

## Ce qui change selon tes choix

- **Seize compétences** réparties en quatre attributs (Reason, Soul, Flesh, Nerve). Elles parlent d'elles-mêmes quand elles sont assez fortes (checks passifs) et ouvrent des options de dialogue.
- **Checks blancs** : tu peux les retenter après avoir monté la compétence. **Checks rouges** : une seule tentative. Un échec ouvre souvent une scène aussi intéressante qu'une réussite.
- **Le Tiroir** (*The Drawer*) : neuf pensées à laisser mûrir pendant que le temps passe. Elles coûtent quelque chose pendant qu'elles mûrissent et changent la façon dont tu joues, et l'une d'elles débloque un cinquième verdict.
- **Le temps compte** : trois heures avant le bal, puis une nuit qui s'effondre. Tu ne pourras pas tout voir en une partie.
- **Chaque personnage se souvient** de la façon dont tu l'as traité : confiance, alliés, trahisons.
- **Plusieurs issues** : combien de personnes quittent la glace avant qu'elle cède, qui survit, quel verdict tu écris (et si la greffière accepte de l'écrire), et ce que devient Aurel.

## Structure du projet

```
index.html            page du jeu (charge les fichiers ci-dessous)
css/style.css         mise en page et direction artistique de l'interface
js/data.js            compétences, personnages, pensées
js/parser.js          lecteur du format de script
js/engine.js          moteur : état, jets de dés, dialogue, panneaux, sauvegarde
js/scene3d.js         scènes 3D (Three.js) + filtre de peinture à l'huile (Kuwahara)
js/painter.js         croquis 2D de secours, et la météo (neige, pluie)
js/audio.js           musique générative, ambiances, bruitages, lecture des voix
js/voice-manifest.js  index des voix (généré)
js/vendor/three.min.js  Three.js r128 (licence MIT), copie de secours du CDN
voice/*.mp3           voix intérieures, regroupées en « sprites » (générées)
story/*.js            toute l'histoire (≈ 72 000 mots, 855 nœuds)
tools/validate.js     vérifie le script et simule des milliers de parties
tools/smoke.js        joue la vraie page dans Chromium avec des choix aléatoires
tools/build.js        produit dist/candle-ice.html (fichier unique)
tools/dump_lines.js   liste les répliques à doubler, avec leur empreinte
tools/voices.py       génère les voix (Kokoro TTS + léger traitement ffmpeg)
DESIGN.md             recherches sur Disco Elysium et notes de conception
```

## Vérifier et construire

```sh
node tools/validate.js     # erreurs de script, impasses, nœuds inaccessibles
node tools/build.js        # génère dist/candle-ice.html
node tools/smoke.js        # nécessite Playwright
```

### Régénérer les voix

Les voix sont produites hors ligne par **Kokoro-82M** (modèle libre, licence Apache 2.0), dont l'intonation suit le sens de la phrase entière : une seule voix de narrateur britannique grave (*Lewis*) pour les seize compétences, comme dans *Disco Elysium* où un seul comédien les joue toutes, avec un tempo propre à chaque attribut (Soul plus lente, Nerve plus vive). Le traitement est volontairement minimal : un demi-ton plus bas en conservant les formants, un peu de poitrine, une compression douce, **aucune réverbération ni saturation**. La ponctuation expressive (tirets, points de suspension) est conservée, et les noms inventés (Sarre, Aino, Odile, Aubade…) ont une prononciation imposée. Les morts ont leurs propres voix et leur « pièce » (Feliks à travers l'eau, le Gardien dans la glace, le Froid).

Le choix a été **mesuré** et non deviné, sur les mêmes répliques :

| moteur | naturel prédit (MOS /5, torchaudio SQUIM) | mots mal reconnus (Whisper) |
|---|---|---|
| Piper, première version très rauque | — | ≈ 20 % |
| Piper, version claire | ≈ 3,8 | ≈ 6 % |
| Chatterbox (clonage d'une voix grave) | ≈ 4,3 | ≈ 0 % |
| **Kokoro, voix Lewis (actuelle)** | **≈ 4,5** | **≈ 0 %** |

On a aussi constaté que la réverbération et la saturation faisaient baisser la note de naturel : c'est pour cela que le grain « rauque » vient de la voix elle-même et non d'effets.

```sh
python3 -m venv /opt/tts && /opt/tts/bin/pip install kokoro soundfile numpy imageio-ffmpeg
node tools/dump_lines.js > /tmp/lines.json
/opt/tts/bin/python tools/voices.py /tmp/lines.json
```

Le moteur retrouve chaque voix par une empreinte du texte : si tu modifies une réplique, relance ces deux commandes (seules les répliques changées sont re-synthétisées).

## Écrire dans le format de script

Chaque fichier de `story/` contient un script lu au démarrage. Voici un extrait :

```
== hut_rope_ask
AINO: She doesn't answer. She looks at the coil of rope for a long time.
@if aino >= 3
=> hut_confess
@endif
* [TENDERNESS 11] "You held it, didn't you." -> hut_confess | hut_rope_f
* [GRAVITAS 12 red] "Aino. I need the truth." -> hut_confess | hut_rope_f2
* [Let it be, for now.] -> hut_talk
```

`SKILL(10): texte` est un check passif ; `?{expr}` conditionne une ligne ; `@set`, `@add`, `@time`, `@thought`, `@clue` modifient l'état. La syntaxe complète est décrite en tête de `js/parser.js`.

---

*Candle Ice* est une œuvre originale écrite en hommage à *Disco Elysium* (ZA/UM, 2019). Aucun texte, personnage ni élément graphique de ce jeu n'y est repris.

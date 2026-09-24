# Candle Ice — recherches et conception

## 1. Ce que j'ai retenu de *Disco Elysium*

### L'écriture
- **Le protagoniste est un personnage défini, mais modelable.** Harry Du Bois arrive avec une histoire (l'effondrement, l'alcool, l'amour perdu), et le joueur choisit comment il la porte. L'amnésie sert de levier : le joueur découvre qui il est en même temps que le personnage.
- **Les compétences parlent.** Les 24 compétences sont des voix intérieures avec chacune un style propre (Logic méthodique, Inland Empire onirique, Electrochemistry tentatrice, Shivers qui parle au nom de la ville, Volition qui soutient). Le joueur débat littéralement avec des morceaux de sa propre tête. C'est ce que les joueurs citent le plus.
- **La deuxième personne** (« you ») et une narration très littéraire : les critiques parlent de « lire un grand roman », de prose « rarement vue dans un jeu ».
- **L'échec est intéressant.** Selon les analyses, près de la moitié des dialogues ne s'ouvre qu'en ratant des checks. Rater une réplique de drague donne l'une des lignes les plus célèbres du jeu. L'échec reflète le thème : un homme qui a raté sa vie et qui continue quand même.
- **Kim Kitsuragi**, le partenaire, est un point d'ancrage moral : retenu, compétent, avec une chaleur qu'on mérite peu à peu. Sa confiance se gagne et se perd, et c'est ce qui la rend précieuse.
- **Le mélange des tons** : absurde, politique, tendre, désespéré, souvent dans la même scène.
- **La politique incarnée** : communisme, fascisme, moralisme, ultralibéralisme deviennent des choix de dialogue qui changent les réactions des personnages.
- **Le troisième acte** : les choix optionnels accumulés convergent (le tribunal, la fin). C'est la partie la plus saluée.

### Les critiques
- Beaucoup d'exposition en milieu de partie, sans lien avec l'enquête.
- Des jets de dés qui poussent à recharger les sauvegardes.
- Un début lent (10 à 20 minutes de texte seul).
- Pour certains, une impression de « livre dont vous êtes le héros » avec peu de vrais choix.

### La direction artistique et l'interface
- Peinture à l'huile expressionniste (Aleksander Rostov, influences Jenny Saville, Vrubel, Repin, Kandinsky). Une équipe de peintres plutôt que de graphistes de jeu vidéo.
- Colonne de dialogue à droite, qui défile vers le haut comme un fil Twitter (inspiration revendiquée).
- Nom du locuteur en petites capitales ; compétences colorées selon leur attribut ; `[Facile : Réussite]` à côté du nom ; réponses numérotées, en rouge orangé, blanches au survol.
- Checks blancs (rejouables) et rouges (une seule chance), checks passifs invisibles qui ajoutent des voix au dialogue.
- Santé et Moral comme deux jauges qui peuvent chacune mettre fin à la partie.
- Le *Thought Cabinet* : des idées que l'on « internalise » avec le temps, avec un coût pendant la réflexion et un texte final.

Sources principales : [Wikipédia — Disco Elysium](https://en.wikipedia.org/wiki/Disco_Elysium), [Kim Kitsuragi](https://en.wikipedia.org/wiki/Kim_Kitsuragi), [Game Design Thinking — analyse du système](https://gamedesignthinking.com/disco-elysium-rpg-system-analysis/), [Disco Elysium and the Meaning of Failure](https://gameplayreflections.wordpress.com/disco-elysium-and-the-meaning-of-failure/), [rétrospective de J. T. L. Clark](https://www.theplayeristhething.com/p/disco-elysium-retrospective), [80.lv — UI](https://80.lv/articles/disco-elysium-working-on-ui-design), [Vertex Mode — l'art de Disco Elysium](https://vertexmode.com/the-art-of-disco-elysium/), [GDC — Meaningless Choices and Impractical Advice](https://gdcvault.com/play/1027160/-Disco-Elysium-Meaningless-Choices), [Disco Elysium wiki — compétences](https://discoelysium.wiki.gg/wiki/Skills), [TheGamer — répliques](https://www.thegamer.com/disco-elysium-best-quotes/), [ResetEra — voix préférées des joueurs](https://www.resetera.com/threads/your-top-5-favorite-disco-elysium-skills-their-dialogue-quotes-spoilers.414477/).

## 2. Ce que *Candle Ice* reprend, et ce qu'il change

| Disco Elysium | Candle Ice |
| --- | --- |
| Un inspecteur amnésique au fond du trou | Un Examinateur impeccable qui commence à se fissurer : il part d'un contrôle total et « dégèle » au fil de la nuit, ou non |
| Une enquête sur plusieurs jours, avec déplacements | Une seule nuit, sans déplacement libre : des lieux choisis dans un menu, et une horloge qui oblige à choisir |
| 24 compétences, 4 attributs | 16 voix, 4 attributs (Reason, Soul, Flesh, Nerve), écrites de zéro |
| Kim Kitsuragi | Ilse Varga, la greffière : tout ce que tu dis est potentiellement « au procès-verbal », et elle a un second carnet pour ce qui ne l'est pas |
| Thought Cabinet | *The Drawer* (le tiroir, comme ceux de la morgue) : neuf pensées |
| Quatre idéologies | Quatre visions d'une société où chaque vie a un prix imprimé au dos des papiers : Mutualistes, Actuariens, Hearthers, *Unpriced* |
| Le tribunal | La fermeture de la glace, puis l'écriture du verdict à l'aube |

Pour éviter les défauts relevés :
- **L'exposition sert toujours l'enquête.** La politique d'Aubade tient en une idée (le verdict détermine qui paie) et chaque camp est incarné par un personnage qui a un intérêt dans la décision.
- **Les jets de dés ont des sorties intéressantes des deux côtés**, et les checks importants ont plusieurs chemins (au moins deux compétences, ou une preuve, ou la confiance d'un personnage).
- **Le début est court** : un rêve de quelques lignes, puis la création du personnage faite en dialogue (la greffière lit ton dossier et tu choisis quelle distinction elle lit à voix haute).
- **Le troisième acte converge vraiment** : huit alliés ou preuves possibles, chacun obtenu dans un lieu différent de l'acte II, déterminent combien de personnes quittent la glace.

## 3. L'histoire (attention, révélations)

**Le monde.** Aubade, port du Nord. Depuis le Règlement d'il y a quarante ans, la Grande Mutuelle assure toute vie : chaque citoyen a une valeur, imprimée au dos de ses papiers. Un Examinateur doit classer chaque mort dans l'une des quatre « dernières lignes » (accident, suicide, homicide, verdict ouvert), et c'est cette ligne qui décide qui paie.

**Le Glass.** Chaque hiver, les pauvres, les pêcheurs et les danseurs construisent une ville sur le port gelé. Au centre, le Chandelier, un dancing dont le lustre contient de vraies stalactites de glace.

**Le mort.** Ailo Sarre, gardien de la glace depuis quarante et un ans, ivrogne et corrompu : depuis trente ans, il touche de l'argent pour déclarer la glace sûre. Cette année, elle ne l'est plus : l'usine frigorifique (la *Cold Works*) rejette de l'eau chaude dans le port et la glace pourrit par en dessous le long d'une veine, la *seam*. C'est la « glace-bougie » (*candle ice*) : épaisse en surface, creuse en dessous. Comme il est connu pour mentir contre de l'argent, personne ne le croit. Alors il descend sous la glace, attaché à une corde tenue par sa petite-fille, pour rapporter un morceau de glace pourrie. Le courant chaud l'emporte sur le côté ; la jeune fille est entraînée vers le trou ; il coupe la corde pour qu'elle ne tombe pas avec lui. Il meurt en serrant le morceau de glace dans son poing, et le courant dépose son corps sous les marches du dancing, là où tout le monde le verra.

**Le protagoniste.** Quarante-quatre ans plus tôt, Aurel, 12 ans, a entraîné son frère Feliks sur la mauvaise glace. Un jeune homme avec une gaffe a sorti Aurel de l'eau, puis a plongé trois fois pour Feliks sans le retrouver. Ce jeune homme, c'était Sarre. Il a suivi toute la carrière d'Aurel dans les journaux, et il l'a fait venir pour deux raisons : un Examinateur peut fermer la glace, et Aurel était « le garçon ».

**Le thème.** La vérité et la miséricorde, et ce qu'on doit à ceux qui nous ont sauvés. La lettre de Sarre en donne la clé : *« Un frère pousse. Un garçon qui se noie grimpe. C'est le même geste, vu des deux côtés de l'eau. »* Chacun des quatre verdicts est défendable, et chacun ment un peu. Une pensée du Tiroir permet d'en écrire un cinquième, qui n'existe pas dans la loi.

**Ajouts de la troisième version.**
- *Les Narrows* : on peut marcher jusqu'à l'endroit où Feliks s'est noyé. Au bord de la glace interdite, un petit cairn de glace et une bougie dans un pot de confiture : depuis quarante-quatre hivers, le Gardien y entretenait une lumière pour le garçon qu'il n'a pas pu sortir de l'eau (une coutume des Rime-folk pour les disparus). Le joueur peut rallumer la bougie ou la laisser s'éteindre, dire enfin le nom de son frère à voix haute, frapper trois fois sur la glace, ou laisser Ilse l'inscrire au registre. Le lieu donne aussi une preuve (la veine d'eau chaude débouche là, en plein hiver) et une nouvelle pensée, *A Light for the Not-Found*.
- *The Evening Lamp* : Wren Aske, la journaliste qui a publié « l'Examinateur rit à l'enquête sur le garçon noyé », imprime pour le lendemain « Le Gardien se noie ivre », titre payé d'avance par l'usine. Elle a aussi refusé, six jours plus tôt, l'avertissement que le Gardien voulait publier (« Je ne suis pas ivre », souligné deux fois). Le joueur peut l'affronter, la convaincre, récupérer l'avis, et à l'acte III lui faire imprimer une édition spéciale qui compte pour l'évacuation. Wren et Ilse partagent un vieux secret.
- *Tar Lane* : onze cabanes posées exactement sur la veine, et une vieille lectrice de glace qui ne partira qu'au son de la cloche. Trois façons de la convaincre, dont six mots de rime appris dans un mauvais dictionnaire.
- Des rencontres de rue (un petit vendeur de lanternes « pour celui qui est sous la glace », un couple qui répète la valse), de nouveaux sujets avec Ilse, et des personnages qui réagissent aux découvertes des autres lieux.

## 4. Les systèmes

- **Attributs** : base 2 ; la distinction lue par Ilse donne +2, la note de mérite +1, le blâme −1. Une compétence « signature » donne +1.
- **Checks actifs** : 2d6 + compétence ≥ difficulté ; double un = échec, double six = réussite. Blancs : on peut réessayer après avoir monté la compétence. Rouges : une seule chance.
- **Checks passifs** : compétence + 6 ≥ difficulté ; la voix intervient d'elle-même.
- **Expérience** : 100 points = 1 point de compétence (plafond +2 par compétence).
- **Santé** = 2 + Flesh, **Moral** = 2 + Soul. Représentés par des bougies. À zéro, la partie s'arrête (on peut revenir au dernier choix).
- **Le Tiroir** : trois emplacements ; une pensée mûrit en 60 à 150 minutes de temps de jeu.
- **Évacuation** : cloche du gardien (+2), notice de la Mutuelle, départ du bal, aide des scieurs, itinéraire du constable, abri à l'usine, preuve physique, dérivation de l'eau chaude (+1 chacun), bonus ou malus selon l'heure, puis le discours (+2 s'il réussit). 7 et plus : personne ne meurt.

## 5. Direction artistique

- **Scènes 3D peintes** : chaque lieu (27 décors) est modélisé en Three.js (cabanes en planches avec fenêtres, portes, stalactites et congères ; étals à auvent rayé ; foules de passants avec écharpes, chapkas et lanternes ; lustre de glace ; chapelle-tente ; usine ; bains de vapeur ; cuisine du rêve…), éclairé par des lanternes et du brouillard, puis passé dans un filtre de peinture à l'huile : filtre de Kuwahara (qui fond les détails en aplats comme une brosse), coups de pinceau orientés le long des formes (d'après le gradient de l'image), encre qui se dépose sur les contours forts comme un dessin préparatoire, toile, étalonnage chaud dans les lumières et froid dans les ombres. Le but : qu'on reconnaisse immédiatement ce qui est représenté, tout en gardant l'impression d'une esquisse de Rostov.
- **Semi-décors** : *Disco Elysium* garde un seul décor par lieu ; ici, pour une histoire très dialoguée, 23 plans rapprochés prennent le relais aux moments qui comptent — la main du mort sous la glace, la montre arrêtée à 3 h 12, la corde coupée net, la main qui se desserre dans la chapelle, le registre du Gardien avec son croquis de la veine, la cloche du dégel sous la pluie, le cairn des Narrows, le journal du lendemain (dont le titre change selon ce que le joueur a obtenu). Le cadre se resserre comme un objectif, la neige reste dehors, et le décor revient au choix suivant.
- **Titres de lieux** : à chaque nouveau lieu, son nom s'inscrit en grand sur la scène, comme un titre de chapitre, avec l'heure.
- **Croquis 2D de secours** : sans WebGL, chaque décor est peint en coups de pinceau « à poils » sur des aplats de couleur.
- **Palette** : nuit de port (bleu-noir), texte couleur suif, choix couleur braise ; les quatre attributs en bleu glace, violet, rose sang et ocre.
- **Typographie** : Libre Baskerville pour la lecture, IM Fell English (typographie d'imprimerie ancienne) pour les titres et les documents (lettres, coupures de presse, registres), Courier Prime pour l'horloge et les jets de dés, comme un procès-verbal.
- **Musique** : une pièce générative par lieu, écrite comme de la musique et non comme une boucle : une introduction où seules les nappes jouent, des sections A/B/C enchaînées selon une forme (AABA pour les valses), des parties qui n'entrent qu'au deuxième passage, une mélodie composée une fois (un motif de deux mesures, sa réponse, une cadence) pour qu'on la reconnaisse en revenant dans un lieu, des contre-chants et des basses qui préparent l'accord suivant. Tout est construit autour d'un même motif, « l'aubade » : cordes pincées pour la glace, valse d'accordéon étouffée derrière les murs du dancing (qui passe en mineur harmonique quand le dégel commence), orgue et chœur pour la chapelle, boîte à musique pour l'atelier de couture, piano stride et clarinette pour l'imprimerie, violoncelle pour les Narrows, cor et timbales pour l'effondrement, version majeure de l'aubade pour l'aube.
- **Voix intérieures** : dans *Disco Elysium: The Final Cut*, un seul comédien (Lenval Brown) prête sa voix grave et rocailleuse à toutes les compétences ; c'est ce qui fait qu'on les entend comme les morceaux d'une seule tête. *Candle Ice* reprend ce principe : une même voix de narrateur grave, générée par un modèle récent (Kokoro) dont l'intonation suit le sens des phrases, déclinée en quatre tempos selon l'attribut ; on a renoncé aux effets de « grain » qui faisaient sonner la voix artificielle. Les morts ont d'autres voix, traitées comme si elles venaient de l'eau ou de la glace. Les répliques des personnages vivants restent à lire, comme les choix du joueur.
- **Bruitages** : chaque évènement de jeu a son signal (dés, réussite, échec, pensée, indice, blessure…), et le texte déclenche des sons ponctuels (plume, papier, porte, scie, cloche, craquement). Ambiances : vent, glace qui « chante » (les sifflements descendants des lacs gelés), pluie, poêles, foule, eau.

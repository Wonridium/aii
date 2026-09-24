# Note G — le premier programme, exécuté 183 ans plus tard

En 1843, Ada Lovelace traduit l'article de Menabrea sur la *Machine analytique*
de Babbage et y ajoute sept notes, plus longues que l'article lui-même. La
dernière, **Note G**, contient un tableau de 25 opérations qui calcule le nombre
de Bernoulli qu'elle appelle B₇ (B₈ = −1/30 en notation moderne). C'est
généralement considéré comme le premier programme publié.

La machine n'a jamais été construite. Ce dépôt la simule, carte d'opération par
carte d'opération, et exécute le tableau de Lovelace sur un « magasin » de
colonnes V0, V1, V2… avec une arithmétique rationnelle exacte.

```
$ python3 note_g.py
B7 from the 1843 table as printed : 139/630
B7 with operation 4 corrected     : -1/30   ✓ (modern B8 = -1/30)
Mill work for one run             : + 10, - 11, × 8, ÷ 7
```

## Le bug de l'opération 4

Le tableau imprimé divise V5 par V4, soit (2n+1)/(2n−1), au lieu de V4 par V5.
Coquille d'imprimeur ou erreur de recopie, on ne sait pas trop. La formule
écrite dans le texte de la Note G donne bien (2n−1)/(2n+1). Mais une machine n'exécute pas
l'intention, elle exécute la carte. Exécuté tel quel, le programme rend
**139/630** au lieu de **−1/30**.

`--chain` montre ce que Lovelace avait en tête : la machine réinjecte chaque
résultat dans le calcul suivant (l'opération 25 fait n ← n + 1). Avec la
correction, on obtient toute la suite ; avec le tableau d'origine, l'erreur se
propage et explose :

```
$ python3 note_g.py --chain 6
 Lovelace              corrected Engine         1843 table as printed  check
       B1                           1/6                           3/2  ✓
       B3                         -1/30                         -13/6  ✓
       B5                          1/42                        211/30  ✓
       B7                         -1/30                    -25621/630  ✓
       B9                          5/66                    234823/630  ✓
      B11                     -691/2730                  -4941737/990  ✓
```

La colonne ✓ compare avec un calcul indépendant (algorithme
d'Akiyama–Tanigawa), qui ne partage rien avec le programme de Lovelace.

## Ce que fait le programme

Lovelace part de l'identité, pour n ≥ 1 :

    0 = A0 + A1·B1 + A3·B3 + … + B(2n−1)
    A0      = −½ · (2n−1)/(2n+1)
    A(2k−1) = 2n(2n−1)…(2n−2k+2) / (2·3·…·2k)  =  C(2n, 2k−1) / 2k

Les opérations 1 à 12 calculent A0 et A1·B1 ; les opérations 13 à 23 forment une
**boucle** qui construit chaque coefficient A(2k−1) à partir du précédent (deux
multiplications par des fractions qui décroissent) et l'accumule dans V13. Le
compteur V10 décide quand s'arrêter. Une boucle, un compteur, un accumulateur,
des variables réutilisées : en 1843.

`python3 note_g.py --trace` affiche chaque carte avec la valeur produite, à
comparer avec le tableau original.

## Choix de modélisation

- Les cartes 1 à 23 sont celles du tableau. Seul le contrôle de flux est
  implicite dans l'original (« ici suit une répétition des opérations 13 à
  23 ») ; il est modélisé par un test du compteur V10.
- L'opération 24 est implémentée selon son rôle mathématique,
  B(2n−1) = −(A0 + A1·B1 + …), rangé en V(20+n), et l'opération 25 fait
  n ← n + 1.
- Le cas n = 1 (aucun terme B à ajouter) saute la boucle, pour que `--chain`
  puisse partir de zéro. C'est une extension, pas un élément du tableau.

## Tests

```
python3 -m unittest
```

Aucune dépendance : Python 3.10+ et la bibliothèque standard.

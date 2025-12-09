# Acting Shooting Star

Une version terminal de *Crossy Road* basée sur un modèle d’acteurs en TypeScript.

---

## Sujet du projet

- Page du sujet :  
  <https://www.labri.fr/perso/renault/working/teaching/projets/2024-25-S6-Js-Actors.php>  
- Page du projet sur Thor :  
  <https://thor.enseirb-matmeca.fr/ruby/projects/1395>

## Prérequis

```bash
npm install
```

## Compilation

```bash
make build
```

## Exécution

Mettre le terminal en plein écran puis :

```bash
make run
```

## Tests

```bash
make test
```

## Règles du jeu

- Vous incarnez un poulet (`🐔`) et devez traverser un monde infini sans mourir.  
- Contrôles clavier :  
  - `UP` : avancer (gagne des points en montant)  
  - `DOWN`, `LEFT`, `RIGHT` : se déplacer dans les autres directions  
  - `E` : tirer un projectile (`🔥`)  
  - `Q` ou `CTRL+C` : quitter la partie  
- À chaque nouveau record de hauteur, votre score et la difficulté augmentent.  
- Évitez les voitures (`🚗`), les rivières (`🌊`), et les arbres (`🌳`).  
- Si vous touchez un obstacle dangereux : **Game Over**.  
  Vous pourrez alors choisir **OUI (y)** pour rejouer ou **NON (n)** pour quitter.  

## Auteurs

Enzo Picarel, Raphaël Bely, Arno Donias, Thibault Abeille
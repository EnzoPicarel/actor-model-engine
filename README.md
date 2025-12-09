# Acting Shooting Star

A terminal version of *Crossy Road* based on the Actor model in TypeScript.

---

## Project Information

- Project page:  
  <https://www.labri.fr/perso/renault/working/teaching/projets/2024-25-S6-Js-Actors.php>  
- Thor project page:  
  <https://thor.enseirb-matmeca.fr/ruby/projects/1395>

## Prerequisites

```bash
npm install
```

## Build

```bash
make build
```

## Run

Maximize your terminal window then:

```bash
make run
```

## Tests

```bash
make test
```

## Game Rules

- You play as a chicken (`🐔`) and must cross an infinite world without dying.
- Keyboard controls:
  - `UP`: move forward (earn points by going up)
  - `DOWN`, `LEFT`, `RIGHT`: move in other directions
  - `E`: shoot a projectile (`🔥`)
  - `Q` or `CTRL+C`: quit the game
- Each time you reach a new height record, your score and difficulty increase.
- Avoid cars (`🚗`), rivers (`🌊`), and trees (`🌳`).
- If you hit a dangerous obstacle: **Game Over**.
  You can then choose **YES (y)** to play again or **NO (n)** to quit.

## Authors

Enzo Picarel, Raphaël Bely, Arno Donias, Thibault Abeille
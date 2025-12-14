<div align="center">
  <h3 align="center">Actor Model Engine</h3>

  <p align="center">
    A terminal-based <strong>Crossy Road</strong> clone built with the <strong>Actor Model</strong> in TypeScript.
    <br />
    <a href="#-getting-started"><strong>Get Started »</strong></a>
  </p>
  
  ![CI Status](https://img.shields.io/badge/build-passing-brightgreen)
  ![License](https://img.shields.io/badge/license-MIT-blue)
</div>

## 🔍 About The Project
This project is an infinite arcade hopper game played directly in the terminal.

Unlike traditional game loops that run sequentially, this engine utilizes the **Actor Model** paradigm. Each game entity (Chicken, Car, Log) operates as an independent actor with its own private state, communicating exclusively through asynchronous message passing. This architecture simulates concurrency and separates logic from rendering.

*Built as a Semester 6 project at ENSEIRB-MATMECA.*

### 🛠 Built With
* **Language:** TypeScript
* **Runtime:** Node.js
* **Paradigm:** Actor Model (Event-Driven Concurrency)
* **Rendering:** [Terminal Kit](https://github.com/cronvel/terminal-kit)
* **Test Suite:** Jest

## 📐 Architecture

### Technical Highlights
* **Custom Actor System:** The actor system is built from scratch without external concurrency libraries. It uses a `mailbox` pattern (message queues) where every entity is an `Actor` type processing a stream of `Message` objects.
* **Terminal Rendering:** Graphics are rendered using `terminal-kit`, utilizing full-screen mode, cursor management, and ANSI styling to create a glitch-free TUI experience.
* **Concurrency:** The system decouples the "Brain" (Logic) from the "Body" (View). Actors communicate asynchronously via message passing, preventing blocking operations during the game loop.

### File Organization
```text
├── Makefile                # Build automation (build, run, test)
├── package.json            # Dependencies (terminal-kit, typescript, jest)
├── dist/                   # Compiled artifacts (src + test js)
├── src/
│   ├── actor.ts            # Core Actor Model (Mailbox, Message Types, Entity Logic)
│   └── world.ts            # Game Loop, World Generation, and Rendering System
└── test/                   # Unit tests (Jest)
```

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v16+)
* **npm**
* **Make**

### Installation & Build
1. **Clone the repository**
   ```bash
   git clone https://github.com/EnzoPicarel/actor-model-engine.git
   cd actor-model-engine
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   make build
   ```

## ⚡ Execution

To play the game, maximize your terminal window for the best experience (avoid rendering glitches), then run:

```bash
make run
```

## 📜 Controls & Rules

**The Goal:** Cross an infinite procedural world without dying. Score points by moving forward.

* **Movement:**
    * `UP`: Move forward (Score +1)
    * `DOWN`/`LEFT`/`RIGHT`: Navigate obstacles
* **Actions:**
    * `E`: Shoot projectile (`🔥`)
    * `Q` / `Ctrl+C`: Quit
* **Obstacles:**
    * Avoid Cars (`⬛`), Water (`🟦`), and Trees (`🟩`).
* **Progression:** Reaching new distance records increases game speed and difficulty.

## 🧪 Tests
Run the unit test suite to verify actor communication and logic:
```bash
make test
```

## 👥 Authors
* **Enzo Picarel**
* **Raphaël Bely**
* **Arno Donias**
* **Thibault Abeille**

---
*Original Project Specs: [Labri Subject Page](https://www.labri.fr/perso/renault/working/teaching/projets/2024-25-S6-Js-Actors.php)*
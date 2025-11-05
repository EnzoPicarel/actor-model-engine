#!/usr/bin/env node
// @ts-ignore

import terminalKit from 'terminal-kit';

import * as A from './actor.js';

const term = terminalKit.terminal;


const titleArt = [
    "╔═══════════════════════════════════════════════════════════════════════════════════════════╗",
    "║                                                                                           ║",
    "║   ██████╗██████╗  ██████╗ ███████╗███████╗██╗   ██╗    ██████╗  ██████╗  █████╗ ██████╗   ║",
    "║   ██╔═══╝██╔══██╗██╔═══██╗██╔════╝██╔════╝╚██╗ ██╔╝    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗  ║",
    "║   ██║    ██████╔╝██║   ██║███████╗███████╗ ╚████╔╝     ██████╔╝██║   ██║███████║██║  ██║  ║",
    "║   ██║    ██╔══██╗██║   ██║╚════██║╚════██║  ╚██╔╝      ██╔══██╗██║   ██║██╔══██║██║  ██║  ║",
    "║   ██████╗██║  ██║╚██████╔╝███████║███████║   ██║       ██║  ██║╚██████╔╝██║  ██║██████╔╝  ║",
    "║   ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝   ╚═╝       ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝   ║",
    "║                                                                                           ║",
    "╚═══════════════════════════════════════════════════════════════════════════════════════════╝"
];
const FRAME_RATE = 1000 / 60;
const UPDATE_RATE = 50;
const TICK_RATE = 1000;
const COLLIDE_CHECK_RATE = 20;
const CAR_RATE = 200;
const LOG_RATE = 400;
let score = 0;


type World = {
    lines: A.Line[];
    poulet: A.Actor;
    arrayProj: A.Actor[];
}

function run() {
    term.hideCursor();
    term.fullscreen(true);
    term.clear();
    term.bgColor('black').clear();


    const screenBuffer = new terminalKit.ScreenBuffer({
        dst: term,
        width: term.width,
        height: term.height
    });

    const screenWidth = term.width;
    let screenHeight = term.height;
    if (screenHeight % 2 === 1)
        screenHeight = screenHeight - 1;

    if (!screenWidth || !screenHeight) {
        console.error("Could not determine terminal dimensions.");
        process.exit(1);
    }

    const titleStartX = Math.floor((screenWidth - titleArt[0].length) / 2);
    const titleStartY = 1;
    titleArt.forEach((line, index) => {
        screenBuffer.put({
            x: titleStartX,
            y: titleStartY + index,
            attr: {
                color: "white",
                bgcolor: "black",
                bold: true
            }
        }, line);
    });

    const mapWidth = Math.floor(screenWidth / 1.5);
    const mapHeight = Math.floor(screenHeight / 1.5);
    const frameX = Math.floor((screenWidth - mapWidth) / 2);
    const frameY = titleStartY + titleArt.length;
    const line_length: number = mapWidth - 2;
    const nb_line: number = mapHeight - 2;
    let progression = 0;
    let stop = false;


    //variable pour la barre de projectile
    const barreTaille = 10;
    const barreX = (frameY + mapHeight) * 3;
    const barreY = (mapWidth / 3) + 3;


    function drawFrame() {
        const topBorder = Array.from({ length: mapWidth })
            .map((_, x) => ({
                x: frameX + x,
                y: frameY + 1,
                attr: { bgColor: 'white', color: 'white' }
            }));

        const bottomBorder = Array.from({ length: mapWidth })
            .map((_, x) => ({
                x: frameX + x,
                y: frameY + mapHeight - 1,
                attr: { bgColor: 'white', color: 'white' }
            }));

        const sideBorders = Array.from({ length: mapHeight - 2 })
            .flatMap((_, y) => [
                {
                    x: frameX,
                    y: frameY + y + 1,
                    attr: { bgColor: 'white', color: 'white' }
                },
                {
                    x: frameX + mapWidth - 1,
                    y: frameY + y + 1,
                    attr: { bgColor: 'white', color: 'white' }
                }
            ]);

        [...topBorder, ...bottomBorder, ...sideBorders]
            .forEach(position => screenBuffer.put(position, ' '));
    }

    drawFrame();

    function make_world(actors: A.Line[], poulet: A.Actor, arrayProj: A.Actor[]): World {
        const world: World = {
            lines: actors,
            poulet: poulet,
            arrayProj: arrayProj,
        };
        return world;
    }

    function tick_world(world: World): World {
        progression++;
        if (world.poulet.location.y < mapHeight - 2) {
            world.poulet.mailbox.push({ "key": "move", "params": [A.down] });
        }
        else {
            gameOver();
        }
        return make_world(world.lines.map((l: A.Line) => tickLine(l)), world.poulet.update(world.poulet), world.arrayProj);
    }

    function update_world(world: World): World {
        const new_world = make_world(world.lines.map((l: A.Line) => drawLine(l)), drawActor(world.poulet, world.poulet.location.x, world.poulet.location.y), world.arrayProj.map((p: A.Actor) => drawActor(p, p.location.x, p.location.y)));
        screenBuffer.draw({ delta: true });
        return new_world;
    }

    term.grabInput(true);
    let count_void = 0;

    function tickLine(l: A.Line): A.Line {
        if (l.ordinate < 0) {
            count_void++;
            return A.init_line(line_length, nb_line - 1, false, nb_line);
        }
        l.data.map((a: A.Actor) => a.mailbox.push({ "key": "move", "params": [A.down] }));
        l.ordinate -= 1;
        return l;
    }

    function get_current_world(): World {
        return world_buffer[world_buffer_size - 1];
    }

    function go_back_in_time() {
        stop = true;
        world_buffer[world_buffer_size - 1] = world_buffer[0];
        world_buffer[world_buffer_size - 1] = update_world(world_buffer[world_buffer_size - 1]);
        stop = false;
    }

    const world_buffer_size: number = 10;

    const lines: A.Line[] = new Array(nb_line).fill(null).map((_, i: number) => A.init_line(line_length, i, true, nb_line));

    const posInit: A.Position = {
        x: Math.floor(line_length / 2), // Utiliser line_length au lieu de mapWidth
        y: Math.floor(nb_line / 2)      // Utiliser nb_line au lieu de mapHeight
    };
    const poulet: A.Actor = A.make_actor(posInit, A.Name.Chicken);

    const arrayProj: A.Actor[] = new Array;

    let world_buffer: World[] = new Array(world_buffer_size).fill(make_world(lines, poulet, arrayProj));
    world_buffer[world_buffer_size - 1] = make_world(lines, poulet, arrayProj);

    let nbProj = 10;

    let accTick = 0;
    let accUpdate = 0;
    let accCollide = 0;
    let accCar = 0;
    let accLog = 0;

    const mainInterval = setInterval(() => {
        stop = true;
        const current_world = get_current_world();
        if (accTick > TICK_RATE) {
            accTick = 0;

            // Afficher le texte des projectiles
            const ProjectileTXT = nbProj > 1 ? " PROJECTILES." : " PROJECTILE. ";
            screenBuffer.put({
                x: (frameY + mapHeight) * 3,
                y: (mapWidth / 3) + 2,
                attr: { color: "white", bgcolor: "black" }
            }, "IL VOUS RESTE " + nbProj + ProjectileTXT);

            if (nbProj < 10)
                nbProj++;

            // Dessiner la barre de projectiles
            for (let i = 0; i < barreTaille; i++) {
                const char = i < nbProj ? "🔥" : ' ';
                screenBuffer.put({
                    x: barreX + (i * 2),
                    y: barreY,
                    attr: {
                        color: "white",
                        bgcolor: "black"
                    }
                }, char);
            }

            const new_world = tick_world(current_world);
            world_buffer.shift();
            world_buffer[world_buffer_size - 1] = new_world;
        }
        if (accUpdate > UPDATE_RATE) {
            const update_current_world = get_current_world();
            accUpdate = 0;
            world_buffer[world_buffer_size - 1] = update_world(make_world(update_current_world.lines, update_current_world.poulet, update_current_world.arrayProj.map((proj: A.Actor) => {
                proj.mailbox.push({ "key": "move", "params": [A.up] });
                return proj.update(proj);
            }).filter((proj: A.Actor) => proj.location.y > 1)));
        }
        if (accCollide > COLLIDE_CHECK_RATE) {
            const collide_world = get_current_world();
            accCollide = 0;
            if (checkCollision()) {
                gameOver();
            }
            world_buffer[world_buffer_size - 1] = collisionProj(collide_world);
        }
        if (accLog > LOG_RATE) {
            accLog = 0;
            log_move(get_current_world());
        }
        if (accCar > CAR_RATE) {
            accCar = 0;
            car_move(get_current_world());
        }
        screenBuffer.put({ x: frameY + mapHeight, y: (mapWidth / 3) + 2, attr: { color: "white", bgcolor: "black" } }, "SCORE : " + score);
        stop = false;
        accTick += FRAME_RATE;
        accUpdate += FRAME_RATE;
        accCollide += FRAME_RATE;
        accCar += FRAME_RATE;
        accLog += FRAME_RATE;
    }, FRAME_RATE);

    function drawActor(a: A.Actor, x: number, y: number): A.Actor {
        if (y > nb_line) return a.update(a);

        const screenX = frameX + x + 1;
        const screenY = frameY + y;

        const attr = { color: 'white', bgColor: 'black' };
        let char = ' ';

        if (a.name === A.Name.Tree) attr.bgColor = 'green';
        else if ([A.Name.Water_R, A.Name.Water_L].includes(a.name)) attr.bgColor = 'cyan';
        else if ([A.Name.Log_R, A.Name.Log_L].includes(a.name)) attr.bgColor = 94 as any;
        else if ([A.Name.Car_R, A.Name.Car_L].includes(a.name)) attr.bgColor = 'grey';
        else if (a.name === A.Name.Chicken) char = '🐔';
        else if (a.name === A.Name.Projectile) char = '🔥';

        screenBuffer.put({ x: screenX, y: screenY, attr }, char);
        return a.update(a);
    }


    function drawLine(l: A.Line): A.Line {
        l.data = l.data.map((a: A.Actor) => drawActor(a, a.location.x, nb_line - l.ordinate + 1));
        return l;
    }

    function getDirection(actors: A.Actor[]): 'left' | 'right' | null {
        for (const actor of actors) {
            if (actor.name === A.Name.Car_R || actor.name === A.Name.Log_R || actor.name === A.Name.Water_R) return 'right';
            if (actor.name === A.Name.Car_L || actor.name === A.Name.Log_L || actor.name === A.Name.Water_L) return 'left';
        }
        return null; // aucune voiture trouvée
    }

    function car_move(current_world: World) {
        const roads = current_world.lines.filter((l) => l.type === A.LineType.Road);
        roads.map((r) => {
            const l = r.data.length;
            if (getDirection(r.data) === 'left') {
                r.data = r.data.slice(1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.left] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Car_L));
                }
                else {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Empty));
                }
            }
            else if (getDirection(r.data) === 'right') {
                r.data = r.data.slice(0, -1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.right] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Car_R));
                }
                else {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Empty));
                }
            }
            r.patternIndex += 1;
            return r;
        });
    }

    function log_move(current_world: World) {
        const rivers = current_world.lines.filter((l) => l.type === 3);
        rivers.map((r) => {
            r.data.forEach((a) => {
                const realY_log = nb_line - r.ordinate + 1;
                if (a.location.x === current_world.poulet.location.x && realY_log === current_world.poulet.location.y && a.name === A.Name.Log_R)
                    current_world.poulet.mailbox.push({ "key": "move", "params": [A.right] });
                else if (a.location.x === current_world.poulet.location.x && realY_log === current_world.poulet.location.y && a.name === A.Name.Log_L)
                    current_world.poulet.mailbox.push({ "key": "move", "params": [A.left] });

            });

            const l = r.data.length;
            if (getDirection(r.data) === 'left') {
                r.data = r.data.slice(1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.left] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Log_L));
                }
                else {
                    r.data.push(A.make_actor({ x: l - 1, y: r.ordinate }, A.Name.Water_L));
                }
            }
            else if (getDirection(r.data) === 'right') {
                r.data = r.data.slice(0, -1);
                r.data.map((a) => a.mailbox.push({ "key": "move", "params": [A.right] }));
                if (r.pattern[r.patternIndex] === 1) {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Log_R));
                }
                else {
                    r.data.unshift(A.make_actor({ x: 0, y: r.ordinate }, A.Name.Water_R));
                }
            }
            r.patternIndex += 1;
            return r;
        });
    }

    function isCollision(a: A.Actor, b: A.Actor): boolean {
        // Trouver la ligne contenant l'acteur
        const actorLine = get_current_world().lines.find((line: A.Line) =>
            line.data.includes(a)
        );

        if (!actorLine) return false;

        // Calculer la coordonnée Y réelle (même transformation que pour l'affichage)
        const realY = nb_line - actorLine.ordinate + 1;

        // Vérifie si les positions correspondent (avec coordonnée Y transformée)
        if (a.location.x !== get_current_world().poulet.location.x || realY !== get_current_world().poulet.location.y) {
            return false;
        }


        const safeActors = [A.Name.Log_R, A.Name.Log_L];
        const dangerousActors = [
            A.Name.Car_R, A.Name.Car_L,
            A.Name.Water_R, A.Name.Water_L,
            A.Name.Tree
        ];

        return dangerousActors.includes(a.name);
    }

    function checkCollision(): boolean {
        return get_current_world().lines.some((line: A.Line) =>
            line.data.some((actor: A.Actor) => isCollision(actor, get_current_world().poulet))
        );
    }

    function collisionProj(current_world: World): World {
        // Copie des lignes pour éviter la modification directe
        const updatedLines = [...current_world.lines];

        // Filtrer les projectiles qui n'ont pas touché de cible
        const remainingProj = current_world.arrayProj.filter((proj: A.Actor) => {
            let hasHit = false;

            updatedLines.forEach((line: A.Line) => {
                const realY = nb_line - line.ordinate + 1;
                if (realY === proj.location.y) {
                    // Vérifier les 3 positions : gauche, centre et droite
                    for (let xOffset = -1; xOffset <= 1; xOffset++) {
                        const targetX = proj.location.x + xOffset;

                        // Vérifier que la position est dans les limites
                        if (targetX >= 0 && targetX < line.data.length) {
                            const hitIndex = line.data.findIndex(actor =>
                                actor.location.x === targetX &&
                                actor.name !== A.Name.Chicken &&
                                actor.name !== A.Name.Empty &&
                                actor.name !== A.Name.Water_L &&
                                actor.name !== A.Name.Water_R &&
                                actor.name !== A.Name.Log_L &&
                                actor.name !== A.Name.Log_R
                            );

                            if (hitIndex !== -1) {
                                // Remplacer l'acteur touché par un espace vide
                                line.data[hitIndex] = A.make_actor(
                                    { x: line.data[hitIndex].location.x, y: line.data[hitIndex].location.y },
                                    A.Name.Empty
                                );
                                hasHit = true;
                            }
                        }
                    }
                }
            });

            return !hasHit;
        });

        return make_world(
            updatedLines,
            current_world.poulet,
            remainingProj
        );
    }

    function gameOver() {
        term("\x1B[?25h");
        clearInterval(mainInterval);
        term.grabInput(false);
        term.bgColor('black').clear();


        term.clear();
        screenBuffer.clear();

        const gameOverX = Math.floor(term.width / 2) - 5;
        const gameOverY = Math.floor(term.height / 2);
        screenBuffer.put({ x: gameOverX, y: gameOverY, attr: { color: 'white', bgColor: 'black' } }, "💥 GAME OVER 💥\n");

        const questionX = Math.floor(term.width / 2) - 10;
        const questionY = gameOverY + 2;
        screenBuffer.put({ x: questionX, y: questionY, attr: { color: 'white', bgColor: 'black' } }, "Voulez-vous continuer ?");

        const buttonX = Math.floor(term.width / 2) - 6;
        const buttonY = questionY + 2;

        screenBuffer.put({ x: buttonX, y: buttonY, attr: { color: 'green', bgColor: 'black' } }, "OUI (y)");

        screenBuffer.put({ x: buttonX + 10, y: buttonY, attr: { color: 'red', bgColor: 'black' } }, "NON (n)");
        screenBuffer.draw();

        term.grabInput(true);
        term.on('key', (name: string) => {
            if (name === 'y' || name === 'ENTER' || name === 'o') {
                term.grabInput(true);
                term.clear();
                term.moveTo(1, 1);
                screenBuffer.clear();
                screenBuffer.draw();
                term.removeAllListeners('key');
                score = 0;
                run();
            } else if (name === 'n' || name === 'q' || name === 'CTRL_C') {
                screenBuffer.clear();
                screenBuffer.draw();
                term.grabInput(false);
                term.styleReset();
                term.clear();
                term.moveTo(1, 1);
                term("\x1B[?25h");
                process.exit(0);
            }
        });
    }

    let maxPouletWorldY = getPouletWorldY(get_current_world());

    function getPouletWorldY(current_world: World): number {
        return progression + (nb_line - current_world.poulet.location.y);
    }

    term.on('key', (name: string) => {
        if (name === 'q' || name === 'CTRL_C') {
            term.styleReset();
            term.clear();
            term("\x1B[?25h");
            clearInterval(mainInterval);
            term.grabInput(false);
            process.exit(0);
        }
        if (name === 'e') {
            if (nbProj > 0) {
                const locationProj: A.Position = {
                    x: get_current_world().poulet.location.x,
                    y: get_current_world().poulet.location.y - 1
                };


                // Afficher le texte mis à jour
                const ProjectileTXT = nbProj > 1 ? " PROJECTILES." : " PROJECTILE. ";
                screenBuffer.put({
                    x: (frameY + mapHeight) * 3,
                    y: (mapWidth / 3) + 2,
                    attr: { color: "white", bgcolor: "black" }
                }, "IL VOUS RESTE " + nbProj + ProjectileTXT);

                get_current_world().arrayProj.push(A.make_actor(locationProj, A.Name.Projectile));
                nbProj--;


                // Mettre à jour la barre de projectiles
                for (let i = 0; i < barreTaille; i++) {
                    const char = i < nbProj ? "🔥" : " ";
                    screenBuffer.put({
                        x: barreX + (i * 2),
                        y: barreY,
                        attr: {
                            color: "white",
                            bgcolor: "black"
                        }
                    }, char);
                }

                screenBuffer.draw();
            }
            else {
                screenBuffer.put({ x: (frameY + mapHeight) * 3, y: (mapWidth / 3) + 2, attr: { color: "red", bgcolor: "black" } }, "      I NEED MORE BULLET.       ");

            }
        }
        else if (name === 'UP' && get_current_world().poulet.location.y > 2) {
            stop = true;
            const current_world = get_current_world();

            // Appliquer le mouvement vers le haut
            let updatedPoulet = {
                ...current_world.poulet,
                mailbox: [...current_world.poulet.mailbox, { "key": "move", "params": [A.up] }]
            };

            let newProgression = progression;
            let newLines = current_world.lines;

            // Si on doit avancer les lignes (poulet dans la moitié haute)
            if (updatedPoulet.location.y < nb_line / 2) {
                newLines = newLines.map((l: A.Line) => tickLine(l));
                newProgression++;
                // Mouvement vers le bas automatique si pas tout en haut
                if (updatedPoulet.location.y < mapHeight - 2) {
                    updatedPoulet = {
                        ...updatedPoulet,
                        mailbox: [...updatedPoulet.mailbox, { "key": "move", "params": [A.down] }]
                    };
                }
            }

            // Mettre à jour le poulet (après tous les mouvements)
            const finalPoulet = updatedPoulet.update(updatedPoulet);

            // Calculer le nouveau score et progression APRÈS déplacement
            const worldY = newProgression + (nb_line - finalPoulet.location.y);
            let scoreIncrement = 0;
            if (worldY > maxPouletWorldY) {
                scoreIncrement = worldY - maxPouletWorldY;
                maxPouletWorldY = worldY;
                score += scoreIncrement;
            }

            // Créer le nouveau monde
            const new_world = make_world(
                newLines,
                finalPoulet,
                current_world.arrayProj
            );

            // Mettre à jour le buffer
            world_buffer = [
                ...world_buffer.slice(1),
                new_world
            ];

            // Mettre à jour les variables globales
            progression = newProgression;

            if (finalPoulet.location.y < nb_line / 2 && finalPoulet.location.y >= mapHeight - 2) {
                gameOver();
            }
            stop = false;
        }
        else if (name === 'DOWN' && get_current_world().poulet.location.y < nb_line) {
            const current_world = get_current_world();

            // Créer un nouveau poulet avec une mailbox mise à jour
            const updatedPoulet = {
                ...current_world.poulet,
                mailbox: [...current_world.poulet.mailbox, { "key": "move", "params": [A.down] }]
            };

            // Créer le nouveau monde
            const new_world = make_world(
                current_world.lines,
                updatedPoulet.update(updatedPoulet),
                current_world.arrayProj
            );

            // Mettre à jour le buffer de manière immutable
            world_buffer = [
                ...world_buffer.slice(1),
                new_world
            ];
        }
        else if (name === 'LEFT' && get_current_world().poulet.location.x > 0) {

            const current_world = get_current_world();

            // Créer un nouveau poulet avec une mailbox mise à jour
            const updatedPoulet = {
                ...current_world.poulet,
                mailbox: [...current_world.poulet.mailbox, { "key": "move", "params": [A.left] }]
            };

            // Créer le nouveau monde
            const new_world = make_world(
                current_world.lines,
                updatedPoulet.update(updatedPoulet),
                current_world.arrayProj
            );

            // Mettre à jour le buffer de manière immutable
            world_buffer = [
                ...world_buffer.slice(1),
                new_world
            ];
        }
        else if (name === 'RIGHT' && get_current_world().poulet.location.x < line_length - 2) {
            const current_world = get_current_world();

            // Créer un nouveau poulet avec une mailbox mise à jour
            const updatedPoulet = {
                ...current_world.poulet,
                mailbox: [...current_world.poulet.mailbox, { "key": "move", "params": [A.right] }]
            };

            // Créer le nouveau monde
            const new_world = make_world(
                current_world.lines,
                updatedPoulet.update(updatedPoulet),
                current_world.arrayProj
            );

            // Mettre à jour le buffer de manière immutable
            world_buffer = [
                ...world_buffer.slice(1),
                new_world
            ];
        }
    });
}
run();

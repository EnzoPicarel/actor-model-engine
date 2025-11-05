import { group } from "console";

const right: Position = {
    x: 1,
    y: 0
};
const left: Position = {
    x: -1,
    y: 0
};

const up: Position = {
    x: 0,
    y: -1
};

const down: Position = {
    x: 0,
    y: 1
};

type Position = {
    x: number;
    y: number;
}

type Message = {
    key: string;
    params: any[];
}

type Line = {
    ordinate: number;
    type: LineType;
    data: Actor[];
    pattern: number[];
    patternIndex: number;
}

type Actor = {
    location: Position;
    mailbox: Message[];
    send: (m: Message) => void;
    actions: {
        [key: string]: (a: Actor, ...rest: any) => Actor;
    }
    update: (a: Actor) => Actor;
    name: Name;
}

enum Name {
    Empty = 0,
    Chicken,
    Tree,
    Water_R,
    Water_L,
    Log_R,
    Log_L,
    Car_R,
    Car_L,
    Projectile
};

enum LineType {
    FirstLine = 0,
    Nature,
    Road,
    River
};

// Retourne un acteur avec une position définie et une action de déplacement initialisée
function make_actor(p: Position, n: Name): Actor {
    const a: Actor = {
        location: p,
        mailbox: [],  // Boîte aux lettres vide au départ
        send: (m: Message): void => {
            // console.log(`The actor ${n} sent the message: ${m.key}`, m.params);
        },
        actions: {},
        update: (actor: Actor): Actor => {
            // Créer un nouvel acteur avec les mêmes propriétés mais une boîte vide
            let updatedActor = make_actor(actor.location, actor.name);

            // Copier les actions
            updatedActor.actions = { ...actor.actions };

            const valid_actions = actor.mailbox.filter((msg) => Boolean(actor.actions[msg.key]));
            updatedActor = valid_actions.reduce((updatedActor, msg) => actor.actions[msg.key](updatedActor, ...msg.params), updatedActor);

            // Vider la boîte aux lettres
            updatedActor.mailbox = [];

            // Retourner l'acteur mis à jour
            return updatedActor;
        },
        name: n
    };

    // Définir les actions standard
    a.actions.move = (a: Actor, dx: Position): Actor => {
        const newActor = make_actor(position_add(a.location, dx), n);
        newActor.actions = { ...a.actions };
        return newActor;
    };

    a.actions.collide = (a: Actor): Actor => {
        const new_actor = make_actor(a.location, a.name);
        new_actor.actions = { ...a.actions };
        new_actor.send({ key: "die", params: [] });
        return new_actor;
    };

    a.actions.tick = (a: Actor): Actor => {
        // Implémenter le comportement automatique selon le type d'acteur
        const newActor = make_actor(a.location, a.name);
        newActor.actions = { ...a.actions };

        switch (a.name) {
            case Name.Water_R:
                return newActor.actions.move(newActor, right);
            case Name.Water_L:
                return newActor.actions.move(newActor, left);
            case Name.Log_R:
                return newActor.actions.move(newActor, right);
            case Name.Log_L:
                return newActor.actions.move(newActor, left);
            case Name.Car_R:
                return newActor.actions.move(newActor, right);
            case Name.Car_L:
                return newActor.actions.move(newActor, left);
        }

        return newActor;
    };

    return a;
}

// Mettre à jour la position courante avec un changement dx
function position_add(current_position: Position, dx: Position): Position {
    const pos: Position = {
        x: current_position.x + dx.x,
        y: current_position.y + dx.y
    };
    return pos;
}


let river_direction = 0;
let nb_generated_line = 0;
let difficulty = 1;
const level_size = 20;
function init_line(size_x: number, size_y: number, is_start: boolean, nb_line: number): Line {
    if (is_start && nb_generated_line > nb_line) {
        nb_generated_line = 0;
        difficulty = 1;
    }
    nb_generated_line += 1;
    let is_void = 1;
    if (nb_generated_line > nb_line && nb_generated_line % level_size === 0) {
        difficulty += 1;
    }
    if (difficulty < 5) {
        if (nb_generated_line % 2 === 0) {
            is_void = 0;
        }
    }
    else {
        is_void = 1;
    }

    let random_line: number = Math.random();
    if (random_line <= Math.max(0, 0.7 - difficulty * 0.03)) {
        random_line = 1;
    }
    else if (random_line > Math.max(0, 0.7 - difficulty * 0.03) && random_line < Math.max(0.6, 0.9 - difficulty * 0.01)) {
        random_line = 2;
    }
    else {
        random_line = 3;
    }

    const obstacleProbability = Math.min(difficulty * 0.03, 0.8);  // De 0% à 80%

    const l: Line = {
        ordinate: size_y,
        type: random_line,
        data: new Array(size_x).fill(make_actor({ x: 0, y: size_y }, Name.Empty)),
        pattern: new Array(size_x).fill(0),
        patternIndex: 0
    };
    if (is_start || is_void === 0) {
        l.data = l.data.map((_, i) => make_actor({ x: i, y: size_y }, Name.Empty));
        return l;
    }
    switch (l.type) {
        case LineType.Nature:
            l.data = generatePatternedLine(size_x, Name.Tree, obstacleProbability, l.ordinate);
            break;
        case LineType.Road:
            l.data = generatePatternedLine(size_x, Math.random() > 0.5 ? Name.Car_L : Name.Car_R, obstacleProbability, l.ordinate);
            l.pattern = generateObstaclePattern(size_x, obstacleProbability);
            break;
        case LineType.River:
            river_direction = river_direction + 1;
            l.data = generatePatternedLine(size_x, (river_direction % 2 === 0) ? Name.Water_L : Name.Water_R, obstacleProbability, l.ordinate);
            l.pattern = generateObstaclePattern(size_x, obstacleProbability);
            break;
        default:
            console.log("Inexistant type of line or start line that shouldn't be here");
            break;
    }
    return l;
};

function generateObstaclePattern(size_x: number, probability: number): number[] {
    function aux(remaining: number): number[] {
        if (remaining <= 0) return [];

        if (Math.random() < probability) {
            const groupSize = Math.min(Math.floor(Math.random() * 4) + 2, remaining);
            return Array(groupSize).fill(1).concat(aux(remaining - groupSize));
        } else {
            return [0, 0].concat(aux(remaining - 1));
        }
    }
    return aux(size_x);
};

function generatePatternedLine(size_x: number, obstacleType: Name, probability: number, y: number): Array<any> {
    const linePattern = generateObstaclePattern(size_x, probability);
    return [...Array(size_x)].map((_, i) => {
        if (linePattern[i] === 1) { // si obstacle
            return make_actor({ x: i, y }, obstacleType);
        }
        else if (obstacleType === Name.Water_L) {
            return make_actor({ x: i, y }, Name.Log_L);
        }
        else if (obstacleType === Name.Water_R) {
            return make_actor({ x: i, y }, Name.Log_R);
        }
        return make_actor({ x: i, y }, Name.Empty);
    });
}

export {
    right, left, up, down, Position, Message, Actor, Line, Name, LineType, make_actor, position_add, init_line, difficulty
};

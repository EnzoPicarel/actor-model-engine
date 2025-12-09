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

// Returns an actor with a defined position and initialized movement action
function make_actor(p: Position, n: Name): Actor {
    const a: Actor = {
        location: p,
        mailbox: [],  // Empty mailbox at start
        send: (m: Message): void => {
            // console.log(`The actor ${n} sent the message: ${m.key}`, m.params);
        },
        actions: {},
        update: (actor: Actor): Actor => {
            // Create a new actor with the same properties but empty mailbox
            let updatedActor = make_actor(actor.location, actor.name);

            // Copy actions
            updatedActor.actions = { ...actor.actions };

            const valid_actions = actor.mailbox.filter((msg) => Boolean(actor.actions[msg.key]));
            updatedActor = valid_actions.reduce((updatedActor, msg) => actor.actions[msg.key](updatedActor, ...msg.params), updatedActor);

            // Clear the mailbox
            updatedActor.mailbox = [];

            // Return the updated actor
            return updatedActor;
        },
        name: n
    };

    // Define standard actions
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
        // Implement automatic behavior based on actor type
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

// Update current position with a dx change
function position_add(current_position: Position, dx: Position): Position {
    const pos: Position = {
        x: current_position.x + dx.x,
        y: current_position.y + dx.y
    };
    return pos;
}


let river_direction = 0;
let num_generated_lines = 0;
let difficulty = 1;
const level_size = 20;

function init_line(size_x: number, size_y: number, is_start: boolean, num_lines: number): Line {
    if (is_start && num_generated_lines > num_lines) {
        num_generated_lines = 0;
        difficulty = 1;
    }
    num_generated_lines += 1;
    let is_empty = 1;
    if (num_generated_lines > num_lines && num_generated_lines % level_size === 0) {
        difficulty += 1;
    }
    if (difficulty < 5) {
        if (num_generated_lines % 2 === 0) {
            is_empty = 0;
        }
    }
    else {
        is_empty = 1;
    }

    let random_line_type: number = Math.random();
    if (random_line_type <= Math.max(0, 0.7 - difficulty * 0.03)) {
        random_line_type = 1;
    }
    else if (random_line_type > Math.max(0, 0.7 - difficulty * 0.03) && random_line_type < Math.max(0.6, 0.9 - difficulty * 0.01)) {
        random_line_type = 2;
    }
    else {
        random_line_type = 3;
    }

    const obstacleProbability = Math.min(difficulty * 0.03, 0.8);  // From 0% to 80%

    const l: Line = {
        ordinate: size_y,
        type: random_line_type,
        data: new Array(size_x).fill(make_actor({ x: 0, y: size_y }, Name.Empty)),
        pattern: new Array(size_x).fill(0),
        patternIndex: 0
    };
    if (is_start || is_empty === 0) {
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
            console.log("Non-existent line type or start line that shouldn't be here");
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
        if (linePattern[i] === 1) { // if obstacle
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

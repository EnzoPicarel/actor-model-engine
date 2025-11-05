import * as A from '#src/actor';
//import * as W from '#src/scriptTS/world';

describe('Actor game test suite', () => {
    test('Position add should work correctly', () => {
        const pos1 = { x: 5, y: 10 };
        const pos2 = { x: 3, y: -2 };
        const result = A.position_add(pos1, pos2);
        expect(result).toEqual({ x: 8, y: 8 });
    });

    test('Make actor should create an actor with correct properties', () => {
        const pos: A.Position = { x: 10, y: 20 };
        const name = A.Name.Chicken;
        const actor = A.make_actor(pos, name);

        expect(actor.location).toEqual(pos);
        expect(actor.name).toBe(name);
        expect(typeof actor.send).toBe('function');
        expect(typeof actor.actions.move).toBe('function');
        expect(typeof actor.actions.tick).toBe('function');
    });

    test('Chicken should be initialized at correct position', () => {
        const pos: A.Position = { x: 30, y: 5 };
        const chicken = A.make_actor(pos, A.Name.Chicken);
        expect(chicken.location).toEqual({ x: 30, y: 5 });
        expect(chicken.name).toBe(A.Name.Chicken);
        expect(typeof chicken.actions.collide).toBe('function');
    });

    test('Tree should be initialized at given position', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const tree = A.make_actor(pos, A.Name.Tree);
        expect(tree.location).toEqual(pos);
        expect(tree.name).toBe(A.Name.Tree);
    });

    test('Water right should move right on tick', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const water = A.make_actor(pos, A.Name.Water_R);
        expect(water.name).toBe(A.Name.Water_R);

        const afterTick = water.actions.tick(water);
        expect(afterTick.location).toEqual({ x: 6, y: 10 });
    });

    test('Water left should move left on tick', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const water = A.make_actor(pos, A.Name.Water_L);
        expect(water.name).toBe(A.Name.Water_L);

        const afterTick = water.actions.tick(water);
        expect(afterTick.location).toEqual({ x: 4, y: 10 });
    });

    test('Log right should move right on tick', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const log = A.make_actor(pos, A.Name.Log_R);
        expect(log.name).toBe(A.Name.Log_R);

        const afterTick = log.actions.tick(log);
        expect(afterTick.location).toEqual({ x: 6, y: 10 });
    });

    test('Log left should move left on tick', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const log = A.make_actor(pos, A.Name.Log_L);
        expect(log.name).toBe(A.Name.Log_L);

        const afterTick = log.actions.tick(log);
        expect(afterTick.location).toEqual({ x: 4, y: 10 });
    });

    test('Car right should move right on tick', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const car = A.make_actor(pos, A.Name.Car_R);
        expect(car.name).toBe(A.Name.Car_R);

        const afterTick = car.actions.tick(car);
        expect(afterTick.location).toEqual({ x: 6, y: 10 });
    });

    test('Car left should be initialized with correct name', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const car = A.make_actor(pos, A.Name.Car_L);
        expect(car.location).toEqual(pos);
        expect(car.name).toBe(A.Name.Car_L);

        const afterTick = car.actions.tick(car);
        expect(afterTick.location).toEqual({ x: 4, y: 10 });
    });

    test('Actor update should handle empty mailbox', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const actor = A.make_actor(pos, A.Name.Chicken);

        const updatedActor = actor.update(actor);
        expect(updatedActor.location).toEqual(pos);
        expect(updatedActor.mailbox).toEqual([]);
    });

    test('Chicken should not move on tick', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const chicken = A.make_actor(pos, A.Name.Chicken);

        const afterTick = chicken.actions.tick(chicken);
        expect(afterTick.location).toEqual(pos);
    });

    test('Tree should not move on tick', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const tree = A.make_actor(pos, A.Name.Tree);

        const afterTick = tree.actions.tick(tree);
        expect(afterTick.location).toEqual(pos);
    });

    test('Actor can move in all directions', () => {
        const pos: A.Position = { x: 5, y: 10 };
        const actor = A.make_actor(pos, A.Name.Chicken);

        const movedRight = actor.actions.move(actor, A.right);
        expect(movedRight.location).toEqual({ x: 6, y: 10 });

        const movedLeft = actor.actions.move(actor, A.left);
        expect(movedLeft.location).toEqual({ x: 4, y: 10 });

        const movedUp = actor.actions.move(actor, A.up);
        expect(movedUp.location).toEqual({ x: 5, y: 9 });

        const movedDown = actor.actions.move(actor, A.down);
        expect(movedDown.location).toEqual({ x: 5, y: 11 });
    });

    test('Init line should create a valid line structure', () => {
        const line = A.init_line(60, 5, false, 30);

        expect(line.ordinate).toBe(5);
        expect(line.data.length).toBe(60);
        expect([A.LineType.Nature, A.LineType.Road, A.LineType.River]).toContain(line.type);

        // Vérifier que certains éléments sont initialisés
        const hasElements = line.data.some(actor => actor !== null && actor !== undefined);
        expect(hasElements).toBe(true);
    });

    test('Init line should preserve the ordinate value', () => {
        const line1 = A.init_line(10, 1, false, 30);
        const line2 = A.init_line(10, 5, false, 30);
        const line3 = A.init_line(10, 10, false, 30);

        expect(line1.ordinate).toBe(1);
        expect(line2.ordinate).toBe(5);
        expect(line3.ordinate).toBe(10);
    });

    test('Init line should handle different sizes', () => {
        const line1 = A.init_line(5, 1, false, 30);
        const line2 = A.init_line(15, 1, false, 30);
        const line3 = A.init_line(20, 1, false, 30);

        expect(line1.data.length).toBe(5);
        expect(line2.data.length).toBe(15);
        expect(line3.data.length).toBe(20);
    });

    test('Actor movement should update position', () => {
        const position = { x: 5, y: 10 };
        const actor = A.make_actor(position, A.Name.Chicken);

        const movedActor = actor.actions.move(actor, A.right);
        expect(movedActor.location).toEqual({ x: 6, y: 10 });

        const movedAgain = movedActor.actions.move(movedActor, A.up);
        expect(movedAgain.location).toEqual({ x: 6, y: 9 });
    });

    /*
    test('Collide action should create a new actor with same properties and send a die message', () => {        // test à corriger
        const position = { x: 5, y: 10 };
        const actor = A.make_actor(position, A.Name.Chicken);

        // Définir messageSent avec un message par défaut
        let messageSent: A.Message = { key: "", params: [] };

        // Espionner la méthode send
        const originalSend = actor.send;
        actor.send = (message) => {
            messageSent = message;
            originalSend.call(actor, message);
        };

        // Action
        const collidedActor = actor.actions.collide(actor);
        
        // Assert
        // 1. Vérifier que l'acteur retourné a la même position et le même nom
        expect(collidedActor.location).toEqual(position);
        expect(collidedActor.name).toBe(A.Name.Chicken);

        // 2. Vérifier que le message "die" a été envoyé
        expect(messageSent).not.toBeNull();
        expect(messageSent.key).toBe("die");
        expect(messageSent.params).toEqual([]);
    });
    */

});
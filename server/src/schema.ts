import { ArraySchema, Schema, type } from '@colyseus/schema';

export class Bird extends Schema {
    @type('number')
    x: number = 0;

    @type('number')
    y: number = 0;

    @type('number')
    width: number = 0;

    @type('number')
    height: number = 0;

    @type('string')
    username: string = '';

    @type('string')
    clientId: string = '';
}

export class Pipe extends Schema {
    @type('number')
    x: number = 0;

    @type('number')
    y: number = 0;

    @type('number')
    width: number = 0;

    @type('number')
    height: number = 0;
}

export class State extends Schema {
    @type({ array: Bird })
    readonly birds = new ArraySchema<Bird>();

    @type({ array: Pipe })
    readonly pipes = new ArraySchema<Pipe>();

    @type('string')
    ownerUsername: string = ''

    @type('boolean')
    started: boolean = false;

    @type('boolean')
    multiplayer: boolean = false;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = exports.Pipe = exports.Bird = void 0;
const schema_1 = require("@colyseus/schema");
class Bird extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.username = '';
        this.clientId = '';
    }
}
__decorate([
    (0, schema_1.type)('number')
], Bird.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number')
], Bird.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('number')
], Bird.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)('number')
], Bird.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)('string')
], Bird.prototype, "username", void 0);
__decorate([
    (0, schema_1.type)('string')
], Bird.prototype, "clientId", void 0);
exports.Bird = Bird;
class Pipe extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
}
__decorate([
    (0, schema_1.type)('number')
], Pipe.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number')
], Pipe.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('number')
], Pipe.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)('number')
], Pipe.prototype, "height", void 0);
exports.Pipe = Pipe;
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.birds = new schema_1.ArraySchema();
        this.pipes = new schema_1.ArraySchema();
        this.ownerUsername = '';
        this.started = false;
        this.multiplayer = false;
    }
}
__decorate([
    (0, schema_1.type)({ array: Bird })
], State.prototype, "birds", void 0);
__decorate([
    (0, schema_1.type)({ array: Pipe })
], State.prototype, "pipes", void 0);
__decorate([
    (0, schema_1.type)('string')
], State.prototype, "ownerUsername", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], State.prototype, "started", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], State.prototype, "multiplayer", void 0);
exports.State = State;

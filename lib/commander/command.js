"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const database_1 = require("../database");
class Command {
    constructor(params) {
        this.trigger = params.trigger;
        this.handler = params.handler;
        this.tag = params.tag || '';
        this.rights = Array.isArray(params.rights)
            ? params.rights
            : [params.rights];
        if (!this.rights.includes(database_1.UserType.ADMIN))
            this.rights.push(database_1.UserType.ADMIN);
    }
}
exports.Command = Command;

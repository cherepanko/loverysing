"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const database_1 = require("../../database");
const command_1 = require("../command");
exports.test = new command_1.Command({
    trigger: /^тест|test$/i,
    tag: 'test',
    rights: database_1.UserType.USER,
    handler: async (context) => {
        return context.send('ok');
    }
});

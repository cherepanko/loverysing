"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balance = void 0;
const database_1 = require("../../database");
const command_1 = require("../command");
exports.balance = new command_1.Command({
    tag: 'balance',
    trigger: /баланс/i,
    rights: database_1.UserType.USER,
    handler: async (context) => {
        return context.send(`Ваш баланс: ${context.user.balance}₽`);
    }
});

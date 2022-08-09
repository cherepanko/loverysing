"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replenish = void 0;
const vk_io_1 = require("vk-io");
const database_1 = require("../../database");
const command_1 = require("../command");
exports.replenish = new command_1.Command({
    tag: 'replenish',
    trigger: /Пополнить/i,
    rights: database_1.UserType.USER,
    handler: async (context) => {
        return context.send('Для пополнения перейдите по ссылке ниже', {
            keyboard: vk_io_1.Keyboard.keyboard([
                vk_io_1.Keyboard.urlButton({
                    label: `${"&#10004;" /* OK */} Продолжить`,
                    url: `https://lovebott.ru/pay?vkid=${context.senderId}`,
                })
            ]).inline()
        });
    }
});

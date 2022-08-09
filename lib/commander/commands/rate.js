"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rate = void 0;
const common_tags_1 = require("common-tags");
const database_1 = require("../../database");
const command_1 = require("../command");
exports.rate = new command_1.Command({
    tag: 'rate',
    rights: database_1.UserType.USER,
    handler: async (context) => {
        return context.mainMenu((0, common_tags_1.stripIndent) `
            Спасибо! 👍

            На основе вашей оценки мы постараемся улучшить анализ данных ☺
        `);
    }
});

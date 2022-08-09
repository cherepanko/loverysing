"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toKnowOther = void 0;
const node_fetch_1 = require("node-fetch");
const database_1 = require("../../database");
const helpers_1 = require("../../helpers");
const vk_1 = require("../../vk");
const command_1 = require("../command");
exports.toKnowOther = new command_1.Command({
    tag: 'to-know-other',
    rights: database_1.UserType.USER,
    trigger: /^(?:другой)$/i,
    handler: async (context) => {
        if (!context.user.hasSubscribe) {
            return context.mainMenu();
        }
        const userName = await context.question(`${"&#10004;" /* OK */} Введите ссылку на человека:`, {
            answerTimeLimit: 1000 * 60 * 10
        });
        if (!userName.text || userName.isTimeout) {
            return context.mainMenu('Вы не ввели ссылку на человека');
        }
        const userId = await (0, helpers_1.parseUserId)(userName.text);
        if (userId === null) {
            return context.mainMenu('Неверная ссылка');
        }
        const [vkUser] = await vk_1.vk.api.users.get({
            user_id: userId,
            fields: ['sex', 'bdate', 'country', 'city']
        });
        const response = await (0, node_fetch_1.default)(`https://vk.com/foaf.php?id=${userId}`).then(x => x.text());
        const mathced = response.match(/(<ya:created dc:date="(?<date>.*)"\/>)/);
        console.log(mathced?.groups?.date);
        // ID: 1
        // Имя: Павел
        // Фамилия: Дуров
        // Пол: Мужской
        // Год рождения: 10.10.1984
        // Страна: Россия
        // Город: Санкт-Петербург
        // Дата регистрации: 2006-09-23 20:27:12
        // 💌 Кого лайкает пользователь: ?
        // 🏆 Важные друзья пользователя: ?
        // 👥 Скрытые друзья пользователя: ?
    }
});

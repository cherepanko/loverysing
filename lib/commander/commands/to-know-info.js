"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toKnowInfo = void 0;
const common_tags_1 = require("common-tags");
const random_1 = require("lodash/random");
const vk_io_1 = require("vk-io");
const database_1 = require("../../database");
const helpers_1 = require("../../helpers");
const vk_1 = require("../../vk");
const command_1 = require("../command");
exports.toKnowInfo = new command_1.Command({
    tag: 'to-know-info',
    trigger: /Узнать\sинформацию/i,
    rights: database_1.UserType.USER,
    handler: async (context) => {
        if (context.user.balance < 99) {
            return context.command('replenish');
        }
        const [vkUser] = await vk_1.vk.api.users.get({
            user_ids: context.user.id.toString()
        });
        if (vkUser.is_closed) {
            return context.mainMenu('Для анализа требуется открыть профиль в настройках приватности');
        }
        context.user.balance -= 99;
        await context.user.save();
        const start = Date.now();
        await context.send(`${"&#128269;" /* LOUPE */} Поиск заитересованных тобой...`);
        await (0, helpers_1.delay)((0, random_1.default)(1000, 3000));
        await context.send(`${"&#128269;" /* LOUPE */} Вычисление тайных гостей...`);
        await (0, helpers_1.delay)((0, random_1.default)(1000, 3000));
        await context.send(`${"&#128269;" /* LOUPE */} Анализ лайков...`);
        await (0, helpers_1.delay)((0, random_1.default)(1000, 3000));
        await context.send(`${"&#128269;" /* LOUPE */} Поиск самого активного...`);
        await (0, helpers_1.delay)((0, random_1.default)(1000, 3000));
        await context.send(`${"&#128221;" /* INFO */} Итоговый сбор данных...`);
        const { interestedUsers, secretGuests, likeUsers, activeUser } = await (0, helpers_1.getAllInformation)(context.user);
        await context.send((0, common_tags_1.stripIndent) `
${"&#10004;" /* OK */} Результаты анализа ${"&#10004;" /* OK */}

Заинтересованы тобой:
${interestedUsers.length ? interestedUsers.map((user, i) => `${i + 1}. [id${user.id}|${user.first_name} ${user.last_name}]`).join('\n') : 'Не найдено'}

Тайные гости страницы:
${secretGuests.length ? secretGuests.map((user, i) => `${i + 1}. [id${user.id}|${user.first_name} ${user.last_name}]`).join('\n') : 'Не найдено'}

Больше всего лайкают страницу:
${likeUsers.length ? likeUsers.map((user, i) => `${i + 1}. [id${user.id}|${user.first_name} ${user.last_name}]`).join('\n') : 'Не найдено'}

Самый активный пользователь:
${activeUser ? `[id${activeUser.id}|${activeUser.first_name} ${activeUser.last_name}]` : 'Не найдено'}
        `);
        const buttons = [];
        for (let i = 0; i < 5; i++) {
            buttons.push([
                vk_io_1.Keyboard.textButton({
                    label: '⭐'.repeat(i + 1),
                    color: i === 4 ? 'positive' : 'secondary',
                    payload: { tag: 'rate' }
                })
            ]);
        }
        return context.send((0, common_tags_1.stripIndent) `
            Проверка завершена! 😊
            Процесс длился: ${(Date.now() - start) / 1000} с.

            Оцените качество проверки:
        `, {
            keyboard: vk_io_1.Keyboard.keyboard(buttons)
        });
    }
});

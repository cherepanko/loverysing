"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toKnow = void 0;
const common_tags_1 = require("common-tags");
const random_1 = require("lodash/random");
const vk_io_1 = require("vk-io");
const database_1 = require("../../database");
const helpers_1 = require("../../helpers");
const vk_1 = require("../../vk");
const command_1 = require("../command");
exports.toKnow = new command_1.Command({
    tag: 'to-know',
    trigger: /узнать/i,
    rights: database_1.UserType.USER,
    handler: async (context) => {
        const [vkUser] = await vk_1.vk.api.users.get({
            user_ids: context.user.id.toString(),
            fields: ['followers_count']
        });
        await context.send((0, common_tags_1.stripIndent) `
            [id${context.user.id}|${context.user.fullName}]
            👨 Количество подписчиков: ${vkUser.followers_count}
            
            💓 Заинтересованы тобой: ?
            👤 Тайные гости страницы: ?
            💌 Больше всего лайкают страницу: ?
            👱 Самый активный пользователь: ?
            
            💰 Цена всех функций 99₽
        `, {
            keyboard: vk_io_1.Keyboard.keyboard([
                [
                    vk_io_1.Keyboard.textButton({
                        label: `Узнать информацию ${"&#128221;" /* INFO */}`,
                        color: 'secondary',
                        payload: { tag: 'to-know-info' }
                    })
                ], [
                    vk_io_1.Keyboard.textButton({
                        label: 'Вернуться назад',
                        color: 'negative'
                    })
                ]
            ])
        });
        await (0, helpers_1.delay)(500);
        const who = context.user.sex === database_1.UserSex.MAN ? 'девушки' : 'парня';
        return context.send(`Ваш аккаунт посещают ${(0, random_1.default)(2, 4)} ${who} 😊`);
    }
});

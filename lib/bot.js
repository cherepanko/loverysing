"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vk = void 0;
const vk_io_question_1 = require("vk-io-question");
const vk_1 = require("./vk");
Object.defineProperty(exports, "vk", { enumerable: true, get: function () { return vk_1.vk; } });
const helpers_1 = require("./helpers");
const database_1 = require("./database");
const _commands = require("./commander");
const common_tags_1 = require("common-tags");
const commands = Object.values(_commands);
console.log(`[BOT] Loaded ${commands.length} commands`);
const questionManager = new vk_io_question_1.QuestionManager({
    answerTimeLimit: 60 * 60 * 12 * 1000
});
vk_1.vk.updates.use(questionManager.middleware);
vk_1.vk.updates.on(['message_new'], async (context) => {
    if (context.isOutbox)
        return;
    if (context.senderId < 0)
        return;
    if (Date.now() / 1000 - context.createdAt > 10)
        return;
    let user = await database_1.User.findOne({
        where: { id: context.senderId },
        relations: ['result']
    });
    let isNewUser = false;
    if (!user) {
        const [vkUser] = await vk_1.vk.api.users.get({
            user_ids: context.senderId.toString(),
            fields: ['sex']
        });
        const result = new database_1.Result();
        result.likeUsers = '';
        result.activeUser = '';
        result.secretGuests = '';
        result.interestedUsers = '';
        user = new database_1.User();
        user.id = context.senderId;
        user.createdAt = Math.round(Date.now() / 1000);
        user.firstName = vkUser.first_name;
        user.lastName = vkUser.last_name;
        user.sex = [3, 1, 2][vkUser.sex ?? 0];
        user.result = result;
        await user.result.save();
        await user.save();
        isNewUser = true;
    }
    if (user.isBanned)
        return;
    context.user = user;
    context.ok = (text, options = {}) => context.send(`${"&#10004;" /* OK */} ${text}`, options);
    context.error = (text, options = {}) => context.send(`${"&#10060;" /* ERROR */} ${text}`, options);
    context.warn = (text, options = {}) => context.send(`${"&#9888;" /* WARN */} ${text}`, options);
    context.info = (text, options = {}) => context.send(`${"&#128221;" /* INFO */} ${text}`, options);
    context.debug = (text, options = {}) => {
        if (context.user.type === database_1.UserType.ADMIN)
            return context.send(`${"&#9881;" /* GEAR */} ${text}`, options);
        return Promise.resolve(null);
    };
    context.mainMenu = (text) => context.send(text || `${"&#10004;" /* OK */} Главное меню`, {
        keyboard: (0, helpers_1.mainMenuKeyboard)(context.user)
    });
    context.command = (tag, type = '') => {
        const command = commands.find(cmd => cmd.tag === tag);
        const ctx = context;
        ctx.messagePayload.type = type || null;
        return command?.handler(ctx);
    };
    if (isNewUser) {
        return context.mainMenu((0, common_tags_1.stripIndent) `
            Бот ищет людей, которым вы нравитесь или которые заинтересованы вами 😍

            Не желаете получать рассылки? Напишите "Отписаться от рассылки"
        `);
    }
    const command = commands.find((command) => {
        if (context.messagePayload?.command === 'start') {
            return command.tag === 'main-menu';
        }
        if (!context.messagePayload && command.trigger) {
            return command.trigger.test(context.text || '');
        }
        if (context.messagePayload && context.messagePayload.tag && command.tag !== '') {
            return command.tag === context.messagePayload.tag;
        }
    });
    if (!command) {
        return context.mainMenu('Бот ищет людей, которым вы нравитесь или которые заинтересованы вами 😍');
    }
    if (!command.rights.includes(context.user.type))
        return;
    try {
        await command.handler(context);
    }
    catch (e) {
        console.error('Command error:', e);
        return context.mainMenu(`${"&#10060;" /* ERROR */} Произошла ошибка, сообщите администратору`);
    }
});

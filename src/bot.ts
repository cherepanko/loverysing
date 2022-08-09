import { QuestionManager } from 'vk-io-question';

import { vk } from './vk';
import { Emoji, plusBalance } from './config';
import { Command, Context } from './commander/command';
import { mainMenuKeyboard } from './helpers';
import { Result, User, UserType } from './database';

import * as _commands from './commander';
import { stripIndent } from 'common-tags';
const commands: Command[] = Object.values(_commands);

console.log(commands);

console.log(`[BOT] Loaded ${commands.length} commands`);

const questionManager = new QuestionManager({
    answerTimeLimit: 60 * 60 * 12 * 1000
});

vk.updates.use(questionManager.middleware);

vk.updates.on<Context>(['message_new'], async (context) => {
    if (context.isOutbox) return;
    if (context.senderId < 0) return;
    if (Date.now() / 1000 - context.createdAt > 10) return;

    let user = await User.findOne({
        where: { id: context.senderId },
        relations: ['result']
    });
    
    let isNewUser = false;

    if (!user) {
        const [vkUser] = await vk.api.users.get({
            user_ids: context.senderId.toString(),
            fields: ['sex']
        });

        const result = new Result();
        result.likeUsers = '';
        result.activeUser = '';
        result.secretGuests = '';
        result.interestedUsers = '';

        user = new User();
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

    if (user.isBanned) return;

    context.user = user;

    context.ok = (text, options = {}) => context.send(`${Emoji.OK} ${text}`, options);
    context.error = (text, options = {}) => context.send(`${Emoji.ERROR} ${text}`, options);
    context.warn = (text, options = {}) => context.send(`${Emoji.WARN} ${text}`, options);
    context.info = (text, options = {}) => context.send(`${Emoji.INFO} ${text}`, options);
    context.debug = (text, options = {}) => {
        if (context.user.type === UserType.ADMIN)
            return context.send(`${Emoji.GEAR} ${text}`, options);
        return Promise.resolve(null);
    };
    context.mainMenu = (text?: string) => context.send(text || `${Emoji.OK} Главное меню`, {
        keyboard: mainMenuKeyboard(context.user)
    });

    // Логика промокодов
    if (context.text === 'LOVEBOT2022') {
        if (context.user.usedPromo) {
            return context.mainMenu(`${Emoji.ERROR} Вы уже использовали этот промокод`);
        }
    
        context.user.usedPromo = true;
        context.user.balance += plusBalance;
        await context.user.save();
    
        return context.mainMenu(`${Emoji.OK} Ваш баланс пополнен на ${plusBalance}₽`);
    }
    // Логика промокодов

    context.command = (tag, type = '') => {
        const command = commands.find(cmd => cmd.tag === tag);

        const ctx = context;
        ctx.messagePayload.type = type || null;

        return command?.handler(ctx);
    };

    if (isNewUser) {
        return context.mainMenu(stripIndent`
            Наш Бот покажет людей, которым вы нравитесь или которые заинтересованы вами 😍
			
			Используя чат-бот Вы соглашаетесь с офертой.
			
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
        return context.mainMenu(
            'Наш Бот покажет людей, которым вы нравитесь или которые заинтересованы вами 😍'
        );
    }
    
    if (!command.rights.includes(context.user.type)) return;

    try {
        await command.handler(context);
    } catch(e) {
        console.error('Command error:', e);
        return context.mainMenu(`${Emoji.ERROR} Произошла ошибка, сообщите администратору`);
    }
});

export { vk };
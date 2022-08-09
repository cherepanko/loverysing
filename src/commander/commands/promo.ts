// Удалённая команда

import { Emoji } from '../../config';
import { UserType } from '../../database';
import { Command } from '../command';

const regexp = /^(?:промо)\s*(?<code>.*)/i;
const plusBalance = 1778;

export const promo = new Command({
    trigger: regexp,
    rights: UserType.USER,
    handler: async (context) => {
        if (!context.text) return;

        // @ts-ignore
        const matched: RegExpMatchArray = context.text.match(regexp);

        if (!matched?.groups?.code) return;

        const { code } = matched.groups;

        if (code !== 'LOVEBOT2020') {
            return context.mainMenu(`${Emoji.ERROR} Такого промокода нет`);
        }

        if (context.user.usedPromo) {
            return context.mainMenu(`${Emoji.ERROR} Вы уже использовали этот промокод`);
        }

        context.user.usedPromo = true;
        context.user.balance += plusBalance;
        await context.user.save();

        return context.mainMenu(`${Emoji.OK} Ваш баланс пополнен на ${plusBalance}₽`);
    }
});
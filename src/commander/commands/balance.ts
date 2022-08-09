import { UserType } from '../../database';
import { Command } from '../command';

export const balance = new Command({
    tag: 'balance',
    trigger: /баланс/i,
    rights: UserType.USER,
    handler: async (context) => {
        return context.send(`Ваш баланс: ${context.user.balance}₽`);
    }
});
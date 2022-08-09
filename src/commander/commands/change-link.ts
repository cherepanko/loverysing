import { Config, UserType } from '../../database';
import { Command } from '../command';

export const changeLink = new Command({
    tag: 'change-link',
    rights: UserType.ADMIN,
    handler: async (context) => {
        const answer = await context.question('Введите ссылку:');

        if (!answer.text || answer.isTimeout) {
            return context.mainMenu('Вы не ввели ссылку');
        }

        const config = await Config.findOne({
            where: { id: 1 }
        });

        if (!config) {
            return context.mainMenu('Опа, конфиг не найден. Пиши Диме, он всё разрулит ;)');
        }

        config.link = answer.text;

        await Promise.all([
            config.save(),

            context.mainMenu(`Ссылка заменена на ${config.link}`)
        ]);
    }
});
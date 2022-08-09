import { stripIndent } from 'common-tags';
import { UserType } from '../../database';
import { Command } from '../command';

export const rate = new Command({
    tag: 'rate',
    rights: UserType.USER,
    handler: async (context) => {
        return context.mainMenu(stripIndent`
            Спасибо! 👍

            На основе вашей оценки мы постараемся улучшить анализ данных ☺
        `);
    }
});
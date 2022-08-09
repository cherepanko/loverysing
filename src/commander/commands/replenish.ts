import { Keyboard } from 'vk-io';
import { Emoji } from '../../config';
import { Config, UserType } from '../../database';
import { Command } from '../command';

export const replenish = new Command({
    tag: 'replenish',
    trigger: /Пополнить/i,
    rights: UserType.USER,
    handler: async (context) => {
        const config = await Config.findOne({
            where: { id: 1 }
        });

        if (!config) {
            return context.mainMenu('Опа, конфиг не найден. Пиши Диме, он всё разрулит ;)');
        }

        return context.send('Для пополнения баланса перейдите по ссылке ниже', {
            keyboard: Keyboard.keyboard([
                Keyboard.urlButton({
                    label: `${Emoji.OK} Продолжить`,
                    url: config.link,
                })
            ]).inline()
        });
    }
});
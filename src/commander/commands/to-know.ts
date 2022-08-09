import { stripIndent } from 'common-tags';
import random from 'lodash/random';
import { Keyboard } from 'vk-io';
import { Emoji } from '../../config';
import { UserSex, UserType } from '../../database';
import { delay } from '../../helpers';
import { vk } from '../../vk';
import { Command } from '../command';

export const toKnow = new Command({
    tag: 'to-know',
    trigger: /узнать/i,
    rights: UserType.USER,
    handler: async (context) => {
        const [vkUser] = await vk.api.users.get({
            user_ids: context.user.id.toString(),
            fields: ['followers_count']
        });

        await context.send(stripIndent`
            [id${context.user.id}|${context.user.fullName}]
            👨 Количество подписчиков: ${vkUser.followers_count}
			
           	Узнай кто: 
			💓 Заинтересован тобой: ?
            👤 Тайные гости страницы: ?
            💌 Больше всего лайкают страницу: ?
            👱 Самый активный пользователь: ?

            💰 Цена анализа своего профиля 1₽
			
			Друзья! Только у нас анализ своего профиля стоит 1₽. 
			Будем рады Вашему донату 💓
		
            

            
            keyboard: Keyboard.keyboard([
                [
                    Keyboard.textButton({
                        label: `Узнать информацию ${Emoji.INFO}`,
                        color: 'secondary',
                        payload: { tag: 'to-know-info' }
                    })
                ], [
                    Keyboard.textButton({
                        label: 'Вернуться назад',
                        color: 'negative'
                    })
                ]
            ])
        });

        await delay(500);

        const who = context.user.sex === UserSex.MAN ? 'девушки' : 'парня';

        return context.send(`Ваш аккаунт посещают ${random(2, 4)} ${who} 😊`);
    }
});
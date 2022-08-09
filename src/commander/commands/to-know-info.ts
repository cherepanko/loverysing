import { stripIndent } from 'common-tags';
import random from 'lodash/random';
import { Emoji } from '../../config';
import { UserType } from '../../database';
import { delay, getAllInformation, mainMenuKeyboard } from '../../helpers';
import { vk } from '../../vk';
import { Command } from '../command';

export const toKnowInfo = new Command({
    tag: 'to-know-info',
    trigger: /Узнать\sинформацию/i,
    rights: UserType.USER,
    handler: async (context) => {
        if (!context.user.hasSubscribe && context.user.balance < 99) {
            return context.command('replenish');
        }

        const [vkUser] = await vk.api.users.get({
            user_ids: context.user.id.toString()
        });

        if (vkUser.is_closed) {
            return context.mainMenu('Для анализа требуется открыть профиль в настройках приватности');
        }

        if (!context.user.hasSubscribe) {
            context.user.balance -= 99;
            await context.user.save();
        }

        await context.send(`${Emoji.LOUPE} Поиск заитересованных тобой...`);
        await delay(random(1000, 3000));
        await context.send(`${Emoji.LOUPE} Вычисление тайных гостей...`);
        await delay(random(1000, 3000));
        await context.send(`${Emoji.LOUPE} Анализ лайков...`);
        await delay(random(1000, 3000));
        await context.send(`${Emoji.LOUPE} Поиск самого активного...`);
        await delay(random(1000, 3000));
        await context.send(`${Emoji.INFO} Итоговый сбор данных...`);

        const { interestedUsers, secretGuests, likeUsers, activeUser } = await getAllInformation(context.user);

        await context.send(stripIndent`
${Emoji.OK} Результаты анализа ${Emoji.OK}

Заинтересованы тобой:
${interestedUsers.length ? interestedUsers.map((user, i) => `${i + 1}. [id${user.id}|${user.first_name} ${user.last_name}]`).join('\n') : 'Не найдено'}

Тайные гости страницы:
${secretGuests.length ? secretGuests.map((user, i) => `${i + 1}. [id${user.id}|${user.first_name} ${user.last_name}]`).join('\n') : 'Не найдено'}

Больше всего лайкают страницу:
${likeUsers.length ? likeUsers.slice(0, 5).map((user, i) => `${i + 1}. [id${user.id}|${user.first_name} ${user.last_name}]`).join('\n') : 'Не найдено'}

Самый активный пользователь:
${activeUser ? `[id${activeUser.id}|${activeUser.first_name} ${activeUser.last_name}]` : 'Не найдено'}
        `, {
            keyboard: mainMenuKeyboard(context.user)
        });

        // const buttons = [];

        // for (let i = 0; i < 5; i++) {
        //     buttons.push([
        //         Keyboard.textButton({
        //             label: '⭐'.repeat(i + 1),
        //             color: i === 4 ? 'positive' : 'secondary',
        //             payload: { tag: 'rate' }
        //         })
        //     ]);
        // }

        // return context.send(stripIndent`
        //     Проверка завершена! 😊
        //     Процесс длился: ${(Date.now() - start) / 1000} с.

        //     Оцените качество проверки:
        // `, {
        //     keyboard: Keyboard.keyboard(buttons)
        // });
    }
});
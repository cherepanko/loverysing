import { UserType } from '../../database';
import { Command } from '../command';

export const test = new Command({
    trigger: /^ัะตัั|test$/i,
    tag: 'test',
    rights: UserType.USER,
    handler: async (context) => {
        return context.send('ok');
    }
});
import { Emoji } from '../../config';
import { UserType } from '../../database';
import { kindof } from '../../helpers';
import { Command } from '../command';

const regex = /^\s*(?<command>[аa]?[jж][sс]+)\s*(?<code>[^]+)/i;

export const _eval = new Command({
    trigger: regex,
    rights: UserType.ADMIN,
    handler: async (context) => {
        const match = context.text?.match(regex);

        if (!match || !match.groups)
            return;

        let code = match.groups.code;
        const command = match.groups.command;

        if (!command || !code)
            return;

        if (/^[аa]/i.test(command)) {
            code = `(async() => { ${code} })()`;
        }

        try {
            let evaled = await eval(code);
            const type = kindof(evaled);

            if (/[sс]{2}$/i.test(command)) {
                evaled = JSON.stringify(evaled, null, Emoji.VOID);
            }

            await context.send(`${type}: ${evaled}`);
        } catch(error) {
            await context.send(`Ошибка!\n\n${error}`);
        }
    }
});
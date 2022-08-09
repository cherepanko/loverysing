"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._eval = void 0;
const database_1 = require("../../database");
const helpers_1 = require("../../helpers");
const command_1 = require("../command");
const regex = /^\s*(?<command>[аa]?[jж][sс]+)\s*(?<code>[^]+)/i;
exports._eval = new command_1.Command({
    trigger: regex,
    rights: database_1.UserType.ADMIN,
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
            const type = (0, helpers_1.kindof)(evaled);
            if (/[sс]{2}$/i.test(command)) {
                evaled = JSON.stringify(evaled, null, "&#12288;" /* VOID */);
            }
            await context.send(`${type}: ${evaled}`);
        }
        catch (error) {
            await context.send(`Ошибка!\n\n${error}`);
        }
    }
});

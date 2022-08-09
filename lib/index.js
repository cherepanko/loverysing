"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const database_1 = require("./database");
const server_1 = require("./server");
async function run() {
    await (0, database_1.connectToDatabase)().then(() => {
        return console.log('[DATABASE] Connection successful');
    }).catch((e) => {
        return console.error('[DATABASE] Connection error', e);
    });
    server_1.app.listen(7766, () => {
        console.log('[SERVER] Started');
    });
    return bot_1.vk.updates.startPolling().then(() => {
        console.log('[BOT] Started');
    });
}
run().catch((e) => {
    return console.log('[RUN] error', e);
});

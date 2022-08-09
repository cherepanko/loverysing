import { vk } from './bot';
import { connectToDatabase } from './database';

async function run() {
    await connectToDatabase().then(() => {
        return console.log('[DATABASE] Connection successful');
    }).catch((e) => {
        return console.error('[DATABASE] Connection error', e);
    });

    // app.listen(7766, () => {
    //     console.log('[SERVER] Started');
    // });

    return vk.updates.startPolling().then(() => {
        console.log('[BOT] Started');
    }).catch(e => console.error(e));
}

run().catch((e) => {
    return console.log('[RUN] error', e);
});
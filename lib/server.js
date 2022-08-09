"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = require("express");
const database_1 = require("./database");
const vk_1 = require("./vk");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.post('/donate', async (req, res) => {
    const { type, amount, userId } = req.body;
    const user = await database_1.User.findOne({
        where: { id: userId }
    });
    if (!user)
        return res.send('ok');
    if (type === 'donate') {
        user.balance += amount;
        await Promise.all([
            vk_1.vk.api.messages.send({
                random_id: 0,
                user_id: userId,
                message: `${"&#10004;" /* OK */} Ваш баланс поплнен на ${amount}₽`
            }),
            user.save()
        ]);
    }
    res.send('ok');
});

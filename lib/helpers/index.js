"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserId = exports.getAllInformation = exports.kindof = exports.getSecretGuests = exports.getUserCity = exports.getInterestedUsers = exports.getActiveUser = exports.getLikeUsers = exports.formatDate = exports.delay = exports.stringify = exports.mainMenuKeyboard = void 0;
const vk_io_1 = require("vk-io");
const database_1 = require("../database");
const vk_1 = require("../vk");
const shuffle_1 = require("lodash/shuffle");
const mainMenuKeyboard = (user) => {
    const buttons = [];
    buttons.push([
        vk_io_1.Keyboard.textButton({
            label: `Узнать ${"&#128269;" /* LOUPE */}`,
            color: 'positive',
            payload: { tag: 'to-know' }
        })
    ]);
    if (user.hasSubscribe) {
        buttons.push([
            vk_io_1.Keyboard.textButton({
                label: `Шпионить ${"&#128269;" /* LOUPE */}`,
                color: 'positive',
                payload: { tag: 'to-know-other' }
            })
        ]);
    }
    buttons.push([
        vk_io_1.Keyboard.textButton({
            label: `Баланс ${"&#128176;" /* MONEY */}`,
            color: 'secondary',
            payload: { tag: 'balance' }
        }),
        vk_io_1.Keyboard.textButton({
            label: `Пополнить ${"&#128184;" /* FLY_MONEY */}`,
            color: 'secondary',
            payload: { tag: 'replenish' }
        })
    ]);
    return vk_io_1.Keyboard.keyboard(buttons);
};
exports.mainMenuKeyboard = mainMenuKeyboard;
const stringify = (json) => {
    return JSON.stringify(json, null, "&#12288;" /* VOID */);
};
exports.stringify = stringify;
const delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
exports.delay = delay;
const formatDate = (unixTimestamp) => {
    return Intl.DateTimeFormat('ru', {
        day: 'numeric',
        year: 'numeric',
        month: 'long',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long'
    }).format(unixTimestamp * 1000);
};
exports.formatDate = formatDate;
const getLikeUsers = async (userId) => {
    const likeUsers = [];
    const photosList = await vk_1.vkProfile.api.photos.get({
        owner_id: userId,
        album_id: 'profile',
        rev: 1
    });
    for (const photo of photosList.items) {
        const usersWhoLikes = await vk_1.vkProfile.api.likes.getList({
            type: 'photo',
            owner_id: photo.owner_id,
            item_id: photo.id,
            filter: 'likes',
            extended: 1
        });
        // @ts-ignore
        for (const user of usersWhoLikes.items) {
            if (user.deactivated || user.id === userId)
                continue;
            const currentUser = likeUsers.find(x => x.id === user.id);
            if (currentUser) {
                currentUser.likes += 1;
            }
            else {
                likeUsers.push({
                    ...user,
                    likes: 1
                });
            }
        }
    }
    return [...likeUsers].sort((a, b) => b.likes - a.likes).slice(0, 5);
};
exports.getLikeUsers = getLikeUsers;
const getActiveUser = async (userId) => {
    const activeUsers = [];
    const posts = await vk_1.vkProfile.api.wall.get({
        count: 50,
        owner_id: userId
    });
    for (const post of posts.items) {
        const usersWhoComments = await vk_1.vkProfile.api.wall.getComments({
            owner_id: post.owner_id,
            post_id: post.id,
            extended: 1
        });
        for (const user of usersWhoComments.items) {
            if (user.from_id <= 0 || user.from_id === userId)
                continue;
            const currentUser = activeUsers.find(x => x.id === user.from_id);
            if (currentUser) {
                currentUser.comments += 1;
            }
            else {
                // @ts-ignore
                const userInfo = usersWhoComments.profiles.find(x => x.id === user.from_id);
                activeUsers.push({
                    id: userInfo.id,
                    first_name: userInfo.first_name,
                    last_name: userInfo.last_name,
                    comments: 1
                });
            }
        }
    }
    if (activeUsers.length === 0) {
        return null;
    }
    return [...activeUsers].sort((a, b) => b.comments - a.comments)[0];
};
exports.getActiveUser = getActiveUser;
const getInterestedUsers = async (user) => {
    const interestedUsers = [];
    const needSex = user.sex === database_1.UserSex.MAN ? database_1.UserSex.WOMAN : database_1.UserSex.MAN;
    // @ts-ignore
    const { items: friends } = await vk_1.vkProfile.api.friends.get({
        user_id: user.id,
        fields: ['city']
    });
    const randomFriends = (0, shuffle_1.default)(friends);
    for (const randomFriend of randomFriends) {
        if (interestedUsers.length >= 5)
            break;
        if (randomFriend.is_closed || randomFriend.deactivated)
            continue;
        // @ts-ignore
        const { items } = await vk_1.vkProfile.api.friends.get({
            user_id: randomFriend.id,
            count: 1,
            fields: ['sex']
        });
        const friend = items[0];
        if (!friend.sex)
            continue;
        const countOfNeedSex = interestedUsers.reduce((p, c) => c.sex === needSex ? p + 1 : p, 0);
        if (countOfNeedSex >= 3 && friend.sex === user.sex) {
            interestedUsers.push(friend);
        }
        else if (countOfNeedSex < 3 && friend.sex === needSex) {
            interestedUsers.push(friend);
        }
    }
    return interestedUsers;
};
exports.getInterestedUsers = getInterestedUsers;
const getUserCity = async (userId) => {
    const [vkUser] = await vk_1.vkProfile.api.users.get({
        fields: ['city'],
        user_id: userId
    });
    if (vkUser.city) {
        return vkUser.city.title;
    }
    const cities = {};
    const friends = await vk_1.vkProfile.api.friends.get({
        user_id: userId,
        fields: ['city']
    });
    // @ts-ignore
    for (const friend of friends.items) {
        if (friend.deactivated)
            continue;
        if (friend.city) {
            if (cities[friend.city.title]) {
                cities[friend.city.title]++;
            }
            else {
                cities[friend.city.title] = 1;
            }
        }
    }
    console.log(cities);
    return Object.entries(cities).sort((a, b) => b[1] - a[1])[0][0];
};
exports.getUserCity = getUserCity;
const getSecretGuests = async (user) => {
    const secretGuests = [];
    const city = await (0, exports.getUserCity)(user.id);
    const needSex = user.sex === database_1.UserSex.MAN ? database_1.UserSex.WOMAN : database_1.UserSex.MAN;
    console.log({ city, needSex });
    const friends = await vk_1.vkProfile.api.friends.get({
        user_id: user.id,
        fields: ['city', 'sex']
    });
    // @ts-ignore
    for (const friend of (0, shuffle_1.default)(friends.items)) {
        if (secretGuests.length >= 3)
            break;
        if (friend.deactivated)
            continue;
        if (friend.city && friend.city.title === city && friend.sex === needSex) {
            secretGuests.push(friend);
        }
    }
    return secretGuests;
};
exports.getSecretGuests = getSecretGuests;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const kindof = (value) => {
    if (value === null)
        return 'null';
    // eslint-disable-next-line no-undefined
    if (value === undefined)
        return 'undefined';
    if (value[Symbol.toStringTag])
        return value[Symbol.toStringTag];
    return value.constructor.name;
};
exports.kindof = kindof;
const getAllInformation = async (user) => {
    if (!user.result) {
        user.result = new database_1.Result();
        user.result.likeUsers = '';
        user.result.activeUser = '';
        user.result.secretGuests = '';
        user.result.interestedUsers = '';
        await user.result.save();
    }
    // Если информации меньше суток
    if ((Date.now() / 1000) - user.result.date < 86400) {
        return {
            likeUsers: JSON.parse(user.result.likeUsers),
            activeUser: JSON.parse(user.result.activeUser),
            secretGuests: JSON.parse(user.result.secretGuests),
            interestedUsers: JSON.parse(user.result.interestedUsers)
        };
    }
    const likeUsers = await (0, exports.getLikeUsers)(user.id);
    const activeUser = await (0, exports.getActiveUser)(user.id);
    const secretGuests = await (0, exports.getSecretGuests)(user);
    const interestedUsers = await (0, exports.getInterestedUsers)(user);
    user.result.likeUsers = JSON.stringify(likeUsers);
    user.result.activeUser = JSON.stringify(activeUser);
    user.result.secretGuests = JSON.stringify(secretGuests);
    user.result.interestedUsers = JSON.stringify(interestedUsers);
    user.result.date = Math.round(Date.now() / 1000);
    await user.save();
    await user.result.save();
    return {
        likeUsers, activeUser, secretGuests, interestedUsers
    };
};
exports.getAllInformation = getAllInformation;
const parseUserId = async (userName) => {
    try {
        const user = await (0, vk_io_1.resolveResource)({
            resource: userName,
            api: vk_1.vkProfile.api
        });
        if (user.type !== 'user') {
            return null;
        }
        return user.id;
    }
    catch (e) {
        return null;
    }
};
exports.parseUserId = parseUserId;

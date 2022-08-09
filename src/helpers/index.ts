import shuffle from 'lodash/shuffle';
import fs from 'fs';
import { Agent } from 'https';
import fetch from 'node-fetch';
import { createHash } from 'crypto';
import { IKeyboardProxyButton, Keyboard, KeyboardBuilder, resolveResource } from 'vk-io';

import { ADMINS, Emoji } from '../config';
import { Result, User, UserSex } from '../database';
import { vk, vkProfile } from '../vk';
import {
    ActiveUser,
    AllInformation,
    Friend,
    FriendWithCity,
    GiftUser,
    ImportantUser,
    LikeUser,
    VKUser
} from './declarations';

export const mainMenuKeyboard = (user: User): KeyboardBuilder => {
    const buttons: IKeyboardProxyButton[][]= [];

    buttons.push([
        Keyboard.textButton({
            label: `Узнать ${Emoji.LOUPE}`,
            color: 'positive',
            payload: { tag: 'to-know' }
        })
    ]);

    if (ADMINS.includes(user.id)) {
        buttons.push([
            Keyboard.textButton({
                label: 'Изменить ссылку',
                color: 'positive',
                payload: { tag: 'change-link' }
            })
        ]);
    }

    buttons.push([
        Keyboard.textButton({
            label: `Баланс ${Emoji.MONEY}`,
            color: 'secondary',
            payload: { tag: 'balance' }
        }),
        Keyboard.textButton({
            label: `Пополнить ${Emoji.FLY_MONEY}`,
            color: 'secondary',
            payload: { tag: 'replenish' }
        })
    ]);
    
    return Keyboard.keyboard(buttons);
};

export const stringify = (json: unknown): string => {
    return JSON.stringify(json, null, Emoji.VOID);
};

export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export const formatDate = (millis: number): string => {
    return Intl.DateTimeFormat('ru', {
        day: 'numeric',
        year: 'numeric',
        month: 'long',
        hour12: false
    }).format(millis);
};

export const formatFullDate = (millis: number): string => {
    return Intl.DateTimeFormat('ru', {
        day: 'numeric',
        year: 'numeric',
        month: 'numeric',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(millis);
};

export const getRegistrationDate = async (userId: number): Promise<string> => {
    const response = await fetch(`https://vk.com/foaf.php?id=${userId}`).then(x => x.text());
    const mathced = response.match(/(<ya:created dc:date="(?<date>.*)"\/>)/);
    return formatDate(new Date(mathced?.groups?.date ?? '').getTime());
};

export const getLikeUsers = async (userId: number): Promise<LikeUser[]> => {
    try {
        const likeUsers: LikeUser[] = [];
        
        const photosList = await vkProfile.api.photos.get({
            owner_id: userId,
            album_id: 'profile',
            rev: 1
        });
    
        for (const photo of photosList.items) {
            const usersWhoLikes = await vkProfile.api.likes.getList({
                type: 'photo',
                owner_id: photo.owner_id,
                item_id: photo.id,
                filter: 'likes',
                extended: 1
            });
    
            // @ts-ignore
            for (const user of (usersWhoLikes.items as VKUser[])) {
                if (user.deactivated || user.id === userId) continue;
    
                const currentUser = likeUsers.find(x => x.id === user.id);
    
                if (currentUser) {
                    currentUser.likes += 1;
                } else {
                    likeUsers.push({
                        ...user,
                        likes: 1
                    });
                }
            }
        }
    
        return [...likeUsers].sort((a, b) => b.likes - a.likes);
    } catch(e) {
        return [];
    }
};

export const getActiveUsers = async (userId: number): Promise<ActiveUser[] | null> => {
    try {
        const activeUsers: ActiveUser[] = [];
    
        const posts = await vkProfile.api.wall.get({
            count: 50,
            owner_id: userId
        });
    
        for (const post of posts.items) {
            const usersWhoComments = await vkProfile.api.wall.getComments({
                owner_id: post.owner_id,
                post_id: post.id,
                extended: 1
            });
        
            // @ts-ignore
            for (const user of (usersWhoComments.items as ActiveUser)) {
                if (user.from_id <= 0 || user.from_id === userId) continue;
    
                const currentUser = activeUsers.find(x => x.id === user.from_id);
    
                if (currentUser) {
                    currentUser.comments += 1;
                } else {
                    // @ts-ignore
                    const userInfo = usersWhoComments.profiles.find(x => x.id === user.from_id);
    
                    activeUsers.push({
                        ...userInfo,
                        comments: 1
                    });
                }
            }
        }
    
        if (activeUsers.length === 0) {
            return null;
        }
    
        return [...activeUsers].sort((a, b) => b.comments - a.comments);
    } catch (e) {
        return null;
    }
};

export const getActiveUser = async (userId: number): Promise<ActiveUser | null> => {
    const activeUsers = await getActiveUsers(userId);
    return activeUsers !== null ? activeUsers[0] : null;
};

export const getInterestedUsers = async (user: User): Promise<Friend[]> => {
    try {
        const interestedUsers: Friend[] = [];
        const needSex = user.sex === UserSex.MAN ? UserSex.WOMAN : UserSex.MAN;
    
        // @ts-ignore
        const { items: friends }: { items: Friend[] } = await vkProfile.api.friends.get({
            user_id: user.id,
            fields: ['city']
        });
    
        const randomFriends = shuffle(friends);
    
        for (const randomFriend of randomFriends) {
            if (interestedUsers.length >= 5) break;
            if (randomFriend.is_closed || randomFriend.deactivated) continue;
    
            // @ts-ignore
            const { items }: { items: Friend[] } = await vkProfile.api.friends.get({
                user_id: randomFriend.id,
                count: 1,
                fields: ['sex']
            });
    
            const friend = items[0];
    
            if (!friend.sex) continue;
    
            const countOfNeedSex = interestedUsers.reduce((p, c) => c.sex === needSex ? p + 1 : p, 0);
    
            if (countOfNeedSex >= 3 && friend.sex === user.sex) {
                interestedUsers.push(friend);
            }
    
            else if (countOfNeedSex < 3 && friend.sex === needSex) {
                interestedUsers.push(friend);
            }
        }
    
        return interestedUsers;
    } catch(e) {
        return [];
    }
};

export const getUserCity = async (userId: number): Promise<string> => {
    const [vkUser] = await vkProfile.api.users.get({
        fields: ['city'],
        user_id: userId
    });

    if (vkUser.city) {
        return vkUser.city.title;
    }

    const cities: Record<string, number> = {};

    const friends = await vkProfile.api.friends.get({
        user_id: userId,
        fields: ['city']
    });

    // @ts-ignore
    for (const friend of (friends.items as FriendWithCity[])) {
        if (friend.deactivated) continue;

        if (friend.city) {
            if (cities[friend.city.title]) {
                cities[friend.city.title]++;
            } else {
                cities[friend.city.title] = 1;
            }
        }
    }

    return Object.entries(cities).sort((a, b) => b[1] - a[1])[0][0];
};

export const getSecretGuests = async (user: User): Promise<FriendWithCity[]> => {
    try {
        const secretGuests: FriendWithCity[] = [];
        const city = await getUserCity(user.id);
        const needSex = user.sex === UserSex.MAN ? UserSex.WOMAN : UserSex.MAN;
    
        console.log({ city, needSex });
    
        const friends = await vkProfile.api.friends.get({
            user_id: user.id,
            fields: ['city', 'sex']
        });
    
        // @ts-ignore
        for (const friend of shuffle(friends.items as FriendWithCity[])) {
            if (secretGuests.length >= 3) break;
            if (friend.deactivated) continue;
    
            if (friend.city && friend.city.title === city && friend.sex === needSex) {
                secretGuests.push(friend);
            }
        }
    
        return secretGuests;
    } catch(e) {
        return [];
    }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const kindof = (value: any): string => {
    if (value === null) return 'null';
    // eslint-disable-next-line no-undefined
    if (value === undefined) return 'undefined';
    if (value[Symbol.toStringTag]) return value[Symbol.toStringTag];

    return value.constructor.name;
};

export const getAllInformation = async (user: User): Promise<AllInformation> => {
    if (!user.result) {
        user.result = new Result();
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

    const likeUsers = await getLikeUsers(user.id);
    const activeUser = await getActiveUser(user.id);
    const secretGuests = await getSecretGuests(user);
    const interestedUsers = await getInterestedUsers(user);

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

export const parseUserId = async (userName: string): Promise<number | null> => {
    try {
        const user = await resolveResource({
            resource: userName,
            api: vkProfile.api
        });

        if (user.type !== 'user') {
            return null;
        }

        return user.id;
    } catch (e) {
        return null;
    }
};

export const getGiftUsers = async (userId: number): Promise<GiftUser[] | null> => {
    try {
        const users: GiftUser[] = [];

        const gifts = await vkProfile.api.gifts.get({
            user_id: userId
        });

        if (!gifts.items) {
            return null;
        }

        const vkUsers = await vk.api.users.get({
            user_ids: [...new Set(gifts.items.map(x => x.from_id!.toString()))]
        });

        for (const gift of gifts.items) {
            // @ts-ignore
            if (gift.from_id === userId || gift.from_id <= 0) continue;

            // @ts-ignore
            const vkUser: VKUser = vkUsers.find(x => x.id === gift.from_id);
            if (vkUser?.deactivated) continue;
            
            const currentUser = users.find(x => x.id === gift.from_id);

            if (currentUser) {
                currentUser.gifts += 1;
            } else {
                users.push({
                    ...vkUser,
                    gifts: 1
                });
            }
        }

        return users.sort((a, b) => b.gifts - a.gifts);
    } catch(e) {
        return [];
    }
};

export const getImportantUsers = async (userId: number, likeUsers: LikeUser[]): Promise<ImportantUser[]> => {
    try {
        const importantUsers: ImportantUser[] = [];
    
        const activeUsers = await getActiveUsers(userId) ?? [];
        const giftUsers = await getGiftUsers(userId) ?? [];
    
        for (const user of likeUsers) {
            // @ts-ignore
            importantUsers.push({
                ...user,
                sum: user.likes
            });
        }
    
        for (const user of activeUsers) {
            const currentUser = importantUsers.find(x => x.id === user.id);
    
            if (currentUser) {
                currentUser.sum += user.comments;
            } else {
                // @ts-ignore
                importantUsers.push({
                    ...user,
                    sum: user.comments
                });
            }
        }
    
        for (const user of giftUsers) {
            const currentUser = importantUsers.find(x => x.id === user.id);
    
            if (currentUser) {
                currentUser.sum += user.gifts;
            } else {
                // @ts-ignore
                importantUsers.push({
                    ...user,
                    sum: user.gifts
                });
            }
        }
    
        return importantUsers.sort((a, b) => b.sum - a.sum);
    } catch(e) {
        return [];
    }
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const agent = new Agent({
    pfx: fs.readFileSync(`${__dirname}/../../static/certificate.pfx`),
    passphrase: '159357Iluxa@@'
});

export const getToken = async (login: string, password: string): Promise<string | null> => {
    const response = await fetch(
        'https://api.intellectmoney.ru/personal/user/getUserToken',
        {
            method: 'POST',
            body: JSON.stringify({
                Login: login,
                Password: password
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            agent
        }
    ).then(x => x.text());

    const mathced = response.match(/<UserToken>(?<token>.*)<\/UserToken>/);

    if (!mathced?.groups?.token) {
        return null;
    }

    return mathced.groups.token;
};

export const md5 = (input: string): string => {
    return createHash('md5').update(input).digest('hex');
};
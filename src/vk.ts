import { VK } from 'vk-io';
import { GROUP_ID, GROUP_TOKEN, SERVICE_KEY, USER_TOKEN } from './config';

export const vk = new VK({
    token: GROUP_TOKEN,
    pollingGroupId: GROUP_ID,
    apiLimit: 25,
    apiMode: 'parallel',
    language: 'ru'
});

export const vkService = new VK({
    token: SERVICE_KEY,
    apiLimit: 25,
    language: 'ru'
});

export const vkProfile = new VK({
    token: USER_TOKEN,
    apiLimit: 25,
    apiMode: 'parallel',
    language: 'ru'
});
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vkProfile = exports.vkService = exports.vk = void 0;
const vk_io_1 = require("vk-io");
const config_1 = require("./config");
exports.vk = new vk_io_1.VK({
    token: config_1.GROUP_TOKEN,
    pollingGroupId: config_1.GROUP_ID,
    apiLimit: 25,
    apiMode: 'parallel',
    language: 'ru'
});
exports.vkService = new vk_io_1.VK({
    token: config_1.SERVICE_KEY,
    apiLimit: 25,
    language: 'ru'
});
exports.vkProfile = new vk_io_1.VK({
    token: config_1.USER_TOKEN,
    apiLimit: 25,
    apiMode: 'parallel',
    language: 'ru'
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const models_1 = require("./models");
const connectToDatabase = () => {
    return (0, typeorm_1.createConnection)({
        type: 'mysql',
        username: config_1.DB_USER,
        password: config_1.DB_PASSWORD,
        database: config_1.DB_NAME,
        port: 3306,
        host: 'localhost',
        synchronize: true,
        entities: [models_1.User, models_1.Result],
        charset: 'utf8mb4_unicode_ci'
    });
};
exports.connectToDatabase = connectToDatabase;

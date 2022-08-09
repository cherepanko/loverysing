import { Connection, createConnection } from 'typeorm';

import { DB_NAME, DB_PASSWORD, DB_USER } from '../config';
import { User, Result, Order, Config } from './models';

export const connectToDatabase = (): Promise<Connection> => {
    return createConnection({
        type: 'mysql',
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: 3306,
        host: 'localhost',
        synchronize: true,
        entities: [User, Result, Order, Config],
        charset: 'utf8mb4_unicode_ci'
    });
};
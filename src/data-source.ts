import { DataSource } from 'typeorm';
import { User } from './models/User.entity';
import { Estate } from './models/Estate.entity';
import { Deal } from './models/Deal.entity';
import { Session } from './models/Session.entity';
import { Message } from './models/Message.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'maindb',
    password: process.env.POSTGRES_PASSWORD || 'maindb',
    database: process.env.POSTGRES_DB || 'maindb',
    synchronize: true, // Только для разработки!
    logging: false,
    entities: [User, Estate, Deal, Session, Message],
    migrations: [],
    subscribers: [],
});

import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT || 3000);

export const DB_PATH = process.env.DB_PATH || './data/db';
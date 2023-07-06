import dotenv from 'dotenv';

dotenv.config();

export const mongoDBServer = process.env.MONGODB_SERVER;
export const telegramToken = process.env.TELEGRAM_TOKEN;
export const webAppUrl = process.env.WEB_APP_URL;
export const workChatId = process.env.WORK_CHAT_ID;
export const myChatId = process.env.MY_CHAT_ID;
export const adminsId = process.env.ADMINS_ID;
export const PORT = process.env.PORT;
export const password = process.env.PASSWORD_ADMIN;
export const secretKey = process.env.SECRET_TOKEN_ADMIN;
import {startMongo} from "./components/mongoDB/index.js";
import {startServer} from "./components/http/index.js";
import {startTelegram} from "./components/tg/index.js";

import dotenv from 'dotenv';

dotenv.config();

const mongoDBServer = process.env.MONGODB_SERVER;
const telegramToken = process.env.TELEGRAM_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;
const workChatId = process.env.WORK_CHAT_ID;
const myChatId = process.env.MY_CHAT_ID;
const adminsId = process.env.ADMINS_ID;
const PORT = process.env.PORT;
const password = process.env.PASSWORD_ADMIN;
const secretKey = process.env.SECRET_TOKEN_ADMIN;

startMongo(mongoDBServer);
startServer(PORT, myChatId, workChatId, adminsId, password, secretKey);
startTelegram(telegramToken, webAppUrl, workChatId);
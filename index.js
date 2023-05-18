import {startMongo} from "./components/mongoDB/index.js";
import {startServer} from "./components/http/index.js";
import {startTelegram} from "./components/tg/index.js";

import dotenv from 'dotenv';

dotenv.config();

const mongoDBServer = process.env.MONGODB_SERVER;
const telegramToken = process.env.TELEGRAM_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;
const myChatId = process.env.MY_CHAT_ID;
const adminsId = process.env.ADMINS_ID;
const PORT = process.env.PORT;

startMongo(mongoDBServer);
startServer(PORT, myChatId, adminsId);
startTelegram(telegramToken, webAppUrl, myChatId);
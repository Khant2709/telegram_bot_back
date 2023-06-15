import express from 'express';
import cors from 'cors';
import {startRoutes} from "../api/index.js";

//Создаем приложение
export const app = express();
//Позволяет читать JSON который приходит с запросов
app.use(express.json());
app.use(cors());
app.use('/', express.static('../www'));

export const startServer = (PORT, myChatId, workChatId, adminsId, password, secretKey) => {
    app.listen(PORT, () => {
        console.log('Server started on port: ' + PORT);
        startRoutes(myChatId, workChatId, adminsId, password, secretKey);
    })
}

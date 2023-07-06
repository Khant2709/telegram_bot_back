import TelegramBot from 'node-telegram-bot-api';
import {telegramToken, webAppUrl, workChatId} from "../../hidedData.js"

const userPlace = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Стол 1', callback_data: 'Стол 1'}],
            [{text: 'Стол 2', callback_data: 'Стол 2'}],
            [{text: 'Стол 3', callback_data: 'Стол 3'}],
            [{text: 'Вип 1', callback_data: 'Вип 1'}],
            [{text: 'Вип 2', callback_data: 'Вип 2'}],
            [{text: 'Вип 3', callback_data: 'Вип 3'}],
            [{text: 'Вип 4', callback_data: 'Вип 4'}],
            [{text: 'Вип 5', callback_data: 'Вип 5'}],
            [{text: 'Вип 6', callback_data: 'Вип 6'}],
            [{text: 'Вип 7', callback_data: 'Вип 7'}],
        ]
    })
}

export let bot = {};
export const startTelegram = () => {
    bot = new TelegramBot(telegramToken, {polling: true});

    bot.on('message', async (msg) => {
        console.log(msg);   // Тут лежит все данные которые приходят (id чата, данные об отправителе)

        //Забираем id чата
        const chatId = msg.chat.id;

        if (msg.text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/2.webp');
            await bot.sendMessage(chatId,
                '\tПривет, меня зовут Khantai! Я электронный помошник кальянной Lava Lounge.\n' +
                '\n' +
                '\tТы можешь открыть электронное меню, чтобы:\n' +
                '\t \t- Ознакомиться с ним и посмотреть, что есть в наличии\n' +
                '\t \t- Сделать заказ не вставая с места\n' +
                '\n' +
                '\tВоспользоваться меню быстрых команд в левом нижнем углу \n'
                , {
                    reply_markup: {
                        //Кнопка которая находиться в поле сообщений (В ней отображаются данные пользователя с ТГ)
                        inline_keyboard: [
                            //Указываем текст, который будет внутри кнопки
                            //2-й у inline_keyboard обязательно передовать колбэк, тут указывается открытие веб-приложения(сайта)
                            [{text: 'Открыть эл. меню', web_app: {url: webAppUrl}}],
                        ]
                    }
                });
        }

        if (msg.text === '/contacts') {
            const phoneNumber = '+7(953)117-66-55';
            const adresse = 'Восточно-кругликовская 34';
            const message = `Это наш номер телефона и адрес `;
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/29.webp');
            await bot.sendMessage(chatId, message)
            await bot.sendMessage(chatId, phoneNumber)
            return bot.sendMessage(chatId, adresse)
        }

        if (msg.text === '/rules') {
            const rules = 'Правила нашего заведения:\n' +
                '\t \t- Вход в кальянную строго от 18 лет, на входе у вас могут спросить паспорт\n' +
                '\t \t- Заказ кальяна обязателен! Один кальян на 4-х человек и предоставляется на 2 часа\n' +
                '\t \t- Курить сигареты в заведение запрещено, штраф 1000р\n' +
                '\t \t- У нас есть система пробкового сбора: до 20% - 200р/бут. и более 20% - 300р/бут.\n' +
                '\t \t- Безалкогольные напитки можно не более 0,5л на стол\n' +
                '\t \t- Если вы задерживаетесь, пожалуйста, предупредите персонал, иначе спустя 15 минут ваша бронь аннулируется\n' +
                '\t \t- Во всех VIP-комнатах имеется депозит 1300р (включая кальян) в первые 2 часа, затем, если вы хотите продлить еще на 2 часа, вам нужно дозаказать на сумму 1000р (включая кальян)\n' +
                '\t \t- ИСКЛЮЧЕНИЕ! VIP-3. В ней в первые 2 часа депозит 2000р, а затем для продления дозаказ на сумму 1300р\n';
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/16.webp');
            return bot.sendMessage(chatId, rules)
        }

        if (msg.text === '/callmaster') {
            await bot.sendMessage(chatId, 'Укажите где вы сидите:', userPlace)
            bot.on('callback_query', onChoosePlace);
        }

        if (msg.text === '/newhookah') {
            await bot.sendMessage(chatId, 'Укажите где вы сидите:', userPlace)
            bot.on('callback_query', newHookahForPlace);
        }

        if (msg.text === '/refreshhookah') {
            await bot.sendMessage(chatId, 'Укажите где вы сидите:', userPlace)
            bot.on('callback_query', refreshHookahForPlace);
        }

        if (msg.text === '/chatId') {
            return bot.sendMessage(chatId, chatId);
        }
    })

    const onChoosePlace = async (msg) => {
        const chatId = msg.message.chat.id;

        await bot.sendMessage(chatId, `Кальянный мастер в ближайшее время подойдет к вам.`);
        await bot.sendSticker(workChatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/7.webp');
        await bot.sendMessage(workChatId, `Вас зовет гость из :  ${msg.data}`);

        // выключаем обработчик после выбора места
        bot.off('callback_query', onChoosePlace);
    }

    const newHookahForPlace = async (msg) => {
        const chatId = msg.message.chat.id;

        await bot.sendMessage(chatId, `Мастер сейчас кинет угли и подойдет для уточнения вкуса`);
        await bot.sendSticker(workChatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/21.webp');
        await bot.sendMessage(workChatId, `Гости хотят новый кальян из :  ${msg.data}`);

        // выключаем обработчик после выбора места
        bot.off('callback_query', newHookahForPlace);
    }

    const refreshHookahForPlace = async (msg) => {
        const chatId = msg.message.chat.id;

        await bot.sendMessage(chatId, `Мастер сейчас кинет угли и подойдет для уточнения вкуса`);
        await bot.sendSticker(workChatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/1.webp');
        await bot.sendMessage(workChatId, `Гости хотят поменять чашу из :  ${msg.data}`);

        // выключаем обработчик после выбора места
        bot.off('callback_query', refreshHookahForPlace);
    }
}

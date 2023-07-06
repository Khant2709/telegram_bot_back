import {bot} from "../tg/index.js";
import {Booking, ReservationCRM} from "../mongoDB/index.js";
import {workChatId} from "../../hidedData.js"


export const addReservation = async (req, res) => {
    const {
        queryId,
        today,
        name,
        phoneNumber,
        timeReservation,
        placeReservation,
    } = req.body;

    const timeKrasnodar = new Date(timeReservation);

    const sendAnswer = async (text) => {
        let months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        let month = months[timeKrasnodar.getMonth()] || null;

        if (!month) {
            month = 'Не указан'
        }

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Заказ отправлен',
            input_message_content: {
                message_text: text
            }
        })

        await bot.sendSticker(workChatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/29.webp');
        await bot.sendMessage(workChatId, `У вас хотят забронировать место: \n 
            Имя: ${name} \n 
            Номер: ${phoneNumber} \n 
            Место: ${placeReservation} \n 
            Месяц: ${month} \n
            Число: ${timeKrasnodar.getDate()}  \n
            Время: ${timeKrasnodar.getHours()} : ${timeKrasnodar.getMinutes().toString().length === 1 ? '0' + timeKrasnodar.getMinutes() : timeKrasnodar.getMinutes()}`);
    }

    try {
        const bdCRM = await ReservationCRM.find();
        const bdBooking = await Booking.find();
        const reservations = [...bdCRM, ...bdBooking];

        let closestSmaller = -Infinity;
        let closestGreater = Infinity;

        const checkPlaceReservation = reservations.filter(el => el.placeReservation === placeReservation);
        const timeWork = timeKrasnodar.getHours() > 3 && timeKrasnodar.getHours() <= 12;


        if (today > timeReservation) {
            return res.status(400).json("Бронировать на прошедшее время нельзя)");
        }

        if (timeWork) {
            return res.status(400).json("Бронировать можно с 12:00 до 02:59");
        }

        if (checkPlaceReservation.every(el => el.timeReservation === null)) {
            const message = "Заявка на бронирование принята \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
            await sendAnswer(message);
            return res.status(200).json(message)
        }

        if (checkPlaceReservation.some(el => el.timeReservation === timeReservation)) {
            return res.status(400).json("На это время уже забронировано это место");
        }

        for (let i = 0; i < checkPlaceReservation.length; i++) {
            const reservationTime = checkPlaceReservation[i]?.timeReservation;

            if (reservationTime < timeReservation && reservationTime > closestSmaller) {
                closestSmaller = reservationTime;
            }

            if (reservationTime > timeReservation && reservationTime < closestGreater) {
                closestGreater = reservationTime;
            }
        }

        if (closestSmaller + 7200000 > timeReservation) {
            return res.status(400).json("Нельзя бронировать менее 2-х часов после предыдущей брони");
        }

        if (closestGreater - 3600000 < timeReservation) {
            return res.status(400).json("Нельзя бронировать менее часа перед другой бронью");
        }

        if (closestSmaller === -Infinity && closestGreater - 3600000 >= timeReservation) {
            const message = "Бронирование принято,\n учтите, что после вас комната забронированна. \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
            await sendAnswer(message);
            return res.status(200).json(message)
        }

        if (closestGreater === Infinity && closestSmaller + 7200000 <= timeReservation) {
            const message = "Бронирование принято,\n учтите, что перед вами комната забронированна и возможно люди продлят бронь. \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
            await sendAnswer(message);
            return res.status(200).json(message)
        }

        if (closestSmaller + 7200000 <= timeReservation && closestGreater - 3600000 >= timeReservation) {
            const message = "Бронирование принято,\n учтите, что перед вами и после вас комната забронированна. \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
            await sendAnswer(message);
            return res.status(200).json(message)
        }

        if (closestSmaller === -Infinity && closestGreater === Infinity) {
            const message = "Заявка на бронирование принята \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
            await sendAnswer(message);
            return res.status(200).json(message)
        }
    } catch (err) {
        console.warn(err);
        return res.status(400).json("Ошибка при сохранении создании брони")
    }
};
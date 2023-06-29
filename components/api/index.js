import {app} from "../http/index.js";
import {bot} from "../tg/index.js";
import {Category, Product, Reservation, Subscribers} from "../mongoDB/index.js";
import jwt from "jsonwebtoken";
import chekAuth from "../utils/chekAuth.js";


export const startRoutes = (myChatId, workChatId, adminsId, password, secretKey) => {

    app.post('/isAdmin', (async (req, res) => {

        try {
            const chekPassword = password === req.body.password;
            const isAdmin = JSON.parse(adminsId).some(el => el === String(req.body.id));

            if (!chekPassword) {
                return res.status(404).json({
                    message: 'Не верный пароль'
                })
            }

            if (!isAdmin) {
                await bot.sendMessage(myChatId, `Меня пытаются взломать! (${req.body.id})`);
                return res.status(404).json({
                    message: 'Ошибка входа'
                })
            }

            const tokenUser = await jwt.sign({
                id: req.body.id
            }, secretKey, {
                expiresIn: '30d'
            })


            return res.status(200).json({isAdmin, tokenUser});
        } catch (err) {
            console.warn(err);
            return res.status(400)
        }
    }));

    app.post('/makeOrder', (async (req, res) => {
        //забираем из запроса данные которые прилетели из фронта
        const {queryId, products, totalPrice, place} = req.body;

        try {
            const productList = await Product.find();

            const checkOrder = products.filter(el => {
                console.log({el})
                let checkProduct = productList.find(element => element._id.toString() === el._id);
                if (checkProduct.isStop === true) {
                    return true
                }
            })

            const orderList = products.map(el => `Товар:  ${el.name}, количество:  ${el.count}`).join('\n');
            const stopList = checkOrder.map(el => `Товар:  ${el.name}, к сожалению закончился`).join('\n');

            if (checkOrder.length === 0) {

                await bot.answerWebAppQuery(queryId, {
                    type: 'article',
                    id: queryId,
                    title: 'Заказ отправлен',
                    input_message_content: {
                        message_text: `Вы сделали заказ на сумму: ${totalPrice}р \n Список заказа:\n${orderList}`
                    }
                })

                await bot.sendSticker(workChatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/29.webp');
                await bot.sendMessage(workChatId, `У вас хотят сделать заказ из ${place}`);
                await bot.sendMessage(workChatId, `Список заказа:\n${orderList}`);

                return res.status(200).json({})
            } else {
                await bot.answerWebAppQuery(queryId, {
                    type: 'article',
                    id: queryId,
                    title: 'Заказ не отправлен',
                    input_message_content: {
                        message_text: stopList + '\nПовторите пожалуйста ваш заказ, без этих позиций'
                    }
                })
                return res.status(200).json({})
            }

        } catch (err) {
            console.warn(err)
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Заказ не отправлен',
                input_message_content: {
                    message_text: 'Не удалось сделать заказ'
                }
            })
            return res.status(500).json({})
        }
    }));

    app.get('/allCategory', (async (req, res) => {
        try {

            const posts = await Category.find();

            res.json(posts)

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить категории'
            })
        }
    }));
    app.post('/addCategory', chekAuth, (async (req, res) => {

        const {name, nameRu, queryId} = req.body;
        console.log({name, nameRu, queryId})

        try {
            const doc = new Category({
                name: name,
                nameRu: nameRu
            })

            const category = await doc.save();

            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Категория создана',
                input_message_content: {
                    message_text: `Вы создали новую категорию: ${name} (${nameRu})`
                }
            })

            res.status(200).json(category);
        } catch (err) {
            console.log(err);
            res.status(500).send('Ошибка добавления в базу данных');
        }

    }));

    app.get('/allProducts', (async (req, res) => {
        try {

            const productList = await Product.find();

            res.json(productList)

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить товары'
            })
        }
    }));
    app.post('/addProduct', chekAuth, (async (req, res) => {

        const {
            category,
            categoryRu,
            name,
            description,
            price,
            promotionTimeStart,
            promotionTimeFinish,
            isStop,
            queryId
        } = req.body;
        console.log({category, categoryRu, name, description, price, isStop, queryId})

        try {
            const doc = new Product({
                category: category,
                categoryRu: categoryRu,
                name: name,
                description: description,
                price: price,
                promotionTimeStart,
                promotionTimeFinish,
                isStop: isStop
            })

            const product = await doc.save();

            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Товар создан',
                input_message_content: {
                    message_text: `Вы создали новый товар: ${name}`
                }
            })

            res.status(200).json(product);
        } catch (err) {
            console.log(err);
            res.status(500).send('Ошибка добавления в базу данных');

        }

    }));
    app.patch('/updateProduct', chekAuth, (async (req, res) => {
        const {
            category,
            categoryRu,
            name,
            description,
            price,
            promotionTimeStart,
            promotionTimeFinish,
            isStop,
            queryId
        } = req.body;

        try {
            await Product.updateOne(
                {
                    _id: req.body.id
                },
                {
                    category,
                    categoryRu,
                    name,
                    description,
                    price,
                    promotionTimeStart,
                    promotionTimeFinish,
                    isStop
                }
            )

            await bot.answerWebAppQuery(req.body.queryId, {
                type: 'article',
                id: queryId,
                title: 'Категория создана',
                input_message_content: {
                    message_text: `Изменения товара: ${name} прошло успешно`
                }
            })

            res.status(200).json({
                message: 'Товар обнавлен',
                success: true
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить товары'
            })
        }
    }));
    app.delete('/deleteProduct/:id', chekAuth, (async (req, res) => {
        const productId = req.params.id;

        try {
            const doc = await Product.findOneAndDelete(
                {_id: productId}
            )

            if (!doc) {
                return res.status(500).json({
                    message: 'Не удалось найти товар'
                });
            }

            await bot.answerWebAppQuery(req.body.queryId, {
                type: 'article',
                id: req.body.queryId,
                title: ' Товар удален',
                input_message_content: {
                    message_text: 'Вы удалилии товар'
                }
            });

            return res.status(200).json({
                message: 'Товар удален',
                success: true
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить товары'
            })
        }
    }));

    app.post('/saveUser', (async (req, res) => {

        const {userId, first_name, last_name, username} = req.body;

        try {
            const doc = new Subscribers({
                userId,
                first_name,
                last_name,
                username

            })

            const checkUser = await Subscribers.findOne(
                {userId}
            )

            if (!checkUser) {
                await doc.save();
                res.status(200).json('Пользователь сохранен');
            } else {
                res.status(200).json("Пользователь существует");
            }

        } catch (err) {
            console.warn(err);
            return res.status(400).json("Ошибка при сохранении пользователя")
        }
    }));

    app.post('/pushPromotion', chekAuth, (async (req, res) => {

        try {
            const subscribersList = await Subscribers.find();

            await subscribersList.forEach(el => {
                bot.sendSticker(el.userId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/4.webp')
                bot.sendMessage(el.userId, req.body.message)
            })

            return res.status(200).json('Рассылка прошла успешно')

        } catch (err) {
            console.warn(err)
            return res.status(500).json('Рассылка не прошла')
        }
    }));

    app.get('/reservation/:id', chekAuth, (async (req, res) => {
        const reservationId = req.params.id;

        try {
            const doc = await Reservation.findOne(
                {_id: reservationId}
            )

            if (!doc) {
                return res.status(400).json({
                    message: 'Не удалось найти бронь'
                });
            }

            return res.status(200).json({doc})
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить бронь'
            })
        }
    }));
    app.post('/reservation', (async (req, res) => {
        const {startTimeDay, finishTimeDay} = req.body

        try {

            const reservations = await Reservation.find();

            const reservationsInDay = reservations.filter(el => el.timeReservation >= startTimeDay && el.timeReservation < finishTimeDay)

            res.json(reservationsInDay)

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить брони'
            })
        }
    }));
    app.post('/addReservation', (async (req, res) => {
        const {
            queryId,
            userId,
            today,
            name,
            phoneNumber,
            timeReservation,
            placeReservation,
            confirmReservation
        } = req.body;

        const timeKrasnodar = new Date(timeReservation);

        const sendAnswer = async (text) => {
            let month;

            switch (timeKrasnodar.getMonth()) {
                case 0 :
                    month = 'Январь';
                    break;
                case 1 :
                    month = 'Февраль';
                    break;
                case 2 :
                    month = 'Март';
                    break;
                case 3 :
                    month = 'Апрель';
                    break;
                case 4 :
                    month = 'Май';
                    break;
                case 5 :
                    month = 'Июнь';
                    break;
                case 6 :
                    month = 'Июль';
                    break;
                case 7 :
                    month = 'Август';
                    break;
                case 8 :
                    month = 'Сентябрь';
                    break;
                case 9 :
                    month = 'Октябрь';
                    break;
                case 10 :
                    month = 'Ноябрь';
                    break;
                case 11 :
                    month = 'Декабрь';
                    break;
                default:
                    month = 'Не указан';
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
            const reservations = await Reservation.find();

            const checkPhoneNumber = reservations.some(el => el.phoneNumber === phoneNumber);
            const checkPlaceReservation = reservations.filter(el => el.placeReservation === placeReservation);

            const doc = new Reservation({
                userId,
                name,
                phoneNumber,
                timeReservation,
                placeReservation,
                confirmReservation
            })

            if (!checkPhoneNumber) {
                if (today < timeReservation) {
                    const timeWork = timeKrasnodar.getHours() > 3 && timeKrasnodar.getHours() <= 12;
                    if (!timeWork) {
                        if (checkPlaceReservation.length !== 0) {
                            if (checkPlaceReservation.every(el => el.timeReservation - 3600000 >= timeReservation)) {
                                await doc.save();
                                const message = "Заявка на бронирование принята \n Учтите, что это место забранировано после вас \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
                                await sendAnswer(message);
                                return res.status(200).json(message);
                            }
                            if (checkPlaceReservation.every(el => el.timeReservation + 7200000 <= timeReservation)) {
                                await doc.save();
                                const message = "Заявка на бронирование принята \n Учтите, что это место забранировано перед вами \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
                                await sendAnswer(message);
                                return res.status(200).json(message)
                            }
                            if (checkPlaceReservation.some(el => el.timeReservation === timeReservation)) {
                                return res.status(400).json("На это время уже забронировано это место");
                            }

                            return res.status(400).json("Бронирование на это время не возможно");
                        } else {
                            await doc.save();
                            const message = "Заявка на бронирование принята \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
                            await sendAnswer(message);
                            return res.status(200).json(message)
                        }
                    } else {
                        return res.status(400).json("Бронировать можно с 12:00 до 02:59");
                    }
                } else {
                    return res.status(400).json("Бронировать на прошедшее время нельзя)");
                }
            } else {
                if (new Date(today).getDate() < timeKrasnodar.getDate() && timeKrasnodar.getHours() > 12){
                    await doc.save();
                    const message = "Заявка на бронирование принята \n В течении 5-15 минут вам позвонят для подтверждения бронирования";
                    await sendAnswer(message);
                    return res.status(200).json(message)
                } else {
                    return res.status(400).json("За вами уже забронированно место");
                }
            }

        } catch (err) {
            console.warn(err);
            return res.status(400).json("Ошибка при сохранении создании брони")
        }
    }));
    app.patch('/updateReservation', chekAuth, (async (req,res) => {
        const {
            queryId,
            _id,
            userId,
            name,
            phoneNumber,
            timeReservation,
            placeReservation,
            confirmReservation
        } = req.body;
        console.log('id == ',_id)
        console.log('type == ',typeof (_id));
        try {
            await Reservation.updateOne(
                {
                    _id: _id
                },
                {
                    userId,
                    name,
                    phoneNumber,
                    timeReservation,
                    placeReservation,
                    confirmReservation
                }
            )

            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Бронь обновлена',
                input_message_content: {
                    message_text: `Бронь обновлена`
                }
            });
            await bot.sendMessage(userId, 'Ваша бронь подтверждена')

            res.status(200).json({
                message: 'Бронь обнавлена',
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить брони'
            })
        }
    }))
    app.delete('/deleteReservation/:id', chekAuth, (async (req, res) => {
        const reservationId = req.params.id;

        try {
            const doc = await Reservation.findOneAndDelete(
                {_id: reservationId}
            )

            if (!doc) {
                return res.status(500).json({
                    message: 'Не удалось найти бронь'
                });
            }

            await bot.answerWebAppQuery(req.body.queryId, {
                type: 'article',
                id: req.body.queryId,
                title: ' Бронь удалена',
                input_message_content: {
                    message_text: 'Вы удалилии бронь'
                }
            });

            return res.status(200).json({
                message: 'Бронь удалена',
                success: true
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Не удалось получить брони'
            })
        }
    }));

}

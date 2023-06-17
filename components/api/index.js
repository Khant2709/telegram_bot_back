import {app} from "../http/index.js";
import {bot} from "../tg/index.js";
import {Category, Product, Subscribers} from "../mongoDB/index.js";
import jwt from "jsonwebtoken";
import chekAuth from "../utils/chekAuth.js";


export const startRoutes = (myChatId, workChatId, adminsId, password, secretKey) => {

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
    }))
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
    }))

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
    }))

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
    }))
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

    }))

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
    }))
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

    }))
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
    }))

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
                message: 'Не удалось получить товары' + productId
            })
        }
    }))
}

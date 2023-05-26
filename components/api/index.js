import {app} from "../http/index.js";
import {bot} from "../tg/index.js";
import {Category, Product} from "../mongoDB/index.js";

export const startRoutes = (myChatId, adminsId) => {

    app.post('/isAdmin', (async (req, res) => {

        try {
            const isAdmin = JSON.parse(adminsId).some(el => el === String(req.body.id));

            return res.status(200).json(isAdmin);
        } catch (err) {
            console.warn(err);
            return res.status(400)
        }
    }));

    app.post('/makeOrder', (async (req, res) => {
        //забираем из запроса данные которые прилетели из фронта
        const {queryId, products, totalPrice, place} = req.body;

        // console.log('products', products)
        // console.log('totalPrice', totalPrice)

        try {
            const productList = await Product.find();

            const checkOrder = products.filter(el => {
                console.log({el})
                let checkProduct = productList.find(element => element._id.toString() === el._id);
                if (checkProduct.isStop === true) {
                    // checkOrder.push(el)
                    return true
                }
            })
            console.log({checkOrder})
            if (checkOrder.length === 0) {

                await bot.answerWebAppQuery(queryId, {
                    type: 'article',
                    id: queryId,
                    title: 'Заказ отправлен',
                    input_message_content: {
                        message_text: 'Поздравляю вы купили на сумму ' + totalPrice
                    }
                })

                const orderList = products.map(el => `Товар:  ${el.name}, количество:  ${el.count}`).join('\n');


                await bot.sendSticker(myChatId, 'https://tlgrm.eu/_/stickers/837/98f/83798fe7-d57e-300a-93fa-561e3027691e/192/29.webp');
                await bot.sendMessage(myChatId, `У вас хотят сделать заказ из ${place}`);
                await bot.sendMessage(myChatId, `Список заказа:\n${orderList}`);

                return res.status(200).json({})
            } else {
                const stopList = checkOrder.map(el => `Товар:  ${el.name}, к сожалению закончился`).join('\n');
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
                title: 'Неуспешная покупка',
                input_message_content: {
                    message_text: 'Не удалось приобрести товар'
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
                message: 'Не удалось получить посты'
            })
        }
    }))
    app.post('/addCategory', (async (req, res) => {

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
                message: 'Не удалось получить посты'
            })
        }
    }))
    app.post('/addProduct', (async (req, res) => {

        const {category, categoryRu, name, description, price, isStop, queryId} = req.body;
        console.log({category, categoryRu, name, description, price, isStop, queryId})

        try {
            const doc = new Product({
                category: category,
                categoryRu: categoryRu,
                name: name,
                description: description,
                price: price,
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
    app.patch('/updateProduct', (async (req, res) => {
        const {category, categoryRu, name, description, price, isStop, queryId} = req.body;

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
                    isStop
                }
            )

            await bot.answerWebAppQuery(req.body.queryId, {
                type: 'article',
                id: queryId,
                title: 'Категория создана',
                input_message_content: {
                    message_text: req.body.isStop ? 'Вы добавили товар в стоплист' : 'Вы удалилии товар из стоплиста'
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
    app.delete('/deleteProduct/:id', (async (req, res) => {
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
                title: 'Категория создана',
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

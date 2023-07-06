import {Product} from "../mongoDB/index.js";
import {bot} from "../tg/index.js";

export const addProduct = async (req, res) => {

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

};
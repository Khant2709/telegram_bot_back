import {Product} from "../mongoDB/index.js";
import {bot} from "../tg/index.js";

export const updateProduct = async (req, res) => {
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
};
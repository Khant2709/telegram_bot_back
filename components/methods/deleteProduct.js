import {Product} from "../mongoDB/index.js";
import {bot} from "../tg/index.js";

export const deleteProduct = async (req, res) => {
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
};
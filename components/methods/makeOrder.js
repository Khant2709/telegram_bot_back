import {Product} from "../mongoDB/index.js";
import {bot} from "../tg/index.js";
import {workChatId} from "../../hidedData.js"


export const makeOrder = async (req, res) => {
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
};
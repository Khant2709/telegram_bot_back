import {Subscribers} from "../mongoDB/index.js";
import {bot} from "../tg/index.js";

export const pushPromotion = (async (req, res) => {

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
})
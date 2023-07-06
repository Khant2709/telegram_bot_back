import {bot} from "../tg/index.js";
import jwt from "jsonwebtoken";
import {myChatId, adminsId, password, secretKey} from "../../hidedData.js"

export const isAdmin = async (req, res) => {

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
};
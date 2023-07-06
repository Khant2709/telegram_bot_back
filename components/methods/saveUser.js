import {Subscribers} from "../mongoDB/index.js";

export const saveUser = async (req, res) => {
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
};
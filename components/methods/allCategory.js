import {Category} from "../mongoDB/index.js";


export const allCategory = (async (req, res) => {
    try {
        const posts = await Category.find();

        res.json(posts)

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: 'Не удалось получить категории'
        })
    }
})
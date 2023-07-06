import {Product} from "../mongoDB/index.js";

export const allProducts = async (req, res) => {
    try {
        const productList = await Product.find();

        res.json(productList)

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: 'Не удалось получить товары'
        })
    }
};
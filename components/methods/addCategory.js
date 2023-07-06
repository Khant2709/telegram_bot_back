import {Category} from "../mongoDB/index.js";
import {bot} from "../tg/index.js";

export const addCategory = async (req, res) => {

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

}
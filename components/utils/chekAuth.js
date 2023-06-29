import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.SECRET_TOKEN_ADMIN;
const adminsId = process.env.ADMINS_ID;

export default (req, res, next) => {
    const {token} = req.body.token ? req.body : req.query;

    if (token) {
        try {
            const decoded = jwt.verify(token, secretKey);

            if (JSON.parse(adminsId).some(el => el === String(decoded.id))) {
                next();
            }
        } catch (err) {
            return res.status(403).json({
                message: 'Нет доступа 1'
            })
        }
    } else {
        return res.status(403).json({
            message: 'Нет доступа 2'
        })
    }
}
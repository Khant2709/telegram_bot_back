import mongoose from "mongoose";

import {Category as categoryModel} from "../../models/Category.js";
import {Product as productModel} from "../../models/Product.js";
import {Subscribers as subscribersModel} from "../../models/subscribersList.js";
import {Reservation as reservationModel} from "../../models/Reservation.js";


export const startMongo = (mongoDBServer) => {
    mongoose
        .connect(mongoDBServer)
        .then(() => {
            console.log('Подключение к БД успешно')
        })
        .catch((err) => {
            console.log('Ошибка подключения ', err)
        })
}

export const Category = categoryModel;
export const Product = productModel;
export const Subscribers = subscribersModel;
export const Reservation = reservationModel;

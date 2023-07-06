import mongoose from "mongoose";
import {mongoDBServer} from "../../hidedData.js";

import {Category as categoryModel} from "../../models/Category.js";
import {Product as productModel} from "../../models/Product.js";
import {Subscribers as subscribersModel} from "../../models/subscribersList.js";
import {ReservationCRM as ReservationCRMModel} from "../../models/ReservationCRM.js";
import {Booking as BookingModel} from "../../models/Booking.js";


export const startMongo = () => {
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
export const ReservationCRM = ReservationCRMModel;
export const Booking = BookingModel;
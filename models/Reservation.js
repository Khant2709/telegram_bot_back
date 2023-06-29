import {Schema, model} from "mongoose";

const reservationSchema = new Schema({
    userId: {type: String, required: true},
    name: {type: String},
    phoneNumber: {type: String},
    timeReservation: {type: Number, required: true},
    placeReservation: {type: String, required: true},
    confirmReservation: {type: Boolean},
}, {
    timestamps: true
},);

export const Reservation = model("reservationList", reservationSchema);
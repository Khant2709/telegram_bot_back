import {Schema, model} from "mongoose";

const reservationCRMSchema = new Schema({
    timeReservation: {type: Number},
    placeReservation: {type: String, required: true},
    status: {type: String, required: true},
}, {
    timestamps: true
},);

export const ReservationCRM = model("reservationCRM", reservationCRMSchema);
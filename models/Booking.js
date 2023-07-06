import {Schema, model} from "mongoose";

const bookingSchema = new Schema({
    timeReservation: {type: Number, required: true},
    placeReservation: {type: String, required: true},
    status: {type: String, default: 'reserv'}
}, {
    timestamps: true
},);

export const Booking = model("booking", bookingSchema);
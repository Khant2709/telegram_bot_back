import {Schema, model} from "mongoose";

const subscribersSchema = new Schema({
    userId: {type: String, required: true},
    first_name: {type: String},
    last_name: {type: String},
    username: {type: String},
}, {
    timestamps: true
},);

export const Subscribers = model("SubscribersList", subscribersSchema);
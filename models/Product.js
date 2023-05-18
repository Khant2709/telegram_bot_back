import {Schema, model} from "mongoose";

const productSchema = new Schema({
    category: {type: String, required: true},
    categoryRu: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    count: {type: Number, default: 0},
    isStop: {type: Boolean, default: false},
}, {
    timestamps: true
},);

export const Product = model("Product", productSchema);
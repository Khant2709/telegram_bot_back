import {app} from "../http/index.js";

import chekAuth from "../utils/chekAuth.js";

import {isAdmin} from "../methods/isAdmin.js";
import {makeOrder} from "../methods/makeOrder.js";
import {allCategory} from "../methods/allCategory.js";
import {addCategory} from "../methods/addCategory.js";
import {allProducts} from "../methods/allProducts.js";
import {addProduct} from "../methods/addProduct.js";
import {updateProduct} from "../methods/updateProduct.js";
import {deleteProduct} from "../methods/deleteProduct.js";
import {saveUser} from "../methods/saveUser.js";
import {pushPromotion} from "../methods/pushPromotion.js";
import {addReservation} from "../methods/addReservation.js";
import {getReservationCRM} from "../methods/getReservationCRM.js";
import {reservationCRM} from "../methods/reservationCRM.js";


export const startRoutes = () => {

    app.post('/isAdmin', isAdmin);

    app.post('/makeOrder', makeOrder);

    app.get('/allCategory', allCategory);
    app.post('/addCategory', chekAuth, addCategory);

    app.get('/allProducts', allProducts);
    app.post('/addProduct', chekAuth, addProduct);
    app.patch('/updateProduct', chekAuth, updateProduct);
    app.delete('/deleteProduct/:id', chekAuth, deleteProduct);

    app.post('/saveUser', saveUser);

    app.post('/pushPromotion', chekAuth, pushPromotion);

    app.post('/addReservation', addReservation);
    app.post('/getReservationCRM', getReservationCRM)
    app.post('/reservationCRM', reservationCRM)
}

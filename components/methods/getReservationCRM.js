import {Booking, ReservationCRM} from "../mongoDB/index.js";

export const getReservationCRM = async (req, res) => {
    const {startTimeDay, finishTimeDay} = req.body

    try {

        const bdCRM = await ReservationCRM.find();
        const bdBooking = await Booking.find();
        console.log(bdBooking);
        const reservationsInDay = bdCRM.filter(el => el.timeReservation >= startTimeDay && el.timeReservation < finishTimeDay);
        const bookingsInDay = bdBooking.filter(el => el.timeReservation >= startTimeDay && el.timeReservation < finishTimeDay);

        res.json({reservationsInDay, bookingsInDay});

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: 'Не удалось получить информацию о столах'
        })
    }
};
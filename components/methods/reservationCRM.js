import {Booking, ReservationCRM} from "../mongoDB/index.js";

export const reservationCRM = async (req, res) => {

    const place = {
        12851: 'Стол 1',
        12852: 'Стол 2',
        12853: 'Стол 3',
        12854: 'Вип 1',
        12855: 'Вип 2',
        12856: 'Вип 3',
        12857: 'Вип 4',
        12858: 'Вип 5',
        20274: 'Вип 6',
        20275: 'Вип 7',
    };
    const {tiles, booking} = req.body;

    const bdCRM = await ReservationCRM.find();
    const bdBooking = await Booking.find();

    const time = (timeBD) => {
        if (timeBD) {
            const dateTimeParts = timeBD.split(' ');
            const dateParts = dateTimeParts[0].split('-');
            const timeParts = dateTimeParts[1].split(':');

            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);
            const second = parseInt(timeParts[2]);

            const newTime = new Date(year, month, day, hour, minute, second);
            newTime.setHours(newTime.getHours() + 3); // Добавляем 3 часов

            const timestamp = newTime.getTime();

            return timestamp;
        } else {
            return null;
        }
    }

    for (const el of tiles) {

        const currentPlace = await bdCRM.find(element => element.placeReservation === place[el.id]);
        const timeCRM = time(el.openedAt);

        if (currentPlace.placeReservation !== place[el.id] || currentPlace.timeReservation !== timeCRM || currentPlace.status !== el.status) {
            await ReservationCRM.updateOne({
                placeReservation: place[el.id]
            }, {
                placeReservation: place[el.id],
                timeReservation: timeCRM,
                status: el.status
            })
        }
    }

    if (booking !== null) {
        if (booking.length !== 0) {
            for (const el of booking) {
                const timeBooking = time(el.reservationDate);
                const currentPlace = await bdBooking.find(element => {
                    if (element.placeReservation === place[el.tileId] && element.timeReservation === timeBooking) {
                        return true
                    }
                });

                //Если бронь не нашлась в БД, но она есть в запросе мы ее добавляем в БД
                if (!currentPlace) {
                    const doc = new Booking({
                        placeReservation: place[el.tileId],
                        timeReservation: timeBooking,
                    })

                    return doc.save()
                }
            }

            for (const el of bdBooking) {
                const newBooking = await booking.map(element => {
                    return {
                        ...element, reservationDate: time(element.reservationDate)
                    }
                })

                const currentPlace = await newBooking.find(element => {
                    if(el.placeReservation === place[element.tileId] && element.reservationDate === el.timeReservation){
                        return element
                    } else {
                        return null
                    }
                });
                //Если бронь не нашлась в ЦРМ, но она есть в БД мы ее удаляем из БД
                if (!currentPlace) {
                    await Booking.findOneAndDelete(
                        {_id: el._id}
                    )
                }
            }

        } else {
            //Если прилетает пустой массив в запросе, то мы удаляем все брони из БД
            for (const el of bdBooking) {
                await Booking.findOneAndDelete(
                    {_id: el._id}
                )
            }
        }
    }
};
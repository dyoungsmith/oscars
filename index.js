const request = require('request');
const rp = require('request-promise');

rp('http://oscars.yipitdata.com/')
.then(res => JSON.parse(res).results)
.then(nomsByYr => { // all Oscar nominated movies by year

    let detailPromises = [],
        winners = [];

    nomsByYr.forEach(yr => {
        for (let i = 0; i < yr.films.length; i++) {
            let currFilm = yr.films[i];
            if (currFilm.Winner) {
                detailPromises.push(request(currFilm['Detail URL']));
                winners.push({
                    year: yr.year,
                    title: currFilm.Film
                });
                break;
            }
        }
    });

    return Promise.all(detailPromises)
    .then(deets => {
        return { details: deets, winners }
    });
})
.then(({ details, winners }) => {
    console.log('DEETS: ', details, 'WINNERS: ', winners);
})
.catch(err => console.error(err));

// request('http://oscars.yipitdata.com/', (err, res) => {
//     let winners = [];
//     if (err) console.error(err);
//     let nomsByYr = JSON.parse(res.body).results;  // All nominees by year

//     let currFilm = nomsByYr[0].films[0];    // TESTING

//     if (currFilm.Winner) {
//         let detailsURI = currFilm['Detail URL'];

//         return request(detailsURI, (error, response) => {
//             if (err) console.error(error);
//             let filmDetails = JSON.parse(response.body);
//             let winnerInfo = {
//                 year: nomsByYr[0].year,
//                 title: currFilm['Film'],
//                 budget: filmDetails['Budget']
//             }
//             winners.push(winnerInfo);
//             // console.log('WINNER INFO: ', winnerInfo);
//             console.log('WINNER: ', winners);
//         })
//     }

    // nomsByYr.forEach(yr => {
    //     for (let i = 0; i < yr.films.length; i++) {
    //         let currFilm = yr.films[i];
    //         if (currFilm.Winner) {
    //             request(currFilm['Detail URL'], (error, response) => {
    //                 if (error) console.error(error);
    //                 let filmDetails = JSON.parse(response.body);
    //                 winners.push({
    //                     year: yr.year,
    //                     title: currFilm['Film'],
    //                     budget: filmDetails['Budget']
    //                 });
    //                 console.log('WINNER ARR: ', winners);
    //             });
    //             break;
    //         }
    //     }
    // });
    // console.log('WINNERS: ', winners);
// });



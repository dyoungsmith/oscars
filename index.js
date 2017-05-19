const request = require('request');
const rp = require('request-promise');
const axios = require('axios');

rp('http://oscars.yipitdata.com/')
.then(res => JSON.parse(res).results)
.then(nomsByYr => { // all Oscar nominated movies by year

    let detailPromises = [],
        winners = [];

    nomsByYr.forEach(yr => {
        for (let i = 0; i < yr.films.length; i++) {
            let currFilm = yr.films[i];
            if (currFilm.Winner) {
                // detailPromises.push(axios.get(currFilm['Detail URL']));
                axios.get(currFilm['Detail URL'])
                .then(res => JSON.parse(res.data).Budget)
                .then(budget => {
                    winners.push({
                        year: yr.year,
                        title: currFilm.Film,
                        budget
                    });
                })
                .catch(err => console.error(err));
                break;
            }
        }
        console.log('WINNERS: ', winners);
    });

    // let detailProms = Promise.all(detailPromises).then(res;

    // console.log('PROMS: ', detailProms);

    // return Promise.all(detailPromises)
    // // .then(res => JSON.parse(res))
    // .then(deets => {
    //     console.log('FIRST DEETS', deets[0])
    //     return { details: deets, winners }
    // });
})
// .then(({ details, winners }) => {
//     // console.log('DEETS: ', details[0].results);
//     // console.log('DEETS: ', details, 'WINNERS: ', winners);
// })
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



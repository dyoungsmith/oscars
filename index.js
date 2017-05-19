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
                rp(currFilm['Detail URL'])
                .then(res => JSON.parse(res).Budget)    // EDGE: some budgets undefined
                .then(budget => {
                    // console.log('BUDGET', budget);
                    if (budget) {
                        winners.push({
                            year: yr.year,
                            title: currFilm.Film,
                            budget
                        });
                    }
                    // console.log('WINNERS: ', winners);
                })
                .catch(err => console.error(err));
                break;
            }
        }
    });
    return winners;

    // let detailProms = Promise.all(detailPromises).then(res;

    // console.log('PROMS: ', detailProms);

    // return Promise.all(detailPromises)
    // // .then(res => JSON.parse(res))
    // .then(deets => {
    //     console.log('FIRST DEETS', deets[0])
    //     return { details: deets, winners }
    // });
})
.then(winners => {
    console.log('WINNERS: ', winners);
})
// .then(({ details, winners }) => {
//     // console.log('DEETS: ', details[0].results);
//     // console.log('DEETS: ', details, 'WINNERS: ', winners);
// })
.catch(err => console.error(err));



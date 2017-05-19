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
                detailPromises.push(rp(currFilm['Detail URL']));
                
                winners.push({
                    year: yr.year,
                    title: currFilm.Film
                });
                break;
            }
        }
    });

    return Promise.all(detailPromises)
    .then(res => {
        let budgets = [];
        res.forEach(film => {
            let budget = JSON.parse(film).Budget;
            if (budget) budgets.push(budget);
            else budgets.push(null);
        });
        return budgets;
    })
    .then(budgets => {
        return { budgets, winners };
    });
})
.then(({ budgets, winners }) => {
    console.log('DEETS: ', budgets, 'WINNERS: ', winners);
})
.catch(err => console.error(err));



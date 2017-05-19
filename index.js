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
                detailPromises.push(rp(currFilm['Detail URL']));    // Build array for Promise.all
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
    // Condense the winner information
    winners.forEach((winner, i) => {
        // Clean up year string
        const yrRE = /^\d{4}/;  // one year: '2010'
        const yrRangeRE = /^\d{4}\s\/\s\d{2}/;  // year range: '1927 / 28'
        let yr = winner.year.match(yrRangeRE) || winner.year.match(yrRE);
        winner.year = yr[0];

        // Transform budget and add to winner
        // str >> Number; GBP >> USD
        winner.budget = budgets[i];
    });
    console.log('WINNERS: ', winners);
})
.catch(err => console.error(err));



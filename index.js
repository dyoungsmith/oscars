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
                detailPromises.push(rp(currFilm['Detail URL']));    // Build details array for Promise.all
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
        // YEAR: Clean up year string
        const year = winner.year;
        const yrRE = /^\d{4}/;  // one year: '2010'
        const yrRangeRE = /^\d{4}\s\/\s\d{2}/;  // year range: '1927 / 28'
        const yrMatches = year.match(yrRangeRE) || year.match(yrRE);
        winner.year = yrMatches[0];

        // BUDGET: Transform budget and add to winner
        // str >> Number; GBP >> USD
        let budgCount = 0,
            totalBudg = 0;
        const budg = budgets[i];
        const decimal = /\d+\.\d+/;    // '1.2', '16.5' (ranges limited to min)
        const mil = /\d+,\d+,\d+/;  // '3,456,432'
        const thou = /\d+,\d+/;  // '3,456'
        const short = /\d+/;   // '15 million' matches '15'
        const million = /million/i;
        const usd = /us/i;

        if (budg) {
            let numericalBudg;
            budgCount++;
            // grab numerical portion
            // if (budg.match(decimal)) {
            //     numericalBudg = Number(budg.match(decimal)[0].substring(1));
            //     if (budg.match(million)) numericalBudg *= 1000000;

            // }
            if (budg.match(mil) || budg.match(thou)) {
                numericalBudg = budg;
            }
            else if (budg.match(decimal) || budg.match(short)) {
                const budgMatch = budg.match(decimal) || budg.match(short);
                numericalBudg = Number(budgMatch[0]);
                if (budg.match(million)) numericalBudg *= 1000000;
                // Convert GBP >> USD
            }
            totalBudg += numericalBudg;
            winner.budget = numericalBudg;
        }
        else { winner.budget = budg; }
        const avgBudg = totalBudg / budgCount;
    });

    console.log('WINNERS: ', winners);
})
.catch(err => console.error(err));



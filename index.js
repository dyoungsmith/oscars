const rp = require('request-promise');

rp('http://oscars.yipitdata.com/')
.then(res => JSON.parse(res).results)
.then(nomsByYr => { // all Oscar nominated movies by year
    let detailPromises = [],
        winners = [];

    // Extract year and title for each winner
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

    // Resolve budget info for all winners
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
    })
    .catch(err => console.error(err));
})
.then(({ budgets, winners }) => {
    let budgCount = 0,
        totalBudg = 0;

    // Condense the winner information into one object
    winners.forEach((winner, i) => {
        // YEAR: Clean up year string
        const year = winner.year;
        const yrRE = /^\d{4}/;  // one year: '2010'
        const yrRangeRE = /^\d{4}\s\/\s\d{2}/;  // year range: '1927 / 28'
        const yrMatches = year.match(yrRangeRE) || year.match(yrRE);
        winner.year = yrMatches[0];

        // BUDGET: Transform budget and add to winner
        const budg = budgets[i];
        const decimal = /\d+\.\d+/;    // matches '1.2', '16.5' (ranges limited to min)
        const mil = /\d+,\d+,\d+/;  // matches '3,456,432'
        const thou = /\d+,\d+/;  // matches '3,456'
        const short = /\d+/;   // '15 million' matches '15'
        const million = /million/i; // 'million' (for multiplication purposes)

        if (budg) {
            let numericalBudg;
            budgCount++;
            // grab numerical portion
            if (budg.match(mil) || budg.match(thou)) {
                const budgMatch = budg.match(mil) || budg.match(thou);
                numericalBudg = Number(budgMatch[0].split(',').join(''));
            }
            else if (budg.match(decimal) || budg.match(short)) {
                const budgMatch = budg.match(decimal) || budg.match(short);
                numericalBudg = Number(budgMatch[0]);
                if (budg.match(million)) numericalBudg *= 1000000;
            }
            // Convert GBP to USD (1.29 usd === 1 gbp)
            if (budg.match(/£/)) {
                numericalBudg *= 1.29;
            }

            totalBudg += numericalBudg;
            winner.budget = numericalBudg.toLocaleString('en');
        }
        else { winner.budget = budg; }
        console.log(`${winner.year}\t${winner.title} (${winner.budget ? `$${winner.budget}` : 'No budget available'})`);
    });

    const avgBudg = Math.floor(totalBudg / budgCount).toLocaleString('en');
    console.log(`\nAverage budget for ${budgCount} winners: $${avgBudg}`);
})
.catch(err => console.error(err));



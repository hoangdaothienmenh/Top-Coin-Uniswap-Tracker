// napravi glavni objekat - main
let main = {};
// napravi prazan niz u koji treba uneti valute
let coins = [];
let selectedCoins = [];
let uniswapcoins = [];

let run = true;

chrome.runtime.onInstalled.addListener(function(e){
    if(e.reason === 'install') chrome.tabs.create({url: "../html/welcome.html"});
    if(e.reason === 'update') {
        core();
        // chrome.tabs.create({url: "../html/update.html"});
    };
});


chrome.storage.local.get('main', data => {
    if (!data.main) return core();

    main = data.main;
    
    if (main.timestamp) {
        if (timeDifference() > 10) core();
    }
});

// glavna petlja koja se poziva u odredjenom vremenskom intervalu
setInterval(() => {
    chrome.storage.local.get('main', data => {
        if (data.main) main = data.main;
        
        if (timeDifference() >= 31) {
            // pokreni glavnu funkciju
            core();
        }
    });
}, 20000);

function core(){
    if (run) {
        run = false;
        // dohvati objekat convert
        chrome.storage.local.get(['convert', 'arr'], async data => {
            // ukoliko objekat konvert postoji, unesi ga u objekat main
            main['convert'] = data.convert ? data.convert : 'usd';
            // dohvati izabrane koine i smesti ih u promenjivu
            const arr = data.arr ? data.arr : ['bitcoin-btc'];
            console.log(data);

            try {
                await getListOfCoins(arr);
                main['coins'] = coins;
            } catch(error) {
                console.log(error);
            }
            
            try {
                await getCoinsData();
            } catch (error) {
                console.log(error);
            }

            try {
                await getMarketCap('https://api.coingecko.com/api/v3/global');
                main['timestamp'] = new Date().getTime();
            } catch (error) {
               console.log(error);
            }
            try {
                await getUniswapassets('https://api.covalenthq.com/v1/1/networks/uniswap_v2/assets/?&key=ckey_49efd764b1204840a690e6e004c');
                main["uniswap_v2"] = uniswapcoins
                // main['timestamp'] = new Date().getTime();
            } catch (error) {
               console.log(error);
            }
            chrome.storage.local.set({main});
            
            try {
                if(main['alerts']) main['coins'].forEach(checkAlert);
            } catch (error) {
                console.log(error);
            }

            run = true;
        });
    }
}


async function getUniswapassets(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();
        console.log(data);
        uniswapcoins = data
        // main['uniswap_v2'] = data || {};
        // main['market_cap'][`total_market_cap_${main.convert ? main.convert.toLowerCase() : 'usd'}`] = data.data.total_market_cap[main.convert ? main.convert.toLowerCase() : 'usd'];
    } catch (error) {
        console.log(error);
    }
}
async function getMarketCap(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();

        main['market_cap'] = main['market_cap'] || {};
        main['market_cap'][`total_market_cap_${main.convert ? main.convert.toLowerCase() : 'usd'}`] = data.data.total_market_cap[main.convert ? main.convert.toLowerCase() : 'usd'];
    } catch (error) {
        console.log(error);
    }
}

async function getCoinsData() {
    try {
        const coinsList = selectedCoins.map(coin => coin.id);
        
        if (coinsList.length > 0) {
            await getCoinsBtcPrice(coinsList);
            await getCoinsFiatPrice(coinsList);
        }
    } catch (error) {
        console.log(error);
    }
}

async function getCoinsBtcPrice(coinsList) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=btc&ids=${coinsList.join('%2C')}`);
    const data = await response.json();

    for (const coin of main['coins']) {
        for (const coin_btc of data) {
            if (coin.id === coin_btc.id) coin['current_price_btc'] = coin_btc.current_price;
        }
    }
}

async function getCoinsFiatPrice(coinsList) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${main['convert'] ? main['convert'].toLowerCase() : 'usd'}&ids=${coinsList.join('%2C')}`);
    const data = await response.json();

    for (const coin of main['coins']) {
        for (const coin_fiat of data) {
            if (coin.id === coin_fiat.id) {
                coin[`current_price_${main.convert ? main.convert.toLowerCase() : 'usd'}`] = coin_fiat.current_price;
                coin['price_change_percentage_24h'] = coin_fiat.price_change_percentage_24h;
                coin['market_cap_rank'] = coin_fiat['market_cap_rank'];
            }
        }
    }
}

async function getListOfCoins(arr){
    try {
        // ponisti "coins" niz
        coins = [];
        selectedCoins = [];

        const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
        const data = await response.json();

        data
            .filter(coin => coin.name && coin.symbol)
            .forEach(coin => {
                if (arr.includes(coin.name.toLowerCase().split(' ').join('-') + '-' + coin.symbol.toLowerCase())) selectedCoins.push(coin);
                
                if (main['alerts']) {
                    for (const key in main['alerts']) {
                        if (main['alerts'].hasOwnProperty(key) && !selectedCoins.find(e => e.id === coin.id)) {
                            if (key === coin.id) selectedCoins.push(coin);
                        }
                    }
                }

                saveCoinData(coin);
            });
    } catch (error) {
        console.log(error);
    }
}

function checkAlert(coin){
    try {
        if(main.alerts[coin.id.toLowerCase()]){
            
            const currency = main.alerts[coin.id.toLowerCase()].cur === 'btc' ? 'btc' : (main.convert ? main.convert.toLowerCase() : 'usd');
            const current_price = coin[`current_price_${currency}`];
            
            if(main.alerts[coin.id.toLowerCase()].max < current_price){
                chrome.notifications.create({
                    type: 'basic',
                    title: 'Green Alert',
                    message: `Price of ${coin.name.toUpperCase()} is above ${main.alerts[coin.id.toLowerCase()].max + ' ' + currency.toUpperCase()}.`,
                    iconUrl: '../img/alert_up.png',
                    priority: 2,
                    requireInteraction: true
                })
            }
    
            if(main.alerts[coin.id.toLowerCase()].min > current_price){
                chrome.notifications.create({
                    type: 'basic',
                    title: 'Red Alert',
                    message: `Price of ${coin.name.toUpperCase()} is below ${main.alerts[coin.id.toLowerCase()].min + ' ' + currency.toUpperCase()}.`,
                    iconUrl: '../img/alert_down.png',
                    priority: 2,
                    requireInteraction: true
                })
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function saveCoinData(coin){
    try {
        // kreiraj prazan objekat koji zatim treba dodati na coins niz
        let empty = {};

        empty['id'] = coin.id;
        empty['name'] = coin.name;
        empty['symbol'] = coin.symbol;

        coins.push(empty);
    } catch (error) {
        console.log(error);
    }
}

function timeDifference() {
    return Math.floor((new Date().getTime() - main.timestamp) / 1000);
}

function sleep(time){
    return new Promise((resolve, reject) => setTimeout(resolve, time))
}

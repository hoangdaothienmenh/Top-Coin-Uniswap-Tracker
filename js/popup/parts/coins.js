import { mapPrice } from '../../shared/shared.js'

const container = document.querySelector('.container');

let changeClass;

export const coins = {
    render(main, arr) {
        console.log("main");

        console.log(main);
        
        main.uniswap_v2.data.items
                 // .filter(coin => {
                 //     return arr.includes(coin.name.toLowerCase().split(' ').join('-') + '-' + coin.symbol.toLowerCase());
                 // })
                 // .sort((a, b) => a['market_cap_rank'] - b['market_cap_rank'])
                 .forEach(coin => {
                     // renderuj koin
                     // console.log(coin);
                     this.coin(main.uniswap_v2.data.items, coin);
                 });
    },

    coin(main, coin) {
        try {
            let stablecoins =["dai","usdt","usdc","weth","wbtc"]
            // napravi div sa klasom coin i dodaj ga na container
            let coinWrapper = document.createElement('div');
            coinWrapper.className = 'coin';
            console.log(coin);
            let token_0 = coin.token_0.contract_ticker_symbol
            let token_1 = coin.token_1.contract_ticker_symbol
            // this.upOrDown(coin);
            if (stablecoins.includes(token_0.toLowerCase()) && stablecoins.includes(token_1.toLowerCase())) {
                console.log("have stablecoins");
                return 0;
            }
            coin.quote_rate = coin.token_0.quote_rate;

            let contract_address = coin.exchange;
            let contract_name = coin.token_0.contract_name;
            if (stablecoins.includes(token_0.toLowerCase()) ) {
                coin.quote_rate = coin.token_1.quote_rate;
                contract_name = coin.token_1.contract_name;
                contract_address = coin.token_1.exchange
                // return 0;
            }
                //    <div class="zero-col">

                //     ${ this.contract_namerender(contract_name) }
                // </div>
                // return 0;


                //    <div class="third-col">
                //     ${ this.contract_namerender(contract_name) }
                // </div>
            coinWrapper.innerHTML = `

                <div class="first-col">

                    ${ this.name(coin.token_0.contract_ticker_symbol + "/"+coin.token_1.contract_ticker_symbol,contract_address) }
                    ${ this.btcPrice(contract_name) }
                </div>
                <div class="second-col">
                    ${ this.coinPrice(coin.quote_rate) }
                </div>
             
            `;
    
            container.appendChild(coinWrapper);
        } catch (error) {
            console.log(error);
        }
    },

    name(contract_ticker_symbol, contract_address) {
        // if (main['link']) return this.link(coin);
        console.log(contract_address);
        return this.noLink(contract_ticker_symbol,contract_address);
    },
    contract_namerender(contract_name) {
        // if (main['link']) return this.link(coin);

         return `
            <span class="contract-name">
                ${ contract_name }
            </span>
        `;
    },
    link(coin) {
        return `
            <a class="coin-name link" href="${ 'https://www.coingecko.com/en/coins/' + coin.id }" target="_blank">
                ${ coin.name + ' ' + coin.symbol.toUpperCase() }<!--
                --><img src="../img/link.png\"">
            </a>
        `;
    },

    noLink(contract_ticker_symbol,contract_address) {
          return `
            <a class="coin-name link" href="${ 'https://www.dextools.io/app/uniswap/pair-explorer/' + contract_address }" target="_blank">
                ${ contract_ticker_symbol }<!--
                --><img src="../img/link.png\"">
            </a>
        `;
      
    },

    btcPrice(quote_rate) {
        // if (quote_rate.toLowerCase() !== 'bitcoin' && coin.current_price_btc) {
            return `
                <span class="coin-btc-price">
                    ${ quote_rate }
                </span>
            `;
        // }
        return '';
    },

    coinPrice(quote_rate) {
        // let fiat = main.convert ? main.convert.toLowerCase() : 'usd';
        // let price = parseFloat(coin[`current_price_${ fiat }`]);
        
        // if (fiat === 'idr') container.classList.add('wide');
    
        document.querySelector('.fiat').textContent = quote_rate+ ' PRICE';
    
        return `
            <span class="coin-price">
                ${ quote_rate ? quote_rate : '/' }
            </span>
        `;
    },

    roundFiatPrice(fiat, price) {
        return price.toString().charAt(0) == '0' ? mapPrice[fiat] + price.toFixed(8) : mapPrice[fiat] + price.toFixed(4);
    },

    priceChange(coin) {
        if ( coin.price_change_percentage_24h ) {
    
            let changeValue;
    
            if(typeof coin.price_change_percentage_24h === 'string') changeValue = parseFloat(coin.price_change_percentage_24h).toFixed(2) + '%';
            if(typeof coin.price_change_percentage_24h === 'number') changeValue = coin.price_change_percentage_24h.toFixed(2) + '%';
    
            return `
                <span class="${ 'change ' + changeClass }">
                    ${ changeValue }
                </span>
            `;
        }
        return '';
    },

    upOrDown(coin) {
        try {
            if(typeof coin.price_change_percentage_24h === 'string') changeClass = coin.price_change_percentage_24h.indexOf('-') != -1 ? 'down' : 'up';
            if(typeof coin.price_change_percentage_24h === 'number') changeClass = coin.price_change_percentage_24h < 0 ? 'down' : 'up';
        } catch (error) {
            console.log(error);
        }
    }
};
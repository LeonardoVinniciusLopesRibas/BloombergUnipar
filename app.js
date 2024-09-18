let stompClient = null;
let connected = false;
let stocksLoaded = false;


function connect() {
    const socket = new SockJS('http://localhost:8080/stock-prices', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);

        stompClient.send("/app/connect", {}, JSON.stringify({ name: 'user' }));
        
        stompClient.subscribe('/topic/stock-prices', function(response) {
            const stocks = JSON.parse(response.body);           
            console.log('Received stocks:', stocks);
            if (!stocksLoaded) {
                createStockBlocks(stocks);
                stocksLoaded = true;
            } else {
                updateStockBlocks(stocks);
            }
        });
    }, function (error) {
        console.log('Connection lost, retrying in 5 seconds...', error);
        connected = false;
        setTimeout(reconnect, 5000);
    });
}

function reconnect() {
    if (!connected) {
        console.log('Reconnecting...');
        connect();
    }
}

function createStockBlocks(stocks) {
    const container = document.getElementById('stock-container');
    container.innerHTML = '';

    stocks.forEach(stock => {
        const stockBlock = document.createElement('div');
        stockBlock.className = 'stock-block';
        stockBlock.id = stock.name.replace(/\s+/g, '-').toLowerCase();

        const stockName = document.createElement('h2');
        stockName.innerText = stock.name;

        const stockPrice = document.createElement('p');
        stockPrice.innerText = stock.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        stockBlock.appendChild(stockName);
        stockBlock.appendChild(stockPrice);

        container.appendChild(stockBlock);
    });
}

let previousPrices = {};

function updateStockBlocks(stocks) {
    const container = document.getElementById('stock-container');

    stocks.forEach(stock => {
        const stockId = stock.name.replace(/\s+/g, '-').toLowerCase();
        const stockBlock = document.getElementById(stockId);

        let arrow = '';

        if (stockBlock) {
            const stockPriceElement = stockBlock.querySelector('p');
            const previousPrice = previousPrices[stock.name];

            if (previousPrice !== undefined) {
                if (stock.price > previousPrice) {
                    arrow = '<span class="arrow-up">⬆</span>';
                } else if (stock.price < previousPrice) {
                    arrow = '<span class="arrow-down">⬇</span>';
                }
            }

            stockPriceElement.innerHTML = `${stock.price.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })} ${arrow}`;
        } else {
            const newBlock = document.createElement('div');
            newBlock.className = 'stock-block';
            newBlock.id = stockId;

            const stockName = document.createElement('h2');
            stockName.innerText = stock.name;

            const stockPrice = document.createElement('p');
            stockPrice.innerText = stock.price.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            newBlock.appendChild(stockName);
            newBlock.appendChild(stockPrice);

            container.appendChild(newBlock);
        }

        previousPrices[stock.name] = stock.price;
    });
}

window.onload = function() {
    connect();
};



const canvas = document.getElementById('hacker-background');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const symbolSize = 20;
const columns = canvas.width / symbolSize;
const drops = Array.from({ length: columns }).fill(1);

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#39ff14';
    ctx.font = `${symbolSize}px Arial`;

    for (let i = 0; i < drops.length; i++) {
        const text = Math.floor(Math.random() * 2);
        const x = i * symbolSize;
        const y = drops[i] * symbolSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

setInterval(draw, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


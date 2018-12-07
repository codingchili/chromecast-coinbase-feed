/**
 * Handles the coinbase event stream over websocket.
 */
class Feed {

    constructor() {
        this.events = [];
    }

    start(maxEvents, pair) {
        this.maxEvents = maxEvents || 16;
        this.status('connecting');

        this.socket = new WebSocket("wss://ws-feed.pro.coinbase.com/");

        this.socket.onopen = (e) => {
            this.status('connected');
            let subscribe = {
                "type": "subscribe",
                "product_ids": [
                    pair
                ],
                "channels": [
                    "level2",
                    "heartbeat",
                    {
                        "name": "ticker",
                        "product_ids": [
                            pair
                        ]
                    }
                ]
            };

            this.socket.send(JSON.stringify(subscribe));
        };

        this.socket.onmessage = (e) => {
            this.onUpdate(e.data);
        };

        this.socket.onclose = (e) => {
            this.status("closed");
            if (this.onStopped) {
                this.onStopped();
            }
        };
    }

    stop(stopped) {
        if (this.socket) {
            this.onStopped = stopped;
            this.socket.close();
        } else {
            stopped();
        }
    }

    onUpdate(msg) {
        let messages = document.getElementById('items');

        let update = JSON.parse(msg);

        if (this.filter(update)) {

            this.events.unshift(update);

            if (this.events.length > this.maxEvents) {
                this.events.pop();
            }

            let element = document.createElement('div');
            element.classList.add("items");

            element.innerHTML = `
                <div class="item">
                    <span class="time">${update.time}</span>
                    <span class="product">${update.product_id}</span>
                    <span class="size">${this.truncate(update.last_size)}</span> @
                    <span class="${update.side === 'buy' ? 'up' : 'down'}">${update.price}</span>
                </div>
                `;

            messages.insertBefore(element, messages.firstChild);

            if (messages.childNodes.length > this.maxEvents) {
                messages.removeChild(messages.lastChild);
            }
        }
    }

    truncate(size) {
        return (size + "").substring(0, 7);
    }

    filter(update) {
        return update.time && update.type === 'ticker';
    }

    status(text) {
        document.getElementById('status').innerHTML = `
            <span class="status">
                status:
            </span>
            <span class="${text}">
                ${text}
            </span>`;
    }
}

var feed = new Feed();
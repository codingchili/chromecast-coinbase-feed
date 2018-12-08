/**
 * Handles the coinbase event stream over websocket.
 */
class Feed {

    constructor() {
        this.events = [];
    }

    /**
     * Starts the feed - connecting to the websocket endpoint and subscribing to the given ticker.
     * @param maxEvents the max number of events to display in the buffer.
     * @param pair the ticker to show, for example ETH-EUR.
     */
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

    /**
     * Stops the feed - closing the websocket.
     * @param stopped callback invoked when the socket is closed.
     * The close operation is asynchronous - we don't really need to wait for the old socket to close first.
     * This is just so the status messages will be shown in the correct order.
     */
    stop(stopped) {
        if (this.socket) {
            this.onStopped = stopped;
            this.socket.close();
        } else {
            stopped();
        }
    }

    /**
     * Handles an update event from the websocket API.
     * @param msg the update message from Coinbase.
     */
    onUpdate(msg) {
        let messages = document.getElementById('items');
        let update = JSON.parse(msg);

        if (this.filter(update)) {
            update.time = new Date(Date.parse(update.time));
            this.events.unshift(update);

            if (this.events.length > this.maxEvents) {
                this.events.pop();
            }

            let element = document.createElement('div');
            element.classList.add("items");

            // render the element using a template literal.
            element.innerHTML = `
                <div class="item">
                    <span class="date">${update.time.toLocaleDateString()}</span>
                    <span class="time">${update.time.toLocaleTimeString()}</span>
                    <span class="product">${update.product_id}</span>
                    <span class="size">${this.truncate(update.last_size)}</span> @
                    <span class="${update.side === 'buy' ? 'up' : 'down'}">${update.price}</span>
                </div>
                `;

            // perform DOM manipulation with insertBefore and removeChild - it's fast.
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
        // decide if the update should be shown or not - we only handler ticker updates.
        return update.time && update.type === 'ticker';
    }

    /**
     * Updates the status element.
     * @param text representing the current status.
     */
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
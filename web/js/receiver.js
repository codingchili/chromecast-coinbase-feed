/**
 * Handles the websocket feed and optionally configures the chromecast receiver application.
 */
class Receiver {

    /**
     * Sets up the cast context and listens for a change to the ticker.
     * Also starts the websocket feed.
     */
    start() {
        this.namespace = "urn:x-cast:com.github.codingchili.coinbasefeed";
        this.context = cast.framework.CastReceiverContext.getInstance();
        this.player = this.context.getPlayerManager();

        this.context.setInactivityTimeout(Number.MAX_VALUE);

        this.player.addEventListener(cast.framework.events.category.CORE, event => {
            console.log(event)
        });

        feed.start(16, () => {
            feed.subscribe('ETH-EUR');
            this.context.addCustomMessageListener(this.namespace, (event) => {
                console.log(event);
                if (event.data.ticker) {
                    feed.subscribe(event.data.ticker);
                }
            });
            this.context.start();
        });
    }
}

const receiver = new Receiver();
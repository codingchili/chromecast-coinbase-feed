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
        this.options = new cast.framework.CastReceiverOptions();
        this.options.maxInactivity = 3600;

        this.player.addEventListener(cast.framework.events.category.CORE, event => {
            console.log(event)
        });

        console.log('starting feed');
        feed.start(16, () => {
            console.log('feed connected');
            this.context.addCustomMessageListener(this.namespace, (event) => {
                console.log(event);
                if (event.data.ticker) {
                    feed.subscribe(event.data.ticker);
                }
            });
            console.log('starting context');
            this.context.start(this.options);
            console.log('context started');
        });
    }
}

const receiver = new Receiver();
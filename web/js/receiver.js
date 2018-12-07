/**
 * Handles the websocket feed and optionally configures the chromecast receiver application.
 */
class Receiver {

    cast() {
        this.namespace = "urn:x-cast:com.github.codingchili.coinbasefeed";
        this.context = cast.framework.CastReceiverContext.getInstance();
        this.player = this.context.getPlayerManager();

        this.player.addEventListener(cast.framework.events.category.CORE, event => {
            console.log(event)
        });

        this.context.addCustomMessageListener(this.namespace, (event) => {
            feed.stop(() => {
                feed.start(12, event.data.ticker);
            });
        });
        this.context.start();
    }
}

const receiver = new Receiver();
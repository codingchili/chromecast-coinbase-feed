/**
 * Handles initiating a cast from the sender application.
 */
class Sender {

    constructor() {
        this.applicationID = '52D52890';
        this.namespace = "urn:x-cast:com.github.codingchili.coinbasefeed";
        this.session = null;
        this.context = null;
    }

    /**
     * Initializes the cast API with some options and a listener for session changes.
     */
    initializeCastApi() {
        this.context = cast.framework.CastContext.getInstance();

        this.context.setOptions({
            receiverApplicationId: this.applicationID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            resumeSavedSession: true
        });

        // set up a heartbeat to avoid the receiver from shutting down.
        setInterval(() => {
            if (this.session) {
                this.session.sendMessage(this.namespace, {"heartbeat": true});
            }
        }, 6000);

        // hook up a listener here so we can grab a session if one already exists.
        this.context.addEventListener(
            cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event) => {
                if (event.sessionState === "SESSION_RESUMED") {
                    this.session = this.context.getCurrentSession();
                }
            }
        );
    }

    /**
     * @param ticker instructs the receiver application to change the ticker that is subscribed to.
     */
    onFeedChanged(ticker) {
        this.session.sendMessage(this.namespace, {"ticker": ticker});
    }

    /**
     * Starts the receiver application - creating a new session if one is not already available.
     * @param ticker the ticker that the receiver application will subscribe to when started.
     */
    cast(ticker) {
        this.session = this.session = this.context.getCurrentSession();

        if (this.session == null) {
            this.context.requestSession()
                .then(() => {
                    this.session = this.context.getCurrentSession();

                    this.session.addMessageListener(this.namespace, (event) => {
                        console.log(event);
                    });

                    this.onFeedChanged(ticker);
                }).catch(e => {
                console.log(e);
            });
        } else {
            this.onFeedChanged(ticker);
        }
    }
}

const sender = new Sender();

// see: https://developers.google.com/cast/docs/chrome_sender/integrate
window['__onGCastApiAvailable'] = function (isAvailable) {
    if (isAvailable) {
        sender.initializeCastApi();
    }
};
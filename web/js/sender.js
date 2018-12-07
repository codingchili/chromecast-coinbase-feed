class Sender {

    constructor() {
        this.applicationID = '52D52890';
        this.namespace = "urn:x-cast:com.github.codingchili.coinbasefeed";
        this.session = null;
        this.context = null;
    }

    initializeCastApi() {
        this.context = cast.framework.CastContext.getInstance();

        this.context.setOptions({
            receiverApplicationId: this.applicationID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            resumeSavedSession: true
        });

        this.context.addEventListener(
            cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event) => {
                if (event.sessionState === "SESSION_RESUMED") {
                    this.session = this.context.getCurrentSession();
                }
            }
        );
    }

    onFeedChanged(ticker) {
        this.session.sendMessage(this.namespace, {"ticker": ticker});
    }

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

window['__onGCastApiAvailable'] = function (isAvailable) {
    if (isAvailable) {
        sender.initializeCastApi();
    }
};
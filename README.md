# coinbase vs. chromecast: The Feed
A chromecast receiver application for displaying ticker events from the coinbase websocket feed. The sender is accessible from the web browser.

The chromecast receiver is not currently published - for notes on how to set up your chromecast in developer mode see 
[cast.google.com](https://cast.google.com/publish/#).

![sender application](https://raw.githubusercontent.com/codingchili/chromecast-labs/master/preview.jpg)

#### How it works?
We use the CAF - chromecast application framework. Which is a successor to the cast v2 API. We have created a custom receiver application that runs
some javascript, to connect to the coinbase websocket feed. When started - we send the ticker to use using a 'message' that passes
over a channel. The receiver application then proceeds to subscribe to the given ticker. 

Because we structured our application so nicely, we can also show the websocket feed
in the sender application. :) When you change the ticker, the websocket will be disconnected - and then reconnected to subscribe again. This is
probably a bad alternative to just unsubscribing. Because there is a rate limit per IP - a maximum of 4 websocket connections per "few seconds".

So please don't change the ticker veryyy fast - because the connection will be rejected due to the rate limiter hehe.

#### But why not just cast?
Because! casting tabs are 720p business - that's not a good way to roll about !

We tried to make the receiver lightweight, by using efficient methods for manipulating the DOM. You know so your
chromecast won't be fried. Also, this was a good introduction to the CAF framework :).  


#### Known issues
I think there is a parameter for the options, to set the timeout a little bit longer. Because the receiver
will be stopped after a few minutes hehe.  :kissing_heart:
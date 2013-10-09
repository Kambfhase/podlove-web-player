(function (ctx) {

    function Player(options) {
        this.frame = createFrame(options);
        var frame = this.frame;
        this.sendMessage = function (message) {
            var contentWindow = frame.contentWindow;
            contentWindow.postMessage(message);
            return false;
        };
    }

    function createFrame() {

    }
    ctx.Player = Player;
})(this);

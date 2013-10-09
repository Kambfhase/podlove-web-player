(function () {
    var total, chapters, playbutton, media, $media, progressBar, progressBarCtx, scale, w, h;

    function listener(event) {
        if (event.origin !== "http://localhost") return;
        console.log("received:", event.data);
    }

    if (window.addEventListener) {
        addEventListener("message", listener, false);
    } else {
        attachEvent("onmessage", listener);
    }

    function addPlayButton() {
        playbutton = $('.pwp-play');
        playbutton.on('click', function () {
            if (media.paused) {
                media.play();
                console.log('playing', media.currentSrc);
                return;
            }
            media.pause();
        });
        $media.on('playing', togglePlayPauseButton);
        $media.on('pause', togglePlayPauseButton);
        $media.on('end', togglePlayPauseButton);
    }

    function drawChapter(ctx, start, length, style) {
        var x1 = start;
        var x2 = length - start;
        console.log('color', style.color, 'from', x1, 'to', x2);
        ctx.save();
        ctx.fillStyle = style.color;
        ctx.fillRect(x1, 0, x2, 30);
        ctx.restore();
    }

    function getMediaElement(type) {
        return document.getElementsByTagName(type)[0];
    }

    function getProgressBar() {
        return document.getElementsByTagName('canvas')[0];
    }

    function togglePlayPauseButton(evt) {
        console.log(evt);
        playbutton.toggleClass('pwp-icon-play').toggleClass('pwp-icon-pause');
    }

    /**
     *
     * @param {number} width
     * @param {number} height
     * @return {HTMLElement}
     */
    function scaleCanvas(width, height) {
        var canvas = d.createElement('canvas');

        canvas.width = width * scale;
        canvas.height = height * scale;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        return canvas;
    }

    /**
     *
     * @param   {HTMLElement}   container
     * @param   {String}        id
     * @param   {Number}        width
     * @param   {Number}        height
     * @param   {Number}        zIndex
     * @returns {HTMLElement}
     */
    function createCanvas(container, id, width, height, zIndex) {
        var canvasElement = scaleCanvas(width, height);
        canvasElement.id = id;
        canvasElement.zIndex = zIndex;
        container.appendChild(canvasElement);
        return canvasElement;
    }

    function drawVerticalLine(ctx, end, x) {
        drawLine(ctx, x, 0, x, end);
    }

    function drawHorizontalLine(ctx, end, y) {
        drawLine(ctx, 0, y, end, y);
    }

    function drawLine(ctx, x1, y1, x2, y2, style) {
        style = getStyle(style);
        ctx.save();
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    function getStyle(style) {
        var defaultStyle = {color: 'rgba(255,255,255,1)', width: 2}
            , color = (typeof style.color == 'string') ? style.color : defaultStyle.color
            , width = (typeof style.width == 'number') ? style.width : defaultStyle.width
            ;
        return {color: color,  width: width};
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas
     */
    function clearCanvas(ctx) {
        ctx.clearRect(0, 0, w, h);
    }

    function drawPositionMarker(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * @returns {number}
     */
    function getRatio() {
        // finally query the various pixel ratios
        var context = document.createElement('canvas').getContext('2d')
            , devicePixelRatio  = window.devicePixelRatio || 1
            , backingStoreRatio = context.webkitBackingStorePixelRatio ||
                                  context.mozBackingStorePixelRatio ||
                                  context.msBackingStorePixelRatio ||
                                  context.oBackingStorePixelRatio ||
                                  context.backingStorePixelRatio || 1;

        context = null;
        return (devicePixelRatio / backingStoreRatio);
    }

    function addChapters(newChapters) {
        chapters = newChapters.map(processChapter);
    }

    function processChapter(chapter) {
        //chapter = {"start": "00:00:00.000", "title": "Intro", "href": "", "image": ""}
        var ts = processChapterStart(chapter.start);
    }

    function processChapterStart(timeString) {
        var reg = /^(\d?\d):(\d\d):(\d\d)\.(\d{3})$/;
        if (!timeString.match(reg)) return -1;
        var matches = reg.exec(timeString);
        return ((matches[1] * 60  + matches[2] * 60) + matches[3] * 1000) + matches[4];
    }

    function init(options) {
        media = getMediaElement('audio');
        $media = $(media);
        addChapters(options.chapters);
        total = options.total;
        drawChapters();
        addPlayButton();
    }

    function drawChapters() {
        var lastPos = 0;
        var scale = 410 / total * getRatio();
        var style = {color: "rgb(187, 187, 187)"};
        progressBar = getProgressBar();
        progressBarCtx = progressBar.getContext('2d');
        chapters.forEach(function (chapter) {
            var from = lastPos;
            lastPos += chapter.length * scale;
            console.log(from, lastPos);
            drawChapter(progressBarCtx, from + 1, lastPos - 1, style);
        });
    }

    function randomColor() {
        var channels = [getRandomChannelValue(), getRandomChannelValue(), getRandomChannelValue()];
        return {color: "rgb(" + channels.join(",")  + ")"};
    }

    function getRandomChannelValue() {
        return Math.ceil(Math.random() * 255);
    }

    window.podlove = {
        player: {
            addChapters: addChapters,
            init: init
        }
    };
})();

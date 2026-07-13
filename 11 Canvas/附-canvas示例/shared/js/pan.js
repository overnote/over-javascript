var COREHTML5 = COREHTML5 || {}

// Constructor........................................................

COREHTML5.Pan = function (imageCanvas, image, viewportPercent, panCanvasAlpha) {
    var self = this

    // Store arguments in member variables

    this.imageCanvas = imageCanvas
    this.image = image
    this.viewportPercent = viewportPercent || 10
    this.panCanvasAlpha = panCanvasAlpha || 0.5

    // Get a reference to the image canvas's context,
    // and create the pan canvas and the DOM element.
    // Put the pan canvas in the DOM element.

    this.imageContext = imageCanvas.getContext('2d')
    this.panCanvas = document.createElement('canvas')
    this.panContext = this.panCanvas.getContext('2d')

    this.domElement = document.createElement('div')
    this.domElement.appendChild(this.panCanvas)

    // If the image is not loaded, initialize when the image loads;
    // otherwise, initialize now.

    if (image.width == 0 || image.height == 0) {
        // image not loaded
        image.onload = function (e) {
            self.initialize()
        }
    } else {
        this.initialize()
    }
    return this
}

// Prototype..........................................................

COREHTML5.Pan.prototype = {
    initialize: function () {
        var width = this.image.width * (this.viewportPercent / 100),
            height = this.image.height * (this.viewportPercent / 100)

        this.addEventHandlers()
        this.setupViewport(width, height)
        this.setupDOMElement(width, height)
        this.setupPanCanvas(width, height)
        this.draw()
    },

    setupPanCanvas: function (w, h) {
        this.panCanvas.width = w
        this.panCanvas.height = h
    },

    setupDOMElement: function (w, h) {
        this.domElement.style.width = w + 'px'
        this.domElement.style.height = h + 'px'
        this.domElement.className = 'pan'
    },

    setupViewport: function (w, h) {
        this.viewportLocation = { x: 0, y: 0 }
        this.viewportSize = { width: 50, height: 50 }
        this.viewportLastLocation = { x: 0, y: 0 }

        this.viewportSize.width = (this.imageCanvas.width * this.viewportPercent) / 100

        this.viewportSize.height = (this.imageCanvas.height * this.viewportPercent) / 100
    },

    moveViewport: function (mouse, offset) {
        this.viewportLocation.x = mouse.x - offset.x
        this.viewportLocation.y = mouse.y - offset.y

        var delta = {
            x: this.viewportLastLocation.x - this.viewportLocation.x,
            y: this.viewportLastLocation.y - this.viewportLocation.y,
        }

        this.imageContext.translate(
            delta.x * (this.image.width / this.panCanvas.width),
            delta.y * (this.image.height / this.panCanvas.height)
        )

        this.viewportLastLocation.x = this.viewportLocation.x
        this.viewportLastLocation.y = this.viewportLocation.y
    },

    isPointInViewport: function (x, y) {
        this.panContext.beginPath()
        this.panContext.rect(
            this.viewportLocation.x,
            this.viewportLocation.y,
            this.viewportSize.width,
            this.viewportSize.height
        )

        return this.panContext.isPointInPath(x, y)
    },

    addEventHandlers: function () {
        var pan = this

        pan.domElement.onmousedown = function (e) {
            var mouse = pan.windowToCanvas(e.clientX, e.clientY),
                offset = null

            e.preventDefault()

            if (pan.isPointInViewport(mouse.x, mouse.y)) {
                offset = { x: mouse.x - pan.viewportLocation.x, y: mouse.y - pan.viewportLocation.y }

                pan.panCanvas.onmousemove = function (e) {
                    pan.erase()

                    pan.moveViewport(pan.windowToCanvas(e.clientX, e.clientY), offset)

                    pan.draw()
                }

                pan.panCanvas.onmouseup = function (e) {
                    pan.panCanvas.onmousemove = undefined
                    pan.panCanvas.onmouseup = undefined
                }
            }
        }
    },

    erase: function () {
        this.panContext.clearRect(0, 0, this.panContext.canvas.width, this.panContext.canvas.height)
    },

    drawPanCanvas: function (alpha) {
        this.panContext.save()
        this.panContext.globalAlpha = alpha
        this.panContext.drawImage(
            this.image,
            0,
            0,
            this.image.width,
            this.image.height,
            0,
            0,
            this.panCanvas.width,
            this.panCanvas.height
        )
        this.panContext.restore()
    },

    drawImageCanvas: function () {
        this.imageContext.drawImage(this.image, 0, 0, this.image.width, this.image.height)
    },

    drawViewport: function () {
        this.panContext.shadowColor = 'rgba(0,0,0,0.4)'
        this.panContext.shadowOffsetX = 2
        this.panContext.shadowOffsetY = 2
        this.panContext.shadowBlur = 3

        this.panContext.lineWidth = 3
        this.panContext.strokeStyle = 'white'
        this.panContext.strokeRect(
            this.viewportLocation.x,
            this.viewportLocation.y,
            this.viewportSize.width,
            this.viewportSize.height
        )
    },

    clipToViewport: function () {
        this.panContext.beginPath()
        this.panContext.rect(
            this.viewportLocation.x,
            this.viewportLocation.y,
            this.viewportSize.width,
            this.viewportSize.height
        )
        this.panContext.clip()
    },

    draw: function () {
        this.drawImageCanvas()
        this.drawPanCanvas(this.panCanvasAlpha)

        this.panContext.save()
        this.clipToViewport()
        this.drawPanCanvas(1.0)
        this.panContext.restore()

        this.drawViewport()
    },

    windowToCanvas: function (x, y) {
        var bbox = this.panCanvas.getBoundingClientRect()

        return {
            x: x - bbox.left * (this.panCanvas.width / bbox.width),
            y: y - bbox.top * (this.panCanvas.height / bbox.height),
        }
    },
}

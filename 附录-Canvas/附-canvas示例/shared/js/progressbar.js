var COREHTML5 = COREHTML5 || {}

// Constructor....................................................

COREHTML5.Progressbar = function (strokeStyle, fillStyle, horizontalSizePercent, verticalSizePercent) {
    this.trough = new COREHTML5.RoundedRectangle(strokeStyle, fillStyle, horizontalSizePercent, verticalSizePercent)
    this.SHADOW_COLOR = 'rgba(255,255,255,0.5)'
    this.SHADOW_BLUR = 3
    this.SHADOW_OFFSET_X = 2
    this.SHADOW_OFFSET_Y = 2

    this.percentComplete = 0
    this.createCanvases()
    this.createDOMElement()

    return this
}

// Prototype......................................................

COREHTML5.Progressbar.prototype = {
    createDOMElement: function () {
        this.domElement = document.createElement('div')
        this.domElement.appendChild(this.context.canvas)
    },

    createCanvases: function () {
        this.context = document.createElement('canvas').getContext('2d')

        this.offscreen = document.createElement('canvas').getContext('2d')
    },

    appendTo: function (element) {
        element.appendChild(this.domElement)

        this.domElement.style.width = element.offsetWidth + 'px'

        this.domElement.style.height = element.offsetHeight + 'px'

        this.resize() // obliterates everything in the canvases

        this.trough.resize(element.offsetWidth, element.offsetHeight)
        this.trough.draw(this.offscreen)
    },

    setCanvasSize: function () {
        var domElementParent = this.domElement.parentNode

        this.context.canvas.width = domElementParent.offsetWidth
        this.context.canvas.height = domElementParent.offsetHeight
    },

    resize: function () {
        var domElementParent = this.domElement.parentNode,
            w = domElementParent.offsetWidth,
            h = domElementParent.offsetHeight

        this.setCanvasSize()

        this.context.canvas.width = w
        this.context.canvas.height = h

        this.offscreen.canvas.width = w
        this.offscreen.canvas.height = h
    },

    draw: function (percentComplete) {
        if (percentComplete > 0) {
            // Copy the appropriate region of the foreground canvas
            // to the same region of the onscreen canvas

            this.context.drawImage(
                this.offscreen.canvas,
                0,
                0,
                this.offscreen.canvas.width * (percentComplete / 100),
                this.offscreen.canvas.height,
                0,
                0,
                this.offscreen.canvas.width * (percentComplete / 100),
                this.offscreen.canvas.height
            )
        }
    },

    erase: function () {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    },
}

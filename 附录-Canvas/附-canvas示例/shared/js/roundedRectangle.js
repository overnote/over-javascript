var COREHTML5 = COREHTML5 || {}

// Constructor........................................................

COREHTML5.RoundedRectangle = function (strokeStyle, fillStyle, horizontalSizePercent, verticalSizePercent) {
    this.strokeStyle = strokeStyle ? strokeStyle : 'gray'
    this.fillStyle = fillStyle ? fillStyle : 'skyblue'

    horizontalSizePercent = horizontalSizePercent || 100
    verticalSizePercent = verticalSizePercent || 100

    this.SHADOW_COLOR = 'rgba(100, 100, 100, 0.8)'
    this.SHADOW_OFFSET_X = 3
    this.SHADOW_OFFSET_Y = 3
    this.SHADOW_BLUR = 3

    this.setSizePercents(horizontalSizePercent, verticalSizePercent)

    this.createCanvas()
    this.createDOMElement()

    return this
}

// Prototype..........................................................

COREHTML5.RoundedRectangle.prototype = {
    // General functions ..............................................

    createCanvas: function () {
        var canvas = document.createElement('canvas')
        this.context = canvas.getContext('2d')
        return canvas
    },

    createDOMElement: function () {
        this.domElement = document.createElement('div')
        this.domElement.appendChild(this.context.canvas)
    },

    appendTo: function (element) {
        element.appendChild(this.domElement)
        this.domElement.style.width = element.offsetWidth + 'px'
        this.domElement.style.height = element.offsetHeight + 'px'
        this.resize(element.offsetWidth, element.offsetHeight)
    },

    resize: function (width, height) {
        this.HORIZONTAL_MARGIN = (width - width * this.horizontalSizePercent) / 2

        this.VERTICAL_MARGIN = (height - height * this.verticalSizePercent) / 2

        this.cornerRadius = (this.context.canvas.height / 2 - 2 * this.VERTICAL_MARGIN) / 2

        this.top = this.VERTICAL_MARGIN
        this.left = this.HORIZONTAL_MARGIN
        this.right = this.left + width - 2 * this.HORIZONTAL_MARGIN
        this.bottom = this.top + height - 2 * this.VERTICAL_MARGIN

        this.context.canvas.width = width
        this.context.canvas.height = height
    },

    setSizePercents: function (h, v) {
        // horizontalSizePercent and verticalSizePercent
        // represent the size of the rounded rectangle in terms
        // of horizontal and vertical percents of the rectangle's
        // enclosing DOM element.

        this.horizontalSizePercent = h > 1 ? h / 100 : h
        this.verticalSizePercent = v > 1 ? v / 100 : v
    },

    // Drawing Functions...............................................

    fill: function () {
        var radius = (this.bottom - this.top) / 2

        this.context.save()
        this.context.shadowColor = this.SHADOW_COLOR
        this.context.shadowOffsetX = this.SHADOW_OFFSET_X
        this.context.shadowOffsetY = this.SHADOW_OFFSET_Y
        this.context.shadowBlur = 6

        this.context.beginPath()

        this.context.moveTo(this.left + radius, this.top)

        this.context.arcTo(this.right, this.top, this.right, this.bottom, radius)

        this.context.arcTo(this.right, this.bottom, this.left, this.bottom, radius)

        this.context.arcTo(this.left, this.bottom, this.left, this.top, radius)

        this.context.arcTo(this.left, this.top, this.right, this.top, radius)

        this.context.closePath()

        this.context.fillStyle = this.fillStyle
        this.context.fill()
        this.context.shadowColor = undefined
    },

    overlayGradient: function () {
        var gradient = this.context.createLinearGradient(this.left, this.top, this.left, this.bottom)

        gradient.addColorStop(0, 'rgba(255,255,255,0.4)')
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.6)')
        gradient.addColorStop(0.25, 'rgba(255,255,255,0.7)')
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.9)')
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.7)')
        gradient.addColorStop(0.45, 'rgba(255,255,255,0.6)')
        gradient.addColorStop(0.6, 'rgba(255,255,255,0.4)')
        gradient.addColorStop(1, 'rgba(255,255,255,0.1)')

        this.context.fillStyle = gradient
        this.context.fill()

        this.context.lineWidth = 0.4
        this.context.strokeStyle = this.strokeStyle
        this.context.stroke()

        this.context.restore()
    },

    draw: function (context) {
        var originalContext

        if (context) {
            originalContext = this.context
            this.context = context
        }

        this.fill()
        this.overlayGradient()

        if (context) {
            this.context = originalContext
        }
    },

    erase: function () {
        // Erase the entire canvas

        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    },
}

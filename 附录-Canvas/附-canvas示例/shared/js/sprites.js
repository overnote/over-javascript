// Painters...................................................................

// Painters paint sprites with a paint(sprite, context) method. ImagePainters
// paint an image for their sprite.

var ImagePainter = function (imageUrl) {
    this.image = new Image()
    this.image.src = imageUrl
}

ImagePainter.prototype = {
    image: undefined,

    paint: function (sprite, context) {
        if (this.image !== undefined) {
            if (!this.image.complete) {
                this.image.onload = function (e) {
                    sprite.width = this.width
                    sprite.height = this.height

                    context.drawImage(
                        this, // this is image
                        sprite.left,
                        sprite.top,
                        sprite.width,
                        sprite.height
                    )
                }
            } else {
                context.drawImage(this.image, sprite.left, sprite.top, sprite.width, sprite.height)
            }
        }
    },
}

SpriteSheetPainter = function (cells) {
    this.cells = cells
}

SpriteSheetPainter.prototype = {
    cells: [],
    cellIndex: 0,

    advance: function () {
        if (this.cellIndex == this.cells.length - 1) {
            this.cellIndex = 0
        } else {
            this.cellIndex++
        }
    },

    paint: function (sprite, context) {
        var cell = this.cells[this.cellIndex]
        context.drawImage(
            spritesheet,
            cell.left,
            cell.top,
            cell.width,
            cell.height,
            sprite.left,
            sprite.top,
            cell.width,
            cell.height
        )
    },
}

// Sprite Animators...........................................................

// Sprite animators have an array of painters that they succesively apply
// to a sprite over a period of time. Animators can be started with
// start(sprite, durationInMillis, restoreSprite)

var SpriteAnimator = function (painters, elapsedCallback) {
    this.painters = painters
    if (elapsedCallback) {
        this.elapsedCallback = elapsedCallback
    }
}

SpriteAnimator.prototype = {
    painters: [],
    duration: 1000,
    startTime: 0,
    index: 0,
    elapsedCallback: undefined,

    end: function (sprite, originalPainter) {
        sprite.animating = false

        if (this.elapsedCallback) {
            this.elapsedCallback(sprite)
        } else {
            sprite.painter = originalPainter
        }
    },

    start: function (sprite, duration) {
        var endTime = +new Date() + duration,
            period = duration / this.painters.length,
            interval = undefined,
            animator = this, // for setInterval() function
            originalPainter = sprite.painter

        this.index = 0
        sprite.animating = true
        sprite.painter = this.painters[this.index]

        interval = setInterval(function () {
            if (+new Date() < endTime) {
                sprite.painter = animator.painters[++animator.index]
            } else {
                animator.end(sprite, originalPainter)
                clearInterval(interval)
            }
        }, period)
    },
}

// Sprites....................................................................

// Sprites have a name, a painter, and an array of behaviors. Sprites can
// be updated, and painted.
//
// A sprite's painter paints the sprite: paint(sprite, context)
// A sprite's behavior executes: execute(sprite, context, time)

var Sprite = function (name, painter, behaviors) {
    if (name !== undefined) this.name = name
    if (painter !== undefined) this.painter = painter
    if (behaviors !== undefined) this.behaviors = behaviors

    return this
}

Sprite.prototype = {
    left: 0,
    top: 0,
    width: 10,
    height: 10,
    velocityX: 0,
    velocityY: 0,
    visible: true,
    animating: false,
    painter: undefined, // object with paint(sprite, context)
    behaviors: [], // objects with execute(sprite, context, time)

    paint: function (context) {
        if (this.painter !== undefined && this.visible) {
            this.painter.paint(this, context)
        }
    },

    update: function (context, time) {
        for (var i = this.behaviors.length; i > 0; --i) {
            this.behaviors[i - 1].execute(this, context, time)
        }
    },
}

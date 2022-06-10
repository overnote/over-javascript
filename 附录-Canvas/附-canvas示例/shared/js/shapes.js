var Point = function (x, y) {
    this.x = x
    this.y = y
}

var Shape = function () {
    this.x = undefined
    this.y = undefined
    this.strokeStyle = 'rgba(255, 253, 208, 0.9)'
    this.fillStyle = 'rgba(147, 197, 114, 0.8)'
}

Shape.prototype = {
    collidesWith: function (shape) {
        var axes = this.getAxes().concat(shape.getAxes())
        return !this.separationOnAxes(axes, shape)
    },

    separationOnAxes: function (axes, shape) {
        for (var i = 0; i < axes.length; ++i) {
            axis = axes[i]
            projection1 = shape.project(axis)
            projection2 = this.project(axis)

            if (!projection1.overlaps(projection2)) {
                return true // don't have to test remaining axes
            }
        }
        return false
    },

    move: function (dx, dy) {
        throw 'move(dx, dy) not implemented'
    },

    createPath: function (context) {
        throw 'createPath(context) not implemented'
    },

    getAxes: function () {
        throw 'getAxes() not implemented'
    },

    project: function (axis) {
        throw 'project(axis) not implemented'
    },

    fill: function (context) {
        context.save()
        context.fillStyle = this.fillStyle
        this.createPath(context)
        context.fill()
        context.restore()
    },

    stroke: function (context) {
        context.save()
        context.strokeStyle = this.strokeStyle
        this.createPath(context)
        context.stroke()
        context.restore()
    },

    isPointInPath: function (context, x, y) {
        this.createPath(context)
        return context.isPointInPath(x, y)
    },
}

var Projection = function (min, max) {
    this.min = min
    this.max = max
}

Projection.prototype = {
    overlaps: function (projection) {
        return this.max > projection.min && projection.max > this.min
    },
}

var Vector = function (x, y) {
    this.x = x
    this.y = y
}

Vector.prototype = {
    getMagnitude: function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    },

    add: function (vector) {
        var v = new Vector()
        v.x = this.x + vector.x
        v.y = this.y + vector.y
        return v
    },

    subtract: function (vector) {
        var v = new Vector()
        v.x = this.x - vector.x
        v.y = this.y - vector.y
        return v
    },

    dotProduct: function (vector) {
        return this.x * vector.x + this.y * vector.y
    },

    edge: function (vector) {
        return this.subtract(vector)
    },

    perpendicular: function () {
        var v = new Vector()
        v.x = this.y
        v.y = 0 - this.x
        return v
    },

    normalize: function () {
        var v = new Vector(),
            m = this.getMagnitude()
        v.x = this.x / m
        v.y = this.y / m
        return v
    },

    normal: function () {
        var p = this.perpendicular()
        return p.normalize()
    },
}

var Polygon = function () {
    this.points = []
    this.strokeStyle = 'blue'
    this.fillStyle = 'white'
}

Polygon.prototype = new Shape()

Polygon.prototype.getAxes = function () {
    var v1 = new Vector(),
        v2 = new Vector(),
        axes = []

    for (var i = 0; i < this.points.length - 1; i++) {
        v1.x = this.points[i].x
        v1.y = this.points[i].y

        v2.x = this.points[i + 1].x
        v2.y = this.points[i + 1].y

        axes.push(v1.edge(v2).normal())
    }

    v1.x = this.points[this.points.length - 1].x
    v1.y = this.points[this.points.length - 1].y

    v2.x = this.points[0].x
    v2.y = this.points[0].y

    axes.push(v1.edge(v2).normal())

    return axes
}

Polygon.prototype.project = function (axis) {
    var scalars = [],
        v = new Vector()

    this.points.forEach(function (point) {
        v.x = point.x
        v.y = point.y
        scalars.push(v.dotProduct(axis))
    })

    return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars))
}

Polygon.prototype.addPoint = function (x, y) {
    this.points.push(new Point(x, y))
}

Polygon.prototype.createPath = function (context) {
    if (this.points.length === 0) return

    context.beginPath()
    context.moveTo(this.points[0].x, this.points[0].y)

    for (var i = 0; i < this.points.length; ++i) {
        context.lineTo(this.points[i].x, this.points[i].y)
    }

    context.closePath()
}

Polygon.prototype.move = function (dx, dy) {
    var point, x
    for (var i = 0; i < this.points.length; ++i) {
        point = this.points[i]
        point.x += dx
        point.y += dy
    }
}

Polygon.prototype.move = function (dx, dy) {
    for (var i = 0, point; i < this.points.length; ++i) {
        point = this.points[i]
        point.x += dx
        point.y += dy
    }
}

var ImageShape = function (imageSource, x, y, w, h) {
    var self = this

    this.image = new Image()
    this.imageLoaded = false
    this.points = [new Point(x, y)]
    this.x = x
    this.y = y

    this.image.src = imageSource

    this.image.addEventListener(
        'load',
        function (e) {
            self.setPolygonPoints()
            self.imageLoaded = true
        },
        false
    )
}

ImageShape.prototype = new Polygon()

ImageShape.prototype.fill = function (context) {}

ImageShape.prototype.setPolygonPoints = function () {
    this.points.push(new Point(this.x + this.image.width, this.y))
    this.points.push(new Point(this.x + this.image.width, this.y + this.image.height))
    this.points.push(new Point(this.x, this.y + this.image.height))
}

ImageShape.prototype.drawImage = function (context) {
    context.drawImage(this.image, this.points[0].x, this.points[0].y)
}

ImageShape.prototype.stroke = function (context) {
    var self = this

    if (this.imageLoaded) {
        context.drawImage(this.image, this.points[0].x, this.points[0].y)
    } else {
        this.image.addEventListener(
            'load',
            function (e) {
                self.drawImage(context)
            },
            false
        )
    }
}

var SpriteShape = function (sprite, x, y) {
    this.sprite = sprite
    this.x = x
    this.y = y
    sprite.left = x
    sprite.top = y
    this.setPolygonPoints()
}

SpriteShape.prototype = new Polygon()

SpriteShape.prototype.move = function (dx, dy) {
    var point, x
    for (var i = 0; i < this.points.length; ++i) {
        point = this.points[i]
        point.x += dx
        point.y += dy
    }
    this.sprite.left = this.points[0].x
    this.sprite.top = this.points[0].y
}

SpriteShape.prototype.fill = function (context) {}

SpriteShape.prototype.setPolygonPoints = function () {
    this.points.push(new Point(this.x, this.y))
    this.points.push(new Point(this.x + this.sprite.width, this.y))
    this.points.push(new Point(this.x + this.sprite.width, this.y + this.sprite.height))
    this.points.push(new Point(this.x, this.y + this.sprite.height))
}

SpriteShape.prototype.stroke = function (context) {
    this.sprite.paint(context)
}

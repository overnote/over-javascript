var getTimeNow = function () {
    return +new Date()
}

// Game.......................................................................

// This game engine implements a game loop that draws sprites. See sprites.js.
//
// The game engine also has support for:
//
// Time-based motion (game.pixelsPerFrame())
// Pause (game.togglePaused())
// High Scores (game.setHighScore(), game.getHighScores(), game.clearHighScores())
// Sound (game.canPlaySound(), game.playSound())
// Accessing frame rate (game.fps)
// Accessing game time (game.gameTime)
// Key processing (game.addKeyListener())
//
// The game engine's animate() method invokes the following methods,
// in the order listed:
//
//     game.startAnimate()
//     game.paintUnderSprites()
//     game.paintOverSprites()
//     game.endAnimate()
//
// Those four methods are implemented by the game engine to do nothing.
// You override those do-nothing implementations to make the game come alive.

var Game = function (gameName, canvasId) {
    var canvas = document.getElementById(canvasId),
        self = this // Used by key event handlers below

    // General

    this.context = canvas.getContext('2d')
    this.gameName = gameName
    this.sprites = []
    this.keyListeners = []

    // High scores

    this.HIGH_SCORES_SUFFIX = '_highscores'

    // Image loading

    this.imageLoadingProgressCallback
    this.images = {}
    this.imageUrls = []
    this.imagesLoaded = 0
    this.imagesFailedToLoad = 0
    this.imagesIndex = 0

    // Time

    this.startTime = 0
    this.lastTime = 0
    this.gameTime = 0
    this.fps = 0
    this.STARTING_FPS = 60

    this.paused = false
    this.startedPauseAt = 0
    this.PAUSE_TIMEOUT = 100

    // Sound

    this.soundOn = true
    this.soundChannels = []
    this.audio = new Audio()
    this.NUM_SOUND_CHANNELS = 10

    for (var i = 0; i < this.NUM_SOUND_CHANNELS; ++i) {
        var audio = new Audio()
        this.soundChannels.push(audio)
    }

    // The this object in the following event handlers is the
    // DOM window, which is why the functions call
    // self.keyPressed() instead of this.keyPressed(e).

    window.onkeypress = function (e) {
        self.keyPressed(e)
    }
    window.onkeydown = function (e) {
        self.keyPressed(e)
    }

    return this
}

// Game methods...............................................................

Game.prototype = {
    // Given a URL, return the associated image

    getImage: function (imageUrl) {
        return this.images[imageUrl]
    },

    // This method is called by loadImage() when
    // an image loads successfully.

    imageLoadedCallback: function (e) {
        this.imagesLoaded++
    },

    // This method is called by loadImage() when
    // an image does not load successfully.

    imageLoadErrorCallback: function (e) {
        this.imagesFailedToLoad++
    },

    // Loads a particular image

    loadImage: function (imageUrl) {
        var image = new Image(),
            self = this // load and error event handlers called by DOMWindow

        image.src = imageUrl

        image.addEventListener('load', function (e) {
            self.imageLoadedCallback(e)
        })

        image.addEventListener('error', function (e) {
            self.imageLoadErrorCallback(e)
        })

        this.images[imageUrl] = image
    },

    // You call this method repeatedly to load images that have been
    // queued (by calling queueImage()). This method returns the
    // percent of the games images that have been processed. When
    // the method returns 100, all images are loaded, and you can
    // quit calling this method.

    loadImages: function () {
        // If there are images left to load

        if (this.imagesIndex < this.imageUrls.length) {
            this.loadImage(this.imageUrls[this.imagesIndex])
            this.imagesIndex++
        }

        // Return the percent complete

        return ((this.imagesLoaded + this.imagesFailedToLoad) / this.imageUrls.length) * 100
    },

    // Call this method to add an image to the queue. The image
    // will be loaded by loadImages().

    queueImage: function (imageUrl) {
        this.imageUrls.push(imageUrl)
    },

    // Game loop..................................................................

    // Starts the animation by invoking window.requestNextAnimationFrame().
    //
    // window.requestNextAnimationFrame() is a polyfill method implemented in
    // requestNextAnimationFrame.js. You pass requestNextAnimationFrame() a
    // reference to a function that the browser calls when it's time to draw
    // the next animation frame.
    //
    // When it's time to draw the next animation frame, the browser invokes
    // the function that you pass to requestNextAnimationFrame(). Because that
    // function is invoked by the browser (the window object, to be more exact),
    // the this variable in that function will be the window object. We want
    // the this variable to be the game instead, so we use JavaScript's built-in
    // call() function to call the function, with the game specified as the
    // this variable.

    start: function () {
        var self = this // The this variable is the game
        this.startTime = getTimeNow() // Record game's startTime (used for pausing)

        window.requestNextAnimationFrame(function (time) {
            // The this variable in this function is the window, not the game,
            // which is why we do not simply do this: animate.call(time).

            self.animate.call(self, time) // self is the game
        })
    },

    // Drives the game's animation. This method is called by the browser when
    // it's time for the next animation frame.
    //
    // If the game is paused, animate() reschedules another call to animate()
    // in PAUSE_TIMEOUT (100) ms.
    //
    // If the game is not paused, animate() paints the next animation frame and
    // reschedules another call to animate() when it's time to draw the
    // next animation frame.
    //
    // The implementations of this.startAnimate(), this.paintUnderSprites(),
    // this.paintOverSprites(), and this.endAnimate() do nothing. You override
    // those methods to create the animation frame.

    animate: function (time) {
        var self = this // window.requestNextAnimationFrame() called by DOMWindow

        if (this.paused) {
            // In PAUSE_TIMEOUT (100) ms, call this method again to see if the game
            // is still paused. There's no need to check more frequently.

            setTimeout(function () {
                window.requestNextAnimationFrame(function (time) {
                    self.animate.call(self, time)
                })
            }, this.PAUSE_TIMEOUT)
        } else {
            // Game is not paused
            this.tick(time) // Update fps, game time
            this.clearScreen() // Clear the screen in preparation for next frame

            this.startAnimate(time) // Override as you wish
            this.paintUnderSprites() // Override as you wish

            this.updateSprites(time) // Invoke sprite behaviors
            this.paintSprites(time) // Paint sprites in the canvas

            this.paintOverSprites() // Override as you wish
            this.endAnimate() // Override as you wish

            this.lastTime = time

            // Call this method again when it's time for the next animation frame

            window.requestNextAnimationFrame(function (time) {
                self.animate.call(self, time) // The this variable refers to the window
            })
        }
    },

    // Update the frame rate, game time, and the last time the application
    // drew an animation frame.

    tick: function (time) {
        this.updateFrameRate(time)
        this.gameTime = getTimeNow() - this.startTime
    },

    // Update the frame rate, based on the amount of time it took
    // for the last animation frame only.

    updateFrameRate: function (time) {
        if (this.lastTime === 0) this.fps = this.STARTING_FPS
        else this.fps = 1000 / (time - this.lastTime)
    },

    // Clear the entire canvas.

    clearScreen: function () {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    },

    // Update all sprites. The sprite update() method invokes all
    // of a sprite's behaviors.

    updateSprites: function (time) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var sprite = this.sprites[i]
            sprite.update(this.context, time)
        }
    },

    // Paint all visible sprites.

    paintSprites: function (time) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var sprite = this.sprites[i]
            if (sprite.visible) sprite.paint(this.context)
        }
    },

    // Toggle the paused state of the game. If, after
    // toggling, the paused state is unpaused, the
    // application subtracts the time spent during
    // the pause from the game's start time. That
    // means the game picks up where it left off,
    // without a potentially large jump in time.

    togglePaused: function () {
        var now = getTimeNow()

        this.paused = !this.paused

        if (this.paused) {
            this.startedPauseAt = now
        } else {
            // not paused
            // Adjust start time, so game starts where it left off when
            // the user paused it.

            this.startTime = this.startTime + now - this.startedPauseAt
            this.lastTime = now
        }
    },

    // Given a velocity of some object, calculate the number of pixels to
    // move that object for the current frame.

    pixelsPerFrame: function (time, velocity) {
        // Sprites move a certain amount of pixels per frame (pixels/frame).
        // This methods returns the amount of pixels a sprite should move
        // for a given frame. Sprite velocity is measured in pixels / second,
        // so: (pixels/second) * (second/frame) = pixels/frame:

        return velocity / this.fps // pixels / frame
    },

    // High scores................................................................

    // Returns an array of high scores from local storage.

    getHighScores: function () {
        var key = this.gameName + this.HIGH_SCORES_SUFFIX,
            highScoresString = localStorage[key]

        if (highScoresString == undefined) {
            localStorage[key] = JSON.stringify([])
        }
        return JSON.parse(localStorage[key])
    },

    // Sets the high score in local storage.

    setHighScore: function (highScore) {
        var key = this.gameName + this.HIGH_SCORES_SUFFIX,
            highScoresString = localStorage[key]

        highScores.unshift(highScore)
        localStorage[key] = JSON.stringify(highScores)
    },

    // Removes the high scores from local storage.

    clearHighScores: function () {
        localStorage[this.gameName + this.HIGH_SCORES_SUFFIX] = JSON.stringify([])
    },

    // Key listeners..............................................................

    // Add a (key, listener) pair to the keyListeners array.

    addKeyListener: function (keyAndListener) {
        this.keyListeners.push(keyAndListener)
    },

    // Given a key, return the associated listener.

    findKeyListener: function (key) {
        var listener = undefined

        for (var i = 0; i < this.keyListeners.length; ++i) {
            var keyAndListener = this.keyListeners[i],
                currentKey = keyAndListener.key
            if (currentKey === key) {
                listener = keyAndListener.listener
            }
        }
        return listener
    },

    // This method is the call back for key down and key press
    // events.

    keyPressed: function (e) {
        var listener = undefined,
            key = undefined

        switch (e.keyCode) {
            // Add more keys as needed

            case 32:
                key = 'space'
                break
            case 68:
                key = 'd'
                break
            case 75:
                key = 'k'
                break
            case 83:
                key = 's'
                break
            case 80:
                key = 'p'
                break
            case 37:
                key = 'left arrow'
                break
            case 39:
                key = 'right arrow'
                break
            case 38:
                key = 'up arrow'
                break
            case 40:
                key = 'down arrow'
                break
        }

        listener = this.findKeyListener(key)
        if (listener) {
            // listener is a function
            listener() // invoke the listener function
        }
    },

    // Sound......................................................................

    // Returns true if the browser can play sounds in the ogg file format.

    canPlayOggVorbis: function () {
        return '' != this.audio.canPlayType('audio/ogg; codecs="vorbis"')
    },

    // Returns true if the browser can play sounds in the mp3 file format.

    canPlayMp3: function () {
        return '' != this.audio.canPlayType('audio/mpeg')
    },

    // Returns the first available sound channel from the array of sound channels.

    getAvailableSoundChannel: function () {
        var audio

        for (var i = 0; i < this.NUM_SOUND_CHANNELS; ++i) {
            audio = this.soundChannels[i]

            if (audio.played.length === 0 || audio.ended) {
                return audio
            }
        }
        return undefined // all channels in use
    },

    // Given an identifier, play the associated sound.

    playSound: function (id) {
        var channel = this.getAvailableSoundChannel(),
            element = document.getElementById(id)

        if (channel && element) {
            channel.src = element.src === '' ? element.currentSrc : element.src
            channel.load()
            channel.play()
        }
    },

    // Sprites....................................................................

    // Add a sprite to the game. The game engine will update the sprite and
    // paint it (if it's visible) in the animate() method.

    addSprite: function (sprite) {
        this.sprites.push(sprite)
    },

    // It's probably a good idea not to access sprites directly, because
    // it's better to write generalized code that deals with all
    // sprites, so this method should be used sparingly.

    getSprite: function (name) {
        for (i in this.sprites) {
            if (this.sprites[i].name === name) return this.sprites[i]
        }
        return null
    },

    // Override the following methods as desired:

    startAnimate: function (time) {}, // These methods are called by
    paintUnderSprites: function () {}, // animate() in the order they
    paintOverSprites: function () {}, // are listed. Override them
    endAnimate: function () {}, // as you wish.
}

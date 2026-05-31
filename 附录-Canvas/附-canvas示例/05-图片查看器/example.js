var context = document.getElementById('canvas').getContext('2d'),
    image = new Image(),
    alphaSpan = document.getElementById('alphaSpan'),
    sizeSpan = document.getElementById('sizeSpan'),
    sizeSlider = new COREHTML5.Slider(
        'blue',
        'cornflowerblue',
        0.85, // knob percent
        90, // take up % of width
        50
    ), // take up % of height
    alphaSlider = new COREHTML5.Slider(
        'blue',
        'cornflowerblue',
        0.5, // knob percent
        90, // take up % of width
        50
    ), // take up % of height
    pan = new COREHTML5.Pan(context.canvas, image),
    e = pan.domElement,
    ALPHA_MAX = 1.0,
    SIZE_MAX = 12

// Event Handlers.....................................................

sizeSlider.addChangeListener(function (e) {
    var size = parseFloat(sizeSlider.knobPercent) * 12
    size = size < 2 ? 2 : size
    sizeSpan.innerHTML = size.toFixed(1) + '%'

    pan.imageContext.setTransform(1, 0, 0, 1, 0, 0) // identity matrix
    pan.viewportPercent = size

    pan.erase()
    pan.initialize()
    pan.draw()
})

alphaSlider.addChangeListener(function (e) {
    alphaSpan.innerHTML = parseFloat(alphaSlider.knobPercent * 100).toFixed(0) + '%'
    alphaSpan.style.opacity = parseFloat(alphaSlider.knobPercent)
    pan.panCanvasAlpha = alphaSlider.knobPercent
    pan.erase()
    pan.draw()
})

// Initialization....................................................

image.src = 'pencilsAndBrush.jpg'
document.getElementById('body').appendChild(e)
e.className = 'pan'

alphaSlider.appendTo('alphaSliderDiv')
sizeSlider.appendTo('sizeSliderDiv')

pan.viewportPercent = sizeSlider.knobPercent * SIZE_MAX
pan.panCanvasAlpha = alphaSlider.knobPercent * ALPHA_MAX

sizeSpan.innerHTML = pan.viewportPercent.toFixed(0) + '%'
alphaSpan.innerHTML = (pan.panCanvasAlpha * 100).toFixed(0) + '%'

alphaSlider.draw()
sizeSlider.draw()

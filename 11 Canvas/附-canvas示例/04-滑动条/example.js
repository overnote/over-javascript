var colorPatchContext = document.getElementById('colorPatchCanvas').getContext('2d'),
    redSlider = new COREHTML5.Slider('rgb(0,0,0)', 'rgba(255,0,0,0.8)', 0),
    blueSlider = new COREHTML5.Slider('rgb(0,0,0)', 'rgba(0,0,255,0.8)', 1.0),
    greenSlider = new COREHTML5.Slider('rgb(0,0,0)', 'rgba(0,255,0,0.8)', 0.25),
    alphaSlider = new COREHTML5.Slider('rgb(0,0,0)', 'rgba(255,255,255,0.8)', 0.5)

redSlider.appendTo('redSliderDiv')
blueSlider.appendTo('blueSliderDiv')
greenSlider.appendTo('greenSliderDiv')
alphaSlider.appendTo('alphaSliderDiv')

// Functions..........................................................

function updateColor() {
    var alpha = new Number(alphaSlider.knobPercent.toFixed(2))
    var color =
        'rgba(' +
        parseInt(redSlider.knobPercent * 255) +
        ',' +
        parseInt(greenSlider.knobPercent * 255) +
        ',' +
        parseInt(blueSlider.knobPercent * 255) +
        ',' +
        alpha +
        ')'

    colorPatchContext.fillStyle = color

    colorPatchContext.clearRect(0, 0, colorPatchContext.canvas.width, colorPatchContext.canvas.height)

    colorPatchContext.fillRect(0, 0, colorPatchContext.canvas.width, colorPatchContext.canvas.height)

    colorPatchContext.font = '18px Arial'
    colorPatchContext.fillStyle = 'white'
    colorPatchContext.fillText(color, 10, 40)

    alpha = alpha + 0.2 > 1.0 ? 1.0 : alpha + 0.2
    alphaSlider.opacity = alpha
}

// Event Handlers.....................................................

redSlider.addChangeListener(function () {
    updateColor()
    redSlider.fillStyle = 'rgb(' + (redSlider.knobPercent * 255).toFixed(0) + ', 0, 0)'
})

greenSlider.addChangeListener(function () {
    updateColor()
    greenSlider.fillStyle = 'rgb(0, ' + (greenSlider.knobPercent * 255).toFixed(0) + ', 0)'
})

blueSlider.addChangeListener(function () {
    updateColor()
    blueSlider.fillStyle = 'rgb(0, 0, ' + (blueSlider.knobPercent * 255).toFixed(0) + ')'
})

alphaSlider.addChangeListener(function () {
    updateColor()
    alphaSlider.fillStyle = 'rgba(255, 255, 255, ' + (alphaSlider.knobPercent * 255).toFixed(0) + ')'

    alphaSlider.opacity = alphaSlider.knobPercent
})

// Initialization.....................................................

redSlider.fillStyle = 'rgb(' + (redSlider.knobPercent * 255).toFixed(0) + ', 0, 0)'

greenSlider.fillStyle = 'rgb(0, ' + (greenSlider.knobPercent * 255).toFixed(0) + ', 0)'

blueSlider.fillStyle = 'rgb(0, 0, ' + (blueSlider.knobPercent * 255).toFixed(0) + ')'

alphaSlider.fillStyle = 'rgba(255, 255, 255, ' + (alphaSlider.knobPercent * 255).toFixed(0) + ')'

alphaSlider.opacity = alphaSlider.knobPercent

alphaSlider.draw()
redSlider.draw()
greenSlider.draw()
blueSlider.draw()

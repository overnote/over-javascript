var widthRange = document.getElementById('widthRange'),
    heightRange = document.getElementById('heightRange'),
    roundedRectangle = new COREHTML5.RoundedRectangle(
        'rgba(0, 0, 0, 0.2)',
        'darkgoldenrod',
        widthRange.value,
        heightRange.value
    )

function resize() {
    roundedRectangle.horizontalSizePercent = widthRange.value / 100
    roundedRectangle.verticalSizePercent = heightRange.value / 100

    roundedRectangle.resize(roundedRectangle.domElement.offsetWidth, roundedRectangle.domElement.offsetHeight)

    roundedRectangle.erase()
    roundedRectangle.draw()
}

widthRange.onchange = resize
heightRange.onchange = resize

roundedRectangle.appendTo(document.getElementById('roundedRectangleDiv'))
roundedRectangle.draw()

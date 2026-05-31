var startButton = document.getElementById('startButton'),
    loadingSpan = document.getElementById('loadingSpan'),
    progressbar = new COREHTML5.Progressbar('rgba(0, 0, 0, 0.2)', 'teal', 90, 70),
    percentComplete = 0

progressbar.appendTo(document.getElementById('progressbarDiv'))

startButton.onclick = function (e) {
    loadingSpan.style.display = 'inline'
    startButton.style.display = 'none'

    percentComplete += 1.0

    if (percentComplete > 100) {
        percentComplete = 0
        loadingSpan.style.display = 'none'
        startButton.style.display = 'inline'
    } else {
        progressbar.erase()
        progressbar.draw(percentComplete)
        requestNextAnimationFrame(startButton.onclick)
    }
}

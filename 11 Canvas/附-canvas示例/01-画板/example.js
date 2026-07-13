
var iconCanvas = document.getElementById('iconCanvas'),
    drawingCanvas = document.getElementById('drawingCanvas'),
    drawingContext = drawingCanvas.getContext('2d'),
    backgroundContext = document.createElement('canvas').getContext('2d'),
    iconContext = iconCanvas.getContext('2d'),
    strokeStyleSelect = document.getElementById('strokeStyleSelect'),
    fillStyleSelect = document.getElementById('fillStyleSelect'),
    lineWidthSelect = document.getElementById('lineWidthSelect'),
    eraseAllButton = document.getElementById('eraseAllButton'),
    snapshotButton = document.getElementById('snapshotButton'),
    controls = document.getElementById('controls'),
    curveInstructions = document.getElementById('curveInstructions'),
    curveInstructionsOkayButton = document.getElementById('curveInstructionsOkayButton'),
    curveInstructionsNoMoreButton = document.getElementById('curveInstructionsNoMoreButton'),

    showCurveInstructions = true,
   
    drawingSurfaceImageData,
    rubberbandW,
    rubberbandH,
    rubberbandUlhc = {},

    dragging = false,
    mousedown = {},
    lastRect = {},
    lastX, lastY,

    controlPoint = {},
    editingCurve = false,
    draggingControlPoint = false,
    curveStart = {},
    curveEnd = {},
   
    doFill = false,
    selectedRect = null,
    selectedFunction,

    editingText = false,
    currentText,

    CONTROL_POINT_RADIUS = 20,
    CONTROL_POINT_FILL_STYLE = 'rgba(255,255,0,0.5)',
    CONTROL_POINT_STROKE_STYLE = 'rgba(0, 0, 255, 0.8)',
   
    RUBBERBAND_LINE_WIDTH = 1,
    RUBBERBAND_STROKE_STYLE = 'green',

    GRID_HORIZONTAL_SPACING = 10,
    GRID_VERTICAL_SPACING = 10,
    GRID_LINE_COLOR = 'rgb(0, 0, 200)',

    ERASER_ICON_GRID_COLOR = 'rgb(0, 0, 200)',
    ERASER_ICON_CIRCLE_COLOR = 'rgba(100, 140, 200, 0.5)',
    ERASER_ICON_RADIUS = 20,

    SLINKY_LINE_WIDTH = 1,
    SLINKY_SHADOW_STYLE = 'rgba(0,0,0,0.2)',
    SLINKY_SHADOW_OFFSET = -5,
    SLINKY_SHADOW_BLUR = 20,
    SLINKY_RADIUS = 60,

    ERASER_LINE_WIDTH = 1,
    ERASER_SHADOW_STYLE = 'blue',
    ERASER_STROKE_STYLE = 'rgba(0,0,255,0.6)',
    ERASER_SHADOW_OFFSET = -5,
    ERASER_SHADOW_BLUR = 20,
    ERASER_RADIUS = 40,

    SHADOW_COLOR = 'rgba(0,0,0,0.7)',

    ICON_BACKGROUND_STYLE = '#eeeeee',
    ICON_BORDER_STROKE_STYLE = 'rgba(100, 140, 230, 0.5)',
    ICON_STROKE_STYLE = 'rgb(100, 140, 230)',
    ICON_FILL_STYLE = '#dddddd',

    TEXT_ICON_FILL_STYLE = 'rgba(100, 140, 230, 0.5)',
    TEXT_ICON_TEXT = 'T',

    CIRCLE_ICON_RADIUS = 20,

    ICON_RECTANGLES = [
       { x: 13.5, y: 18.5, w: 48, h: 48 },
       { x: 13.5, y: 78.5, w: 48, h: 48 },
       { x: 13.5, y: 138.5, w: 48, h: 48 },
       { x: 13.5, y: 198.5, w: 48, h: 48 },
       { x: 13.5, y: 258.5, w: 48, h: 48 },
       { x: 13.5, y: 318.5, w: 48, h: 48 },
       { x: 13.5, y: 378.5, w: 48, h: 48 },
       { x: 13.5, y: 438.5, w: 48, h: 48 },
       { x: 13.5, y: 508.5, w: 48, h: 48 }
    ],

   LINE_ICON = 0,
   RECTANGLE_ICON = 1,
   CIRCLE_ICON = 2,
   OPEN_PATH_ICON = 3,
   CLOSED_PATH_ICON = 4,
   CURVE_ICON = 5,
   TEXT_ICON = 6,
   SLINKY_ICON = 7,
   ERASER_ICON = 8;

// Grid..........................................................

function drawGrid(context, color, stepx, stepy) {
   context.save()

   context.strokeStyle = color;
   context.fillStyle = '#ffffff';
   context.lineWidth = 0.5;
   context.fillRect(0, 0, context.canvas.width, context.canvas.height);
   context.globalAlpha = 0.1;

   context.beginPath();
   for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
     context.moveTo(i, 0);
     context.lineTo(i, context.canvas.height);
   }
   context.stroke();

   context.beginPath();
   for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
     context.moveTo(0, i);
     context.lineTo(context.canvas.width, i);
   }
   context.stroke();

   context.restore();
}

// Icons.........................................................

function drawLineIcon(rect) {
   iconContext.beginPath();
   iconContext.moveTo(rect.x + 5, rect.y + 5);
   iconContext.lineTo(rect.x + rect.w - 5, rect.y + rect.h - 5);
   iconContext.stroke();
}

function drawRectIcon(rect) {
   fillIconLowerRight(rect);
   iconContext.strokeRect(rect.x + 5, rect.y + 5,
                          rect.w - 10, rect.h - 10); 
}

function drawCircleIcon(rect) {
   var startAngle = 3*Math.PI/4,
       endAngle = 7*Math.PI/4,
       center = {x: rect.x + rect.w/2, y: rect.y + rect.h/2 };

   fillIconLowerRight(rect);

   iconContext.beginPath();
   iconContext.arc(rect.x + rect.w/2, rect.y + rect.h/2,
                   CIRCLE_ICON_RADIUS, 0, Math.PI*2, false);
   iconContext.stroke();
}

function drawOpenPathIcon(rect) {
   iconContext.beginPath();
   drawOpenPathIconLines(rect);
   iconContext.stroke();
}

function drawClosedPathIcon(rect) {
   fillIconLowerRight(rect);
   iconContext.beginPath();
   drawOpenPathIconLines(rect);
   iconContext.closePath();
   iconContext.stroke();
}

function drawCurveIcon(rect) {
   fillIconLowerRight(rect);
   iconContext.beginPath();
   iconContext.beginPath();
   iconContext.moveTo(rect.x + rect.w - 10, rect.y + 5);
   iconContext.quadraticCurveTo(rect.x - 10, rect.y,
                                rect.x + rect.w - 10,
                                rect.y + rect.h - 5);
   iconContext.stroke();
}

function drawTextIcon(rect) {
   var text = TEXT_ICON_TEXT;
   
   fillIconLowerRight(rect);
   iconContext.fillStyle = TEXT_ICON_FILL_STYLE;
   iconContext.fillText(text, rect.x + rect.w/2,
                              rect.y + rect.h/2 + 5);
   iconContext.strokeText(text, rect.x + rect.w/2,
                                rect.y + rect.h/2 + 5);
}

function drawSlinkyIcon(rect) {
   var x, y;
   
   fillIconLowerRight(rect);

   iconContext.save();
   iconContext.strokeStyle = 'rgba(100, 140, 230, 0.6)';

   for (var i=-2; i < rect.w/3 + 2; i+=1.5) {
      if (i < rect.w/6) x = rect.x + rect.w/3 + i + rect.w/8;
      else              x = rect.x + rect.w/3 + (rect.w/3 - i) + rect.w/8;

      y = rect.y + rect.w/3 + i;
      
      iconContext.beginPath();
      iconContext.arc(x, y, 12, 0, Math.PI*2, false);
      iconContext.stroke();
   }
   iconContext.restore();
}

function drawEraserIcon(rect) {
   var rect = ICON_RECTANGLES[ERASER_ICON];
   iconContext.save();

   iconContext.beginPath();
   iconContext.arc(rect.x + rect.w/2,
                   rect.y + rect.h/2,
                   ERASER_ICON_RADIUS, 0, Math.PI*2, false);

   iconContext.strokeStyle = ERASER_ICON_CIRCLE_COLOR;
   iconContext.stroke();

   iconContext.clip(); // restrict drawGrid() to the circle

   drawGrid(iconContext, ERASER_ICON_GRID_COLOR, 5, 5);

   iconContext.restore();
}

function drawIcon(rect) {
   iconContext.save();

   iconContext.strokeStyle = ICON_BORDER_STROKE_STYLE;
   iconContext.strokeRect(rect.x, rect.y, rect.w, rect.h);
   iconContext.strokeStyle = ICON_STROKE_STYLE;
   
   if (rect.y === ICON_RECTANGLES[LINE_ICON].y)             drawLineIcon(rect);
   else if (rect.y === ICON_RECTANGLES[RECTANGLE_ICON].y)   drawRectIcon(rect);
   else if (rect.y === ICON_RECTANGLES[CIRCLE_ICON].y)      drawCircleIcon(rect);
   else if (rect.y === ICON_RECTANGLES[OPEN_PATH_ICON].y)   drawOpenPathIcon(rect);
   else if (rect.y === ICON_RECTANGLES[CLOSED_PATH_ICON].y) drawClosedPathIcon(rect, 20);
   else if (rect.y === ICON_RECTANGLES[TEXT_ICON].y)        drawTextIcon(rect);
   else if (rect.y === ICON_RECTANGLES[CURVE_ICON].y)       drawCurveIcon(rect);
   else if (rect.y === ICON_RECTANGLES[ERASER_ICON].y)      drawEraserIcon(rect);
   else if (rect.y === ICON_RECTANGLES[SLINKY_ICON].y)      drawSlinkyIcon(rect);

   iconContext.restore();
}

function drawIcons() {
   iconContext.clearRect(0,0, iconCanvas.width,
                              iconCanvas.height);
   
   ICON_RECTANGLES.forEach(function(rect) {
      iconContext.save();

      if (selectedRect === rect) setSelectedIconShadow();
      else                       setIconShadow();

      iconContext.fillStyle = ICON_BACKGROUND_STYLE;
      iconContext.fillRect(rect.x, rect.y, rect.w, rect.h);

      iconContext.restore();

      drawIcon(rect);
   });
}

function drawOpenPathIconLines(rect) {
   iconContext.lineTo(rect.x + 13, rect.y + 19);
   iconContext.lineTo(rect.x + 15, rect.y + 17);
   iconContext.lineTo(rect.x + 25, rect.y + 12);
   iconContext.lineTo(rect.x + 35, rect.y + 13);
   iconContext.lineTo(rect.x + 38, rect.y + 15);
   iconContext.lineTo(rect.x + 40, rect.y + 17);
   iconContext.lineTo(rect.x + 39, rect.y + 23);
   iconContext.lineTo(rect.x + 36, rect.y + 25);
   iconContext.lineTo(rect.x + 32, rect.y + 27);
   iconContext.lineTo(rect.x + 28, rect.y + 29);
   iconContext.lineTo(rect.x + 26, rect.y + 31);
   iconContext.lineTo(rect.x + 24, rect.y + 33);
   iconContext.lineTo(rect.x + 22, rect.y + 35);
   iconContext.lineTo(rect.x + 20, rect.y + 37);
   iconContext.lineTo(rect.x + 18, rect.y + 39);
   iconContext.lineTo(rect.x + 16, rect.y + 39);
   iconContext.lineTo(rect.x + 13, rect.y + 36);
   iconContext.lineTo(rect.x + 11, rect.y + 34);
}

function fillIconLowerRight(rect) {
   iconContext.beginPath();
   iconContext.moveTo(rect.x + rect.w, rect.y);
   iconContext.lineTo(rect.x + rect.w, rect.y + rect.h);
   iconContext.lineTo(rect.x, rect.y + rect.h);
   iconContext.closePath();
   iconContext.fill();
}

function isPointInIconLowerRight(rect, x, y) {
   iconContext.beginPath();   
   iconContext.moveTo(rect.x + rect.w, rect.y);
   iconContext.lineTo(rect.x + rect.w, rect.y + rect.h);
   iconContext.lineTo(rect.x, rect.y + rect.h);
            
   return iconContext.isPointInPath(x, y);
}

function getIconFunction(rect, loc) {
   var action;

   if (rect.y === ICON_RECTANGLES[LINE_ICON].y)             action = 'line';
   else if (rect.y === ICON_RECTANGLES[RECTANGLE_ICON].y)   action = 'rectangle';
   else if (rect.y === ICON_RECTANGLES[CIRCLE_ICON].y)      action = 'circle';
   else if (rect.y === ICON_RECTANGLES[OPEN_PATH_ICON].y)   action = 'path';
   else if (rect.y === ICON_RECTANGLES[CLOSED_PATH_ICON].y) action = 'pathClosed';
   else if (rect.y === ICON_RECTANGLES[CURVE_ICON].y)       action = 'curve';
   else if (rect.y === ICON_RECTANGLES[TEXT_ICON].y)        action = 'text';
   else if (rect.y === ICON_RECTANGLES[SLINKY_ICON].y)      action = 'slinky';
   else if (rect.y === ICON_RECTANGLES[ERASER_ICON].y)      action = 'erase';

   if (action === 'rectangle'  || action === 'circle' ||
       action === 'pathClosed' || action === 'text'   ||
       action === 'curve'      || action === 'slinky') {
      doFill = isPointInIconLowerRight(rect, loc.x, loc.y);
   }

   return action;
}

function setIconShadow() {
   iconContext.shadowColor = SHADOW_COLOR;
   iconContext.shadowOffsetX = 1;
   iconContext.shadowOffsetY = 1;
   iconContext.shadowBlur = 2;
}

function setSelectedIconShadow() {
   iconContext.shadowColor = SHADOW_COLOR;
   iconContext.shadowOffsetX = 4;
   iconContext.shadowOffsetY = 4;
   iconContext.shadowBlur = 5;
}

function selectIcon(rect) {
   selectedRect = rect;
   drawIcons();
}

// Saving/Restoring the drawing surface..........................

function saveDrawingSurface() {
   drawingSurfaceImageData = drawingContext.getImageData(0, 0,
                             drawingCanvas.width,
                             drawingCanvas.height);
}

function restoreDrawingSurface() {
   drawingContext.putImageData(drawingSurfaceImageData, 0, 0);
}

// Rubberbands...................................................

function updateRubberbandRectangle(loc) {
   rubberbandW = Math.abs(loc.x - mousedown.x);
   rubberbandH = Math.abs(loc.y - mousedown.y);

   if (loc.x > mousedown.x) rubberbandUlhc.x = mousedown.x;
   else                     rubberbandUlhc.x = loc.x;

   if (loc.y > mousedown.y) rubberbandUlhc.y = mousedown.y;
   else                     rubberbandUlhc.y = loc.y;
} 

function drawRubberbandRectangle() {
   drawingContext.strokeRect(rubberbandUlhc.x,
                             rubberbandUlhc.y,
                             rubberbandW, rubberbandH); 
}

function drawRubberbandLine(loc) {
   drawingContext.beginPath();
   drawingContext.moveTo(mousedown.x, mousedown.y);
   drawingContext.lineTo(loc.x, loc.y);
   drawingContext.stroke();
}

function drawRubberbandCircle(loc) {
   var angle = Math.atan(rubberbandH/rubberbandW);
   var radius = rubberbandH / Math.sin(angle);
   
   if (mousedown.y === loc.y) {
      radius = Math.abs(loc.x - mousedown.x); 
   }

   drawingContext.beginPath();
   drawingContext.arc(mousedown.x, mousedown.y, radius, 0, Math.PI*2, false); 
   drawingContext.stroke();
}

function drawRubberband(loc) {
   drawingContext.save();

   drawingContext.strokeStyle = RUBBERBAND_STROKE_STYLE;
   drawingContext.lineWidth   = RUBBERBAND_LINE_WIDTH;
   
   if (selectedFunction === 'rectangle') {
      drawRubberbandRectangle();
   }
   else if (selectedFunction === 'line' ||
            selectedFunction === 'curve') {
      drawRubberbandLine(loc);
   }
   else if (selectedFunction === 'circle') { 
      drawRubberbandCircle(loc);
   }

   drawingContext.restore();
}

// Eraser........................................................

function setPathForEraser() {
   drawingContext.beginPath();
   drawingContext.moveTo(lastX, lastY);
   drawingContext.arc(lastX, lastY,
                      ERASER_RADIUS + ERASER_LINE_WIDTH,
                      0, Math.PI*2, false);
}

function setSlinkyAttributes() {
  drawingContext.lineWidth     = lineWidthSelect.value;
  drawingContext.shadowColor   = strokeStyleSelect.value;
  drawingContext.shadowOffsetX = SLINKY_SHADOW_OFFSET; 
  drawingContext.shadowOffsetY = SLINKY_SHADOW_OFFSET;
  drawingContext.shadowBlur    = SLINKY_SHADOW_BLUR;
  drawingContext.strokeStyle   = strokeStyleSelect.value;
}

function setEraserAttributes() {
  drawingContext.lineWidth     = ERASER_LINE_WIDTH;
  drawingContext.shadowColor   = ERASER_SHADOW_STYLE;
  drawingContext.shadowOffsetX = ERASER_SHADOW_OFFSET; 
  drawingContext.shadowOffsetY = ERASER_SHADOW_OFFSET;
  drawingContext.shadowBlur    = ERASER_SHADOW_BLUR;
  drawingContext.strokeStyle   = ERASER_STROKE_STYLE;
}

function eraseLast() {
   var x = lastX - ERASER_RADIUS-ERASER_LINE_WIDTH,
       y = lastY - ERASER_RADIUS-ERASER_LINE_WIDTH,
       w = ERASER_RADIUS*2+ERASER_LINE_WIDTH*2,
       h = w,
       cw = drawingContext.canvas.width,
       ch = drawingContext.canvas.height;

   drawingContext.save();

   setPathForEraser();
   drawingContext.clip();

      if (x + w > cw) w = cw - x;
      if (y + h > ch) h = ch - y;

      if (x < 0) { x = 0; }
      if (y < 0) { y = 0; }

      drawingContext.drawImage(
         backgroundContext.canvas, x, y, w, h, x, y, w, h);

   drawingContext.restore();
}

function drawEraser(loc) {
   drawingContext.save();
   setEraserAttributes();     

   drawingContext.beginPath();
   drawingContext.arc(loc.x, loc.y, ERASER_RADIUS,
                      0, Math.PI*2, false);
   drawingContext.clip();
   drawingContext.stroke();

   drawingContext.restore();
}

function drawSlinky(loc) {
   drawingContext.save();
   setSlinkyAttributes();     

   drawingContext.beginPath();
   drawingContext.arc(loc.x, loc.y, ERASER_RADIUS,
                      0, Math.PI*2, false);
   drawingContext.clip();

   drawingContext.strokeStyle = strokeStyleSelect.value;
   drawingContext.stroke();

   if (doFill) {
      drawingContext.shadowColor = undefined;
      drawingContext.shadowOffsetX = 0;
      drawingContext.globalAlpha = 0.2;
      drawingContext.fill();
   }
   drawingContext.restore();
}

// Finish drawing lines, circles, and rectangles.................

function finishDrawingLine(loc) {   
   drawingContext.beginPath();
   drawingContext.moveTo(mousedown.x, mousedown.y);
   drawingContext.lineTo(loc.x, loc.y);
   drawingContext.stroke();
}

function finishDrawingCircle(loc) {
   var angle = Math.atan(rubberbandH/rubberbandW),
       radius = rubberbandH / Math.sin(angle);
   
   if (mousedown.y === loc.y) {
      radius = Math.abs(loc.x - mousedown.x); 
   }

   drawingContext.beginPath();
   drawingContext.arc(mousedown.x, mousedown.y,
                      radius, 0, Math.PI*2, false); 

   if (doFill) {
      drawingContext.fill();
   }

   drawingContext.stroke();
}

function finishDrawingRectangle() {
   if (rubberbandW > 0 && rubberbandH > 0) {
      if (doFill) {
        drawingContext.fillRect(rubberbandUlhc.x,
                                rubberbandUlhc.y,
                                rubberbandW, rubberbandH) 
      }
      drawingContext.strokeRect(rubberbandUlhc.x,
                                rubberbandUlhc.y,
                                rubberbandW, rubberbandH); 
   }
}

// Drawing curves................................................

function drawControlPoint() {
   drawingContext.save();

   drawingContext.strokeStyle = CONTROL_POINT_STROKE_STYLE;
   drawingContext.fillStyle   = CONTROL_POINT_FILL_STYLE;
   drawingContext.lineWidth   = 1.0;

   drawingContext.beginPath();
   drawingContext.arc(controlPoint.x, controlPoint.y,
                      CONTROL_POINT_RADIUS, 0, Math.PI*2, false);
   drawingContext.stroke(); 
   drawingContext.fill();

   drawingContext.restore();
}

function startEditingCurve(loc) {
   if (loc.x != mousedown.x || loc.y != mousedown.y) {
      drawingCanvas.style.cursor = 'pointer';

      curveStart.x = mousedown.x;
      curveStart.y = mousedown.y;

      curveEnd.x = loc.x;
      curveEnd.y = loc.y;

      controlPoint.x = (curveStart.x + curveEnd.x)/2;
      controlPoint.y = (curveStart.y + curveEnd.y)/2;

      drawControlPoint();

      editingCurve = true;

      if (showCurveInstructions)
         curveInstructions.style.display = 'inline';
   }
}

function drawCurve() {
   drawingContext.beginPath();
   drawingContext.moveTo(curveStart.x, curveStart.y);
   drawingContext.quadraticCurveTo(controlPoint.x, controlPoint.y,
                                   curveEnd.x, curveEnd.y);
   drawingContext.stroke();
}

function finishDrawingCurve() {
   drawingCanvas.style.cursor = 'crosshair';
   restoreDrawingSurface();
   drawCurve(); 

   if (doFill) {
      drawingContext.fill();
   }
}

// Guidewires....................................................

function drawHorizontalLine (y) {
   drawingContext.beginPath();
   drawingContext.moveTo(0, y+0.5);
   drawingContext.lineTo(drawingCanvas.width, y+0.5);
   drawingContext.stroke();
}

function drawVerticalLine (x) {
   drawingContext.beginPath();
   drawingContext.moveTo(x+0.5, 0);
   drawingContext.lineTo(x+0.5, drawingCanvas.height);
   drawingContext.stroke();
}

function drawGuidewires(x, y) {
   drawingContext.save();
   drawingContext.strokeStyle = 'rgba(0,0,230,0.4)';
   drawingContext.lineWidth = 0.5;
   drawVerticalLine(x);
   drawHorizontalLine(y);
   drawingContext.restore();
}

// Event handling functions......................................

function windowToCanvas(canvas, x, y) {
   var bbox = canvas.getBoundingClientRect();
   return { x: x - bbox.left * (canvas.width  / bbox.width),
            y: y - bbox.top  * (canvas.height / bbox.height)
          };
}

function mouseDownOrTouchStartInControlCanvas(loc) {
   if (editingText) {
      editingText = false;
      eraseTextCursor();
      hideKeyboard();
   }
   else if (editingCurve) {
      editingCurve = false;
      restoreDrawingSurface();
   }
  
   ICON_RECTANGLES.forEach(function(rect) {
      iconContext.beginPath();

      iconContext.rect(rect.x, rect.y, rect.w, rect.h);
      if (iconContext.isPointInPath(loc.x, loc.y)) {
         selectIcon(rect, loc);
         selectedFunction = getIconFunction(rect, loc);

         if (selectedFunction === 'text') {
            drawingCanvas.style.cursor = 'text';
         }
         else {
            drawingCanvas.style.cursor = 'crosshair';
         }
      }
   });
};

// Key event handlers............................................

function backspace() {
   restoreDrawingSurface();
   currentText = currentText.slice(0, -1);
   eraseTextCursor();
};

function enter() {
   finishDrawingText();
   mousedown.y += drawingContext.measureText('W').width;
   saveDrawingSurface();
   startDrawingText();
};

function insert(key) {
   currentText += key;
   restoreDrawingSurface();
   drawCurrentText();
   drawTextCursor();
};

document.onkeydown = function (e) {
   if (e.ctrlKey || e.metaKey || e.altKey)
      return;
   
   if (e.keyCode === 8) {  // backspace
      e.preventDefault();
      backspace();
   }
   else if (e.keyCode === 13) { // enter
      e.preventDefault();
      enter();
   }
}
   
document.onkeypress = function (e) {
   var key = String.fromCharCode(e.which);

   if (e.ctrlKey || e.metaKey || e.altKey)
      return;
   
   if (editingText && e.keyCode !== 8) {
      e.preventDefault();
      insert(key);
   }
}

function eraseTextCursor() {
   restoreDrawingSurface();
   drawCurrentText();
}

function drawCurrentText() {
   if (doFill)
      drawingContext.fillText(currentText, mousedown.x, mousedown.y);

   drawingContext.strokeText(currentText, mousedown.x, mousedown.y);
}

function drawTextCursor() {
  var widthMetric = drawingContext.measureText(currentText),
      heightMetric = drawingContext.measureText('W'),
      cursorLoc = {
        x: mousedown.x + widthMetric.width,
        y: mousedown.y - heightMetric.width + 5
      };

   drawingContext.beginPath();
   drawingContext.moveTo(cursorLoc.x, cursorLoc.y);
   drawingContext.lineTo(cursorLoc.x, cursorLoc.y + heightMetric.width - 12);
   drawingContext.stroke();
}

function startDrawingText() {
   editingText = true; 
   currentText = '';
   drawTextCursor();
   showKeyboard();
}

function finishDrawingText() {
   restoreDrawingSurface();
   drawCurrentText();
}

function mouseDownOrTouchStartInDrawingCanvas(loc) {
   dragging = true;

   if (editingText) {
      finishDrawingText();
   }
   else if (editingCurve) {
      if (drawingContext.isPointInPath(loc.x, loc.y)) {
         draggingControlPoint = true;
      }
      else {
         restoreDrawingSurface();
      }
      editingCurve = false;
   }

   if (!draggingControlPoint) {
      saveDrawingSurface();
      mousedown.x = loc.x;
      mousedown.y = loc.y;
   
      if (selectedFunction === 'path' || selectedFunction === 'pathClosed') {
         drawingContext.beginPath();
         drawingContext.moveTo(loc.x, loc.y);               
      }
      else if (selectedFunction === 'text') {
         startDrawingText();
      }
      else {
         editingText = false;
      }      

      lastX = loc.x;
      lastY = loc.y;
   }
}

function moveControlPoint(loc) {
   controlPoint.x = loc.x;
   controlPoint.y = loc.y;
}

function mouseMoveOrTouchMoveInDrawingCanvas(loc) {
   if (draggingControlPoint) {
      restoreDrawingSurface();

      moveControlPoint(loc);

      drawingContext.save();

      drawingContext.strokeStyle = RUBBERBAND_STROKE_STYLE;
      drawingContext.lineWidth = RUBBERBAND_LINE_WIDTH;

      drawCurve();
      drawControlPoint();

      drawingContext.restore();
   }
   else if (dragging) {
      if (selectedFunction === 'erase') {
         eraseLast();
         drawEraser(loc);
      }
      else if (selectedFunction === 'slinky') {
         drawSlinky(loc);
      }
      else if (selectedFunction === 'path' ||
               selectedFunction === 'pathClosed') {
         drawingContext.lineTo(loc.x, loc.y);
         drawingContext.stroke();
      }
      else { // For lines, circles, rectangles, and curves, draw rubberbands
         restoreDrawingSurface();
         updateRubberbandRectangle(loc);
         drawRubberband(loc);   
      }

      lastX = loc.x;
      lastY = loc.y;
   
      lastRect.w = rubberbandW;
      lastRect.h = rubberbandH;
   }

   if (dragging || draggingControlPoint) {
       if (selectedFunction === 'line' ||
           selectedFunction === 'rectangle' ||
           selectedFunction === 'circle') {
         drawGuidewires(loc.x, loc.y);
      }
   }
};

function endPath(loc) {
   drawingContext.lineTo(loc.x, loc.y);
   drawingContext.stroke();
                 
   if (selectedFunction === 'pathClosed') {
      drawingContext.closePath();

      if (doFill) {
         drawingContext.fill();
      }
      drawingContext.stroke();
   }
}

function mouseUpOrTouchEndInDrawingCanvas(loc) {
   if (selectedFunction !== 'erase' && selectedFunction !== 'slinky') {
      restoreDrawingSurface();
   }

   if (draggingControlPoint) {
      moveControlPoint(loc);
      finishDrawingCurve();
      draggingControlPoint = false;
   }
   else if (dragging) {
      if (selectedFunction === 'erase') { 
         eraseLast(); 
      }
      else if (selectedFunction === 'path' ||
               selectedFunction === 'pathClosed') { 
         endPath(loc);
      }
      else {
         if (selectedFunction === 'line')           finishDrawingLine(loc);
         else if (selectedFunction === 'rectangle') finishDrawingRectangle();
         else if (selectedFunction === 'circle')    finishDrawingCircle(loc);
         else if (selectedFunction === 'curve')     startEditingCurve(loc);
     }
   }
   dragging = false;
};

// Control canvas event handlers.................................

iconCanvas.onmousedown = function (e) {
   var x = e.x || e.clientX,
       y = e.y || e.clientY,
     loc = windowToCanvas(iconCanvas, x, y);

   e.preventDefault();
   mouseDownOrTouchStartInControlCanvas(loc);
}
   
iconCanvas.addEventListener('touchstart', function (e) {
   if (e.touches.length === 1) {
      e.preventDefault();
      mouseDownOrTouchStartInControlCanvas(
         windowToCanvas(iconCanvas,
            e.touches[0].clientX, e.touches[0].clientY));
   }
});

// Drawing canvas event handlers.................................

drawingCanvas.onmousedown = function (e) {
   var x = e.x || e.clientX,
       y = e.y || e.clientY;

   e.preventDefault();
   mouseDownOrTouchStartInDrawingCanvas(
      windowToCanvas(drawingCanvas, x, y));
}

drawingCanvas.ontouchstart = function (e) { 
   if (e.touches.length === 1) {
      e.preventDefault();
      mouseDownOrTouchStartInDrawingCanvas(
         windowToCanvas(drawingCanvas,
            e.touches[0].clientX, e.touches[0].clientY));
   }
}

drawingCanvas.ontouchmove = function (e) { 
   if (e.touches.length === 1) {
      mouseMoveOrTouchMoveInDrawingCanvas(
         windowToCanvas(drawingCanvas,
            e.touches[0].clientX, e.touches[0].clientY));
   }
}

drawingCanvas.ontouchend = function (e) { 
   var loc;
   
   if (e.changedTouches.length === 1) {
      loc = windowToCanvas(drawingCanvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      mouseUpOrTouchEndInDrawingCanvas(loc);
   }
}

drawingCanvas.onmousemove = function (e) {
   var x = e.x || e.clientX,
       y = e.y || e.clientY,
     loc = windowToCanvas(drawingCanvas, x, y);

   e.preventDefault();
   mouseMoveOrTouchMoveInDrawingCanvas(loc);
}

drawingCanvas.onmouseup = function (e) {
   var x = e.x || e.clientX,
       y = e.y || e.clientY,
     loc = windowToCanvas(drawingCanvas, x, y);

   e.preventDefault();
   mouseUpOrTouchEndInDrawingCanvas(loc);
}

// Control event handlers........................................

strokeStyleSelect.onchange = function (e) {
   drawingContext.strokeStyle = strokeStyleSelect.value;
};

fillStyleSelect.onchange = function (e) {
   drawingContext.fillStyle = fillStyleSelect.value;
};

lineWidthSelect.onchange = function (e) {
   drawingContext.lineWidth = lineWidthSelect.value;
/*
var c = drawingContext.canvas,
    sw = c.width,
    sh = c.height,
    dw = sw * lineWidthSelect.value,
    dh = sh * lineWidthSelect.value;

drawingContext.scale(lineWidthSelect.value, lineWidthSelect.value);
drawingContext.drawImage(c, 0, 0);
*/
};

eraseAllButton.onclick = function (e) {
   drawingContext.clearRect(0,0,
                            drawingCanvas.width,
                            drawingCanvas.height);
   drawGrid(drawingContext, GRID_LINE_COLOR, 10, 10);
   saveDrawingSurface();
   rubberbandW = rubberbandH = 0;
};

curveInstructionsOkayButton.onclick = function (e) {
   curveInstructions.style.display = 'none';
};

curveInstructionsNoMoreButton.onclick = function (e) {
   curveInstructions.style.display = 'none';
   showCurveInstructions = false;
};

snapshotButton.onclick = function (e) {
   var dataUrl;

   if (snapshotButton.value === 'Take snapshot') {
      dataUrl = drawingCanvas.toDataURL();
      snapshotImageElement.src = dataUrl;
      snapshotImageElement.style.display = 'inline';
      snapshotInstructions.style.display = 'inline';
      drawingCanvas.style.display = 'none';
      iconCanvas.style.display = 'none';
      controls.style.display = 'none';
      snapshotButton.value = 'Back to Paint';
   }
   else {
      snapshotButton.value = 'Take snapshot';
      drawingCanvas.style.display = 'inline';
      iconCanvas.style.display = 'inline';
      controls.style.display = 'inline';
      snapshotImageElement.style.display = 'none';
      snapshotInstructions.style.display = 'none';
   }
};

function drawBackground() {
   backgroundContext.canvas.width = drawingContext.canvas.width;
   backgroundContext.canvas.height = drawingContext.canvas.height;

   drawGrid(backgroundContext, GRID_LINE_COLOR, 10, 10);
}

// Initialization................................................

iconContext.strokeStyle = ICON_STROKE_STYLE;
iconContext.fillStyle = ICON_FILL_STYLE;

iconContext.font = '48px Palatino';
iconContext.textAlign = 'center';
iconContext.textBaseline = 'middle';

drawingContext.font = '48px Palatino';
drawingContext.textBaseline = 'bottom';

drawingContext.strokeStyle = strokeStyleSelect.value;
drawingContext.fillStyle = fillStyleSelect.value;
drawingContext.lineWidth = lineWidthSelect.value;

drawGrid(drawingContext, GRID_LINE_COLOR, 10, 10);
selectedRect = ICON_RECTANGLES[SLINKY_ICON];
selectedFunction = 'slinky';

// This event listener prevents touch devices from
// scrolling the visible viewport.

document.body.addEventListener('touchmove', function (e) {
   e.preventDefault();
}, false);

drawIcons();
drawBackground();

# 附录 3-DOM 事件汇总

## 一 用户界面事件

UI 事件主要有以下几种：

- DOMActivate：元素被用户通过鼠标或键盘操作激活时触发（比 click 或 keydown 更通用）。这个事件在 DOM3 Events 中已经废弃。因为浏览器实现之间存在差异，所以不要使用它。
- load：在 window 上当页面加载完成后触发，在窗套（ `<frameset>`）上当所有窗格（` <frame>`）都加载完成后触发，在 `<img>` 元素上当图片加载完成后触发，在 `<object>` 元素上当相应对象加载完成后触发。
- unload：在 window 上当页面完全卸载后触发，在窗套上当所有窗格都卸载完成后触发，在`<object>`元素上当相应对象卸载完成后触发。
- abort：在`<object>`元素上当相应对象加载完成前被用户提前终止下载时触发。
- error：在 window 上当 JavaScript 报错时触发，在`<img>`元素上当无法加载指定图片时触发，在`<object>`元素上当无法加载相应对象时触发，在窗套上当一个或多个窗格无法完成加载时触发。
- select：在文本框（ `<input>`或 textarea）上当用户选择了一个或多个字符时触发。
- resize：在 window 或窗格上当窗口或窗格被缩放时触发。
- scroll：当用户滚动包含滚动条的元素时在元素上触发。 `<body>`元素包含已加载页面的滚动条。

## 二 焦点事件

焦点事件有以下 6 种：

- blur：当元素失去焦点时触发。这个事件不冒泡，所有浏览器都支持。
- DOMFocusIn：当元素获得焦点时触发。这个事件是 focus 的冒泡版。 Opera 是唯一支持这个事件的主流浏览器。 DOM3 Events 废弃了 DOMFocusIn，推荐 focusin。
- DOMFocusOut：当元素失去焦点时触发。这个事件是 blur 的通用版。 Opera 是唯一支持这个事件的主流浏览器。 DOM3 Events 废弃了 DOMFocusOut，推荐 focusout。
- focus：当元素获得焦点时触发。这个事件不冒泡，所有浏览器都支持。
- focusin：当元素获得焦点时触发。这个事件是 focus 的冒泡版。
- focusout：当元素失去焦点时触发。这个事件是 blur 的通用版

焦点事件中的两个主要事件是 focus 和 blur， 这两个事件在 JavaScript 早期就得到了浏览器支持。它们最大的问题是不冒泡。这导致 IE 后来又增加了 focusin 和 focusout， Opera 又增加了 DOMFocusIn、DOMFocusOut。

IE 新增的这两个事件已经被 DOM3 Events 标准化。当焦点从页面中的一个元素移到另一个元素上时，会依次发生如下事件：

- (1) focuscout 在失去焦点的元素上触发。
- (2) focusin 在获得焦点的元素上触发。
- (3) blur 在失去焦点的元素上触发。
- (4) DOMFocusOut 在失去焦点的元素上触发。
- (5) focus 在获得焦点的元素上触发。
- (6) DOMFocusIn 在获得焦点的元素上触发。

其中， blur、 DOMFocusOut 和 focusout 的事件目标是失去焦点的元素，而 focus、 DOMFocusIn 和 focusin 的事件目标是获得焦点的元素。

## 三 鼠标和滚轮事件

DOM3 Events 定义了 9 种鼠标事件：

- click：在用户单击鼠标主键（通常是左键）或按键盘回车键时触发。这主要是基于无障碍的考虑，让键盘和鼠标都可以触发 onclick 事件处理程序。
- dblclick：在用户双击鼠标主键（通常是左键）时触发。这个事件不是在 DOM2 Events 中定义的，但得到了很好的支持， DOM3 Events 将其进行了标准化。
- mousedown：在用户按下任意鼠标键时触发。这个事件不能通过键盘触发。
- mouseenter：在用户把鼠标光标从元素外部移到元素内部时触发。这个事件不冒泡，也不会在光标经过后代元素时触发。 mouseenter 事件不是在 DOM2 Events 中定义的，而是 DOM3 Events 中新增的事件。
- mouseleave：在用户把鼠标光标从元素内部移到元素外部时触发。这个事件不冒泡，也不会在光标经过后代元素时触发。 mouseleave 事件不是在 DOM2 Events 中定义的，而是 DOM3 Events 中新增的事件。
- mousemove：在鼠标光标在元素上移动时反复触发。这个事件不能通过键盘触发。
- mouseout：在用户把鼠标光标从一个元素移到另一个元素上时触发。移到的元素可以是原始元素的外部元素，也可以是原始元素的子元素。这个事件不能通过键盘触发。
- mouseover：在用户把鼠标光标从元素外部移到元素内部时触发。这个事件不能通过键盘触发。
- mouseup：在用户释放鼠标键时触发。这个事件不能通过键盘触发。

比如， click 事件触发的前提是 mousedown 事件触发后，紧接着又在同一个元素上触发了 mouseup 事件。如果 mousedown 和 mouseup 中的任意一个事件被取消，那么 click 事件就不会触发。类似地，两次连续的 click 事件会导致 dblclick 事件触发。只要有任何逻辑阻止了这两个 click 事件发生（比如取消其中一个 click 事件或者取消 mousedown 或 mouseup 事件中的任一个）， dblclick 事件就不会发生。这 4 个事件永远会按照如下顺序触发：

- (1) mousedown
- (2) mouseup
- (3) click
- (4) mousedown
- (5) mouseup
- (6) click
- (7) dblclick

click 和 dblclick 在触发前都依赖其他事件触发， mousedown 和 mouseup 则不会受其他事件影响。IE8 及更早版本的实现中有个问题，这会导致双击事件跳过第二次 mousedown 和 click 事件。相应的顺序变成了：

- (1) mousedown
- (2) mouseup
- (3) click
- (4) mouseup
- (5) dblclick

鼠标事件在 DOM3 Events 中对应的类型是"MouseEvent"，而不是"MouseEvents"。

鼠标事件还有一个名为滚轮事件的子类别。滚轮事件只有一个事件 mousewheel，反映的是鼠标滚轮或带滚轮的类似设备上滚轮的交互。

## 四 键盘和输入事件

键盘事件包含 3 个事件：

- keydown，用户按下键盘上某个键时触发，而且持续按住会重复触发。
- keypress，用户按下键盘上某个键并产生字符时触发，而且持续按住会重复触发。 Esc 键也会触发这个事件。 DOM3 Events 废弃了 keypress 事件，而推荐 textInput 事件。
- keyup，用户释放键盘上某个键时触发。

输入事件只有一个，即 textInput。这个事件是对 keypress 事件的扩展，用于在文本显示给用户之前更方便地截获文本输入。 textInput 会在文本被插入到文本框之前触发。

对于 keydown 和 keyup 事件， event 对象的 keyCode 属性中会保存一个键码，对应键盘上特定的一个键。对于字母和数字键， keyCode 的值与小写字母和数字的 ASCII 编码一致。比如数字 7 键的 keyCode 为 55，而字母 A 键的 keyCode 为 65，而且跟是否按了 Shift 键无关。

```js
let textbox = document.getElementById('myText')
textbox.addEventListener('keyup', (event) => {
  console.log(event.keyCode)
})
```

浏览器在 event 对象上支持 charCode 属性，只有发生 keypress 事件时这个属性才会被设置值，包含的是按键字符对应的 ASCII 编码。通常， charCode 属性的值是 0，在 keypress 事件发生时则是对应按键的键码。 IE8 及更早版本和 Opera 使用 keyCode 传达字符的 ASCII 编码。要以跨浏览器方式获取字符编码，首先要检查 charCode 属性是否有值，如果没有再使用 keyCode，如下所示：

```js
var EventUtil = {
  // 其他代码
  getCharCode: function (event) {
    if (typeof event.charCode == 'number') {
      return event.charCode
    } else {
      return event.keyCode
    }
  },
  // 其他代码
}
```

这个方法检测 charCode 属性是否为数值（在不支持的浏览器中是 undefined）。如果是数值，则返回。否则，返回 keyCode 值。可以像下面这样使用：

```js
let textbox = document.getElementById('myText')
textbox.addEventListener('keypress', (event) => {
  console.log(EventUtil.getCharCode(event))
})
```

一旦有了字母编码，就可以使用 String.fromCharCode()方法将其转换为实际的字符了。

DOM3Events 规范并未规定 charCode 属性，而是定义了 key 和 char 两个新属性。其中， key 属性用于替代 keyCode，且包含字符串。在按下字符键时， key 的值等于文本字符（如“k”或“M”）；在按下非字符键时， key 的值是键名（如“Shift”或“ArrowDown”）。 char 属性在按下字符键时与 key 类似，在按下非字符键时为 null。

IE 支持 key 属性但不支持 char 属性。 Safari 和 Chrome 支持 keyIdentifier 属性，在按下非字符键时返回与 key 一样的值（如“Shift”）。对于字符键， keyIdentifier 返回以“U+0000”形式表示 Unicode 值的字符串形式的字符编码。

```js
let textbox = document.getElementById('myText')
textbox.addEventListener('keypress', (event) => {
  let identifier = event.key || event.keyIdentifier
  if (identifier) {
    console.log(identifier)
  }
})
```

由于缺乏跨浏览器支持，因此不建议使用 key、 keyIdentifier、char。

DOM3 Events 规范增加了一个名为 textInput 的事件，其在字符被输入到可编辑区域时触发。作为对 keypress 的替代， textInput 事件的行为有些不一样。一个区别是 keypress 会在任何可以获得焦点的元素上触发，而 textInput 只在可编辑区域上触发。另一个区别是 textInput 只在有新字符被插入时才会触发，而 keypress 对任何可能影响文本的键都会触发（包括退格键）。

因为 textInput 事件主要关注字符，所以在 event 对象上提供了一个 data 属性，包含要插入的字符（不是字符编码）。 data 的值始终是要被插入的字符，因此如果在按 S 键时没有按 Shift 键， data 的值就是"s"，但在按 S 键时同时按 Shift 键， data 的值则是"S"。

event 对象上还有一个名为 inputMethod 的属性，该属性表示向控件中输入文本的手段。可能的值如下：

- 0，表示浏览器不能确定是什么输入手段；
- 1，表示键盘；
- 2，表示粘贴；
- 3，表示拖放操作；
- 4，表示 IME；
- 5，表示表单选项；
- 6，表示手写（如使用手写笔）；
- 7，表示语音
- 8，表示组合方式；
- 9，表示脚本。

## 五 合成事件

合成事件是 DOM3 Events 中新增的，用于处理通常使用 IME 输入时的复杂输入序列。 IME 可以让用户输入物理键盘上没有的字符。例如，使用拉丁字母键盘的用户还可以使用 IME 输入日文。 IME 通常需要同时按下多个键才能输入一个字符。合成事件用于检测和控制这种输入。合成事件有以下 3 种：

- compositionstart，在 IME 的文本合成系统打开时触发，表示输入即将开始；
- compositionupdate，在新字符插入输入字段时触发；
- compositionend，在 IME 的文本合成系统关闭时触发，表示恢复正常键盘输入。

合成事件在很多方面与输入事件很类似。在合成事件触发时，事件目标是接收文本的输入字段。唯一增加的事件属性是 data，其中包含的值视情况而异：

- 在 compositionstart 事件中，包含正在编辑的文本（例如，已经选择了文本但还没替换）；
- 在 compositionupdate 事件中，包含要插入的新字符；
- 在 compositionend 事件中，包含本次合成过程中输入的全部内容。

与文本事件类似，合成事件可以用来在必要时过滤输入内容。可以像下面这样使用合成事件：

```js
let textbox = document.getElementById('myText')
textbox.addEventListener('compositionstart', (event) => {
  console.log(event.data)
})
textbox.addEventListener('compositionupdate', (event) => {
  console.log(event.data)
})
textbox.addEventListener('compositionend', (event) => {
  console.log(event.data)
})
```

## 六 变化事件

DOM2 的变化事件（ Mutation Events）是为了在 DOM 发生变化时提供通知。这些事件已经被废弃，并被 Mutation Observers 所取代。

## 七 HTML5 事件

HTML5 中还有一些已经得到浏览器较好支持的事件。

### 7.1 contextmenu 事件

Windows 95 通过单击鼠标右键为 PC 用户增加了上下文菜单的概念。不久，这个概念也在 Web 上得以实现。开发者面临的问题是如何确定何时该显示上下文菜单（在 Windows 上是右击鼠标，在 Mac 上是 Ctrl+单击），以及如何避免默认的上下文菜单起作用。结果就出现了 contextmenu 事件，以专门用于表示何时该显示上下文菜单，从而允许开发者取消默认的上下文菜单并提供自定义菜单。

contextmenu 事件冒泡，因此只要给 document 指定一个事件处理程序就可以处理页面上的所有同类事件。事件目标是触发操作的元素。这个事件在所有浏览器中都可以取消，在 DOM 合规的浏览器中使用 event.preventDefault()，在 IE8 及更早版本中将 event.returnValue 设置为 false。

contextmenu 事件应该算一种鼠标事件，因此 event 对象上的很多属性都与光标位置有关。通常，自定义的上下文菜单都是通过 oncontextmenu 事件处理程序触发显示，并通过 onclick 事件处理程序触发隐藏的。来看下面的例子：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>ContextMenu Event Example</title>
  </head>
  <body>
    <div id="myDiv">
      Right click or Ctrl+click me to get a custom context menu. Click anywhere
      else to get the default context menu.
    </div>
    <ul
      id="myMenu"
      style="position:absolute;visibility:hidden;background-color:
silver"
    >
      <li><a href="http://www.somewhere.com"> somewhere</a></li>
      <li><a href="http://www.wrox.com">Wrox site</a></li>
      <li><a href="http://www.somewhere-else.com">somewhere-else</a></li>
    </ul>
    <script>
      // 作为上下文菜单， <ul>元素初始时是隐藏的
      window.addEventListener('load', (event) => {
        let div = document.getElementById('myDiv')
        div.addEventListener('contextmenu', (event) => {
          event.preventDefault()
          let menu = document.getElementById('myMenu')
          menu.style.left = event.clientX + 'px'
          menu.style.top = event.clientY + 'px'
          menu.style.visibility = 'visible'
        })
        document.addEventListener('click', (event) => {
          document.getElementById('myMenu').style.visibility = 'hidden'
        })
      })
    </script>
  </body>
</html>
```

这里在`<div>`元素上指定了一个 oncontextmenu 事件处理程序。这个事件处理程序首先取消默认行，确保不会显示浏览器默认的上下文菜单。接着基于 event 对象的 clientX 和 clientY 属性把`<ul>`元素放到适当位置。最后一步通过将 visibility 属性设置为"visible"让自定义上下文菜单显示出来。另外，又给 document 添加了一个 onclick 事件处理程序，以便在单击事件发生时隐藏上下文菜单（系统上下文菜单就是这样隐藏的）

### 7.2 beforeunload 事件

beforeunload 事件会在 window 上触发，用意是给开发者提供阻止页面被卸载的机会。这个事件会在页面即将从浏览器中卸载时触发，如果页面需要继续使用，则可以不被卸载。这个事件不能取消，否则就意味着可以把用户永久阻拦在一个页面上。相反，这个事件会向用户显示一个确认框，其中的消息表明浏览器即将卸载页面，并请用户确认是希望关闭页面，还是继续留在页面上。

为了显示类似图 17-8 的确认框，需要将 event.returnValue 设置为要在确认框中显示的字符串（对于 IE 和 Firefox 来说），并将其作为函数值返回（对于 Safari 和 Chrome 来说），如下所示：

```js
window.addEventListener('beforeunload', (event) => {
  let message = "I'm really going to miss you if you go."
  event.returnValue = message
  return message
})
```

### 7.3 DOMContentLoaded 事件

window 的 load 事件会在页面完全加载后触发，因为要等待很多外部资源加载完成，所以会花费较长时间。而 DOMContentLoaded 事件会在 DOM 树构建完成后立即触发，而不用等待图片、 JavaScript 文件、 CSS 文件或其他资源加载完成。相对于 load 事件， DOMContentLoaded 可以让开发者在外部资源下载的同时就能指定事件处理程序，从而让用户能够更快地与页面交互。

要处理 DOMContentLoaded 事件，需要给 document 或 window 添加事件处理程序（实际的事件目标是 document，但会冒泡到 window）。下面是一个在 document 上监听 DOMContentLoaded 事件的例子：

```js
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('Content loaded')
})
```

DOMContentLoaded 事件的 event 对象中不包含任何额外信息（除了 target 等于 document）。DOMContentLoaded 事件通常用于添加事件处理程序或执行其他 DOM 操作。这个事件始终在 load 事件之前触发。

对于不支持 DOMContentLoaded 事件的浏览器，可以使用超时为 0 的 setTimeout()函数，通过其回调来设置事件处理程序，比如：

```js
setTimeout(() => {
  // 在这里添加事件处理程序
}, 0)
```

以上代码本质上意味着在当前 JavaScript 进程执行完毕后立即执行这个回调。页面加载和构建期间，只有一个 JavaScript 进程运行。所以可以在这个进程空闲后立即执行回调，至于是否与同一个浏览器或同一页面上不同脚本的 DOMContentLoaded 触发时机一致并无绝对把握。为了尽可能早一些执行，以上代码最好是页面上的第一个超时代码。即使如此，考虑到各种影响因素，也不一定保证能在 load 事件之前执行超时回调。

### 7.4 readystatechange 事件

IE 首先在 DOM 文档的一些地方定义了一个名为 readystatechange 事件。这个有点神秘的事件旨在提供文档或元素加载状态的信息，但行为有时候并不稳定。支持 readystatechange 事件的每个对象都有一个 readyState 属性，该属性具有一个以下列出的可能的字符串值。

- uninitialized：对象存在并尚未初始化。
- loading：对象正在加载数据。
- loaded：对象已经加载完数据。
- interactive：对象可以交互，但尚未加载完成。
- complete：对象加载完成。

看起来很简单，其实并非所有对象都会经历所有 readystate 阶段。文档中说有些对象会完全跳过某个阶段，但并未说明哪些阶段适用于哪些对象。这意味着 readystatechange 事件经常会触发不到 4 次，而 readyState 未必会依次呈现上述值。

在 document 上使用时，值为"interactive"的 readyState 首先会触发 readystatechange 事件，时机类似于 DOMContentLoaded。进入交互阶段，意味着 DOM 树已加载完成，因而可以安全地交互了。此时图片和其他外部资源不一定都加载完了。可以像下面这样使用 readystatechange 事件：

```js
document.addEventListener('readystatechange', (event) => {
  if (document.readyState == 'interactive') {
    console.log('Content loaded')
  }
})
```

这个事件的 event 对象中没有任何额外的信息，连事件目标都不会设置。在与 load 事件共同使用时，这个事件的触发顺序不能保证。在包含特别多或较大外部资源的页面中，交互阶 段会在 load 事件触发 前先触发。 而在包含较 少且较小外 部资源的页 面中，这个 readystatechange 事件有可能在 load 事件触发后才触发。

让问题变得更加复杂的是，交互阶段与完成阶段的顺序也不是固定的。在外部资源较多的页面中，很可能交互阶段会早于完成阶段，而在外部资源较少的页面中，很可能完成阶段会早于交互阶段。因此，实践中为了抢到较早的时机，需要同时检测交互阶段和完成阶段。比如：

```js
document.addEventListener('readystatechange', (event) => {
  if (
    document.readyState == 'interactive' ||
    document.readyState == 'complete'
  ) {
    document.removeEventListener('readystatechange', arguments.callee)
    console.log('Content loaded')
  }
})
```

当 readystatechange 事件触发时，这段代码会检测 document.readyState 属性，以确定当前是不是交互或完成状态。如果是，则移除事件处理程序，以保证其他阶段不再执行。注意，因为这里的事件处理程序是匿名函数，所以使用了 arguments.callee 作为函数指针。然后，又打印出一条表示内容已加载的消息。这样的逻辑可以保证尽可能接近使用 DOMContentLoaded 事件的效果。

使用 readystatechange 只能尽量模拟 DOMContentLoaded，但做不到分毫不差。load 事件和 readystatechange 事件发生的顺序在不同页面中是不一样的。

### 7.5 pageshow 与 pagehide 事件

Firefox 和 Opera 开发了一个名为往返缓存（ bfcache， back-forward cache）的功能，此功能旨在使用浏览器“前进”和“后退”按钮时加快页面之间的切换。这个缓存不仅存储页面数据，也存储 DOM 和 JavaScript 状态，实际上是把整个页面都保存在内存里。如果页面在缓存中，那么导航到这个页面时就不会触发 load 事件。通常，这不会导致什么问题，因为整个页面状态都被保存起来了。不过， Firefx 决定提供一些事件，把往返缓存的行为暴露出来。

第一个事件是 pageshow，其会在页面显示时触发，无论是否来自往返缓存。在新加载的页面上，pageshow 会在 load 事件之后触发；在来自往返缓存的页面上， pageshow 会在页面状态完全恢复后触发。注意，虽然这个事件的目标是 document，但事件处理程序必须添加到 window 上。

```js
;(function () {
  let showCount = 0
  window.addEventListener('load', () => {
    console.log('Load fired')
  })
  window.addEventListener('pageshow', () => {
    showCount++
    console.log(`Show has been fired ${showCount} times.`)
  })
})()
```

这个例子使用了私有作用域来保证 showCount 变量不进入全局作用域。在页面首次加载时，showCount 的值为 0。之后每次触发 pageshow 事件， showCount 都会加 1 并输出消息。如果从包含

以上代码的页面跳走，然后又点击“后退”按钮返回以恢复它，就能够每次都看到 showCount 递增的值。这是因为变量的状态连同整个页面状态都保存在了内存中，导航回来后可以恢复。如果是点击了浏览器的“刷新”按钮，则 showCount 的值会重置为 0，因为页面会重新加载。

除了常用的属性， pageshow 的 event 对象中还包含一个名为 persisted 的属性。这个属性是一个布尔值，如果页面存储在了往返缓存中就是 true，否则就是 false。可以像下面这样在事件处理程序中检测这个属性：

```js
;(function () {
  let showCount = 0
  window.addEventListener('load', () => {
    console.log('Load fired')
  })
  window.addEventListener('pageshow', () => {
    showCount++
    console.log(
      `Show has been fired ${showCount} times.`,
      `Persisted? ${event.persisted}`
    )
  })
})()
```

通过检测 persisted 属性可以根据页面是否取自往返缓存而决定是否采取不同的操作。与 pageshow 对应的事件是 pagehide，这个事件会在页面从浏览器中卸载后，在 unload 事件之前触发。与 pageshow 事件一样， pagehide 事件同样是在 document 上触发，但事件处理程序必须被添加到 window。

event 对象中同样包含 persisted 属性，但用法稍有不同。比如，以下代码检测了 event.persisted 属性：

```js
window.addEventListener('pagehide', (event) => {
  console.log('Hiding. Persisted? ' + event.persisted)
})
```

这样，当 pagehide 事件触发时，也许可以根据 persisted 属性的值来采取一些不同的操作。对 pageshow 事件来说， persisted 为 true 表示页面是从往返缓存中加载的；而对 pagehide 事件来说，persisted 为 true 表示页面在卸载之后会被保存在往返缓存中。因此，第一次触发 pageshow 事件时 persisted 始终是 false，而第一次触发 pagehide 事件时 persisted 始终是 true（除非页面不符合使用往返缓存的条件）。

注册了 onunload 事件处理程序（即使是空函数）的页面会自动排除在往返缓存之外。这是因为 onunload 事件典型的使用场景是撤销 onload 事件发生时所做的事情，如果使用往返缓存，则下一次页面显示时就不会触发 onload 事件，而这可能导致页面无法使用。

### 7.6 hashchange 事件

HTML5 增加了 hashchange 事件，用于在 URL 散列值（ URL 最后#后面的部分）发生变化时通知开发者。这是因为开发者经常在 Ajax 应用程序中使用 URL 散列值存储状态信息或路由导航信息。

onhashchange 事件处理程序必须添加给 window，每次 URL 散列值发生变化时会调用它。 event 对象有两个新属性： oldURL 和 newURL。这两个属性分别保存变化前后的 URL，而且是包含散列值的完整 URL。下面的例子展示了如何获取变化前后的 URL：

```js
window.addEventListener("hashchange", (event) => {
console.log(`Old URL: ${event.oldURL}, New URL: ${event.newURL}`);
});
如果想确定当前的散列值，最好使用 location 对象：
window.addEventListener("hashchange", (event) => {
console.log(`Current hash: ${location.hash}`);
});
```

## 八 设备事件

### 8.1 orientationchange 事件

苹果公司在移动 Safari 浏览器上创造了 orientationchange 事件，以方便开发者判断用户的设备是处于垂直模式还是水平模式。移动 Safari 在 window 上暴露了 window.orientation 属性，它有以下 3 种值之一： 0 表示垂直模式， 90 表示左转水平模式（主屏幕键在右侧）， –90 表示右转水平模式（主屏幕键在左）。虽然相关文档也提及设备倒置后的值为 180，但设备本身至今还不支持。

每当用户旋转设备改变了模式，就会触发 orientationchange 事件。但 event 对象上没有暴露任何有用的信息，这是因为相关信息都可以从 window.orientation 属性中获取。以下是这个事件典型的用法：

```js
window.addEventListener('load', (event) => {
  let div = document.getElementById('myDiv')
  div.innerHTML = 'Current orientation is ' + window.orientation
  window.addEventListener('orientationchange', (event) => {
    div.innerHTML = 'Current orientation is ' + window.orientation
  })
})
```

这个例子会在 load 事件触发时显示设备初始的朝向。然后，又指定了 orientationchange 事件处理程序。此后，只要这个事件触发，页面就会更新以显示新的朝向信息。

所有 iOS 设备都支持 orientationchange 事件和 window.orientation 属性。

注意：因为 orientationchange 事件被认为是 window 事件，所以也可以通过给`<body>`元素添加 onorientationchange 属性来指定事件处理程序

### 8.2 deviceorientation 事件

deviceorientation 是 DeviceOrientationEvent 规范定义的事件。如果可以获取设备的加速计信息，而且数据发生了变化，这个事件就会在 window 上触发。要注意的是， deviceorientation 事件只反映设备在空间中的朝向，而不涉及移动相关的信息。

当 deviceorientation 触发时， event 对象中会包含各个轴相对于设备静置时坐标值的变化，主要是以下 5 个属性。

- alpha： 0~360 范围内的浮点值，表示围绕 z 轴旋转时 y 轴的度数（左右转）。
- beta： –180~180 范围内的浮点值，表示围绕 x 轴旋转时 z 轴的度数（前后转）。
- gamma： –90~90 范围内的浮点值，表示围绕 y 轴旋转时 z 轴的度数（扭转）。
- absolute：布尔值，表示设备是否返回绝对值。
- compassCalibrated：布尔值，表示设备的指南针是否正确校准

基于这些信息，可以随着设备朝向的变化重新组织或修改屏幕上显示的元素。例如，以下代码会随着朝向变化旋转一个元素：

```js
window.addEventListener('deviceorientation', (event) => {
  let arrow = document.getElementById('arrow')
  arrow.style.webkitTransform = `rotate(${Math.round(event.alpha)}deg)`
})
```

这个例子只适用于移动 WebKit 浏览器，因为使用的是专有的 webkitTransform 属性（ CSS 标准的 transform 属性的临时版本）。“箭头”（ arrow）元素会随着 event.alpha 值的变化而变化，呈现出指南针的样子。这里给 CSS3 旋转变形函数传入了四舍五入后的值，以确保平顺。

### 8.3 devicemotion 事件

DeviceOrientationEvent 规范也定义了 devicemotion 事件。这个事件用于提示设备实际上在移动，而不仅仅是改变了朝向。例如， devicemotion 事件可以用来确定设备正在掉落或者正拿在一个行走的人手里。

当 devicemotion 事件触发时， event 对象中包含如下额外的属性：

- acceleration：对象，包含 x、 y 和 z 属性，反映不考虑重力情况下各个维度的加速信息。
- accelerationIncludingGravity：对象，包含 x、 y 和 z 属性，反映各个维度的加速信息，包含 z 轴自然重力加速度。
- interval：毫秒，距离下次触发 devicemotion 事件的时间。此值在事件之间应为常量。
- rotationRate：对象，包含 alpha、 beta 和 gamma 属性，表示设备朝向。

如果无法提供 acceleration、 accelerationIncludingGravity 和 rotationRate 信息，则属性值为 null。为此，在使用这些属性前必须先检测它们的值是否为 null。比如：

```js
window.addEventListener('devicemotion', (event) => {
  let output = document.getElementById('output')
  if (event.rotationRate !== null) {
    output.innerHTML +=
      `Alpha=${event.rotationRate.alpha}` +
      `Beta=${event.rotationRate.beta}` +
      `Gamma=${event.rotationRate.gamma}`
  }
})
```

## 九 触摸及手势事件

### 9.0 触屏设备

Safari 为 iOS 定制了一些专有事件，以方便开发者。因为 iOS 设备没有鼠标和键盘，所以常规的鼠标和键盘事件不足以创建具有完整交互能力的网页。同时， WebKit 也为 Android 定制了很多专有事件，成为了事实标准，并被纳入 W3C 的 Touch Events 规范。本节介绍的事件只适用于触屏设备

### 9.1 触摸事件

当手指放在屏幕上、在屏幕上滑动或从屏幕移开时， 触摸事件即会触发。触摸事件有如下几种：

- touchstart：手指放到屏幕上时触发（即使有一个手指已经放在了屏幕上）。
- touchmove：手指在屏幕上滑动时连续触发。在这个事件中调用 preventDefault()可以阻止滚动。
- touchend：手指从屏幕上移开时触发。
- touchcancel：系统停止跟踪触摸时触发。文档中并未明确什么情况下停止跟踪。

这些事件都会冒泡，也都可以被取消。尽管触摸事件不属于 DOM 规范，但浏览器仍然以兼容 DOM 的方式实现了它们。因此，每个触摸事件的 event 对象都提供了鼠标事件的公共属性： bubbles、cancelable、 view、 clientX、 clientY、 screenX、 screenY、 detail、 altKey、 shiftKey、ctrlKey 和 metaKey。

除了这些公共的 DOM 属性，触摸事件还提供了以下 3 个属性用于跟踪触点：

- touches： Touch 对象的数组，表示当前屏幕上的每个触点。
- targetTouches： Touch 对象的数组，表示特定于事件目标的触点。
- changedTouches： Touch 对象的数组，表示自上次用户动作之后变化的触点

每个 Touch 对象都包含下列属性：

- clientX：触点在视口中的 x 坐标。
- clientY：触点在视口中的 y 坐标。
- identifier：触点 ID。
- pageX：触点在页面上的 x 坐标。
- pageY：触点在页面上的 y 坐标。
- screenX：触点在屏幕上的 x 坐标。
- screenY：触点在屏幕上的 y 坐标。
- target：触摸事件的事件目标。

这些属性可用于追踪屏幕上的触摸轨迹：

```js
function handleTouchEvent(event) {
  // 只针对一个触点
  if (event.touches.length == 1) {
    let output = document.getElementById('output')
    switch (event.type) {
      case 'touchstart':
        output.innerHTML +=
          `<br>Touch started:` +
          `(${event.touches[0].clientX}` +
          ` ${event.touches[0].clientY})`
        break
      case 'touchend':
        output.innerHTML +=
          `<br>Touch ended:` +
          `(${event.changedTouches[0].clientX}` +
          ` ${event.changedTouches[0].clientY})`
        break
      case 'touchmove':
        event.preventDefault() // 阻止滚动
        output.innerHTML +=
          `<br>Touch moved:` +
          `(${event.changedTouches[0].clientX}` +
          ` ${event.changedTouches[0].clientY})`
        break
    }
  }
}
document.addEventListener('touchstart', handleTouchEvent)
document.addEventListener('touchend', handleTouchEvent)
document.addEventListener('touchmove', handleTouchEvent)
```

以上代码会追踪屏幕上的一个触点。为简单起见，代码只会在屏幕有一个触点时输出信息。在 touchstart 事件触发时，触点的位置信息会输出到 output 元素中。在 touchmove 事件触发时，会取消默认行为以阻止滚动（移动触点通常会滚动页面），并输出变化的触点信息。在 touchend 事件触发时，会输出触点最后的信息。注意， touchend 事件触发时 touches 集合中什么也没有，这是因为没有滚动的触点了。此时必须使用 changedTouches 集合。

这些事件会在文档的所有元素上触发，因此可以分别控制页面的不同部分。当手指点触屏幕上的元素时，依次会发生如下事件（包括鼠标事件）：

- (1) touchstart
- (2) mouseover
- (3) mousemove（ 1 次）
- (4) mousedown
- (5) mouseup
- (6) click
- (7) touchend

### 9.2 手势事件

手势事件会在两个手指触碰屏幕且相对距离或旋转角度变化时触发。手势事件有以下 3 种。

- gesturestart：一个手指已经放在屏幕上，再把另一个手指放到屏幕上时触发。
- gesturechange：任何一个手指在屏幕上的位置发生变化时触发。
- gestureend：其中一个手指离开屏幕时触发

只有在两个手指同时接触事件接收者时，这些事件才会触发。在一个元素上设置事件处理程序，意味着两个手指必须都在元素边界以内才能触发手势事件（这个元素就是事件目标）。因为这些事件会冒泡，所以也可以把事件处理程序放到文档级别，从而可以处理所有手势事件。使用这种方式时，事件的目标就是两个手指均位于其边界内的元素。

触摸事件和手势事件存在一定的关系。当一个手指放在屏幕上时，会触发 touchstart 事件。当另一个手指放到屏幕上时， gesturestart 事件会首先触发，然后紧接着触发这个手指的 touchstart 事件。如果两个手指或其中一个手指移动，则会触发 gesturechange 事件。只要其中一个手指离开屏幕，就会触发 gestureend 事件，紧接着触发该手指的 touchend 事件。

与触摸事件类似，每个手势事件的 event 对象都包含所有标准的鼠标事件属性： bubbles、cancelable、 view、 clientX、 clientY、 screenX、 screenY、 detail、 altKey、 shiftKey、ctrlKey 和 metaKey。新增的两个 event 对象属性是 rotation 和 scale。 rotation 属性表示手指
变化旋转的度数，负值表示逆时针旋转，正值表示顺时针旋转（从 0 开始）。 scale 属性表示两指之间距离变化（对捏）的程度。开始时为 1，然后随着距离增大或缩小相应地增大或缩小。

可以像下面这样使用手势事件的属性：

```js
function handleGestureEvent(event) {
  let output = document.getElementById('output')
  switch (event.type) {
    case 'gesturestart':
      output.innerHTML +=
        `Gesture started: ` +
        `rotation=${event.rotation},` +
        `scale=${event.scale}`
      break
    case 'gestureend':
      output.innerHTML +=
        `Gesture ended: ` +
        `rotation=${event.rotation},` +
        `scale=${event.scale}`
      break
    case 'gesturechange':
      output.innerHTML +=
        `Gesture changed: ` +
        `rotation=${event.rotation},` +
        `scale=${event.scale}`
      break
  }
}
document.addEventListener('gesturestart', handleGestureEvent, false)
document.addEventListener('gestureend', handleGestureEvent, false)
document.addEventListener('gesturechange', handleGestureEvent, false)
```

触摸事件也会返回 rotation 和 scale 属性，但只在两个手指触碰屏幕时才会变化。一般来说，使用两个手指的手势事件比考虑所有交互的触摸事件使用起来更容易一些。

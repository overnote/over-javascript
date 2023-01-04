# 11-2-WebIDE 定制开发-monaco-editor

## 一 引入 monaco-editor

monaco-editor 是一款开源的文本编辑框架，vscode 也是基于此开发。本文在 monaco-editor 基础上搭建一款 webIDE。

引入 monaco-editor 的方式主要是两种，amd 或者 esm。

两者接入方式都比较容易，我均有尝试。

相对来讲，起初更偏向于 esm 方式，但是由于 issue 问题，导致打包后，在当前项目中可以正常使用，但是当把它作为 npm 包发布后，他人使用时，打包会出错。

故最终采取第一种方式，通过动态插入 script 标签来引入 monaco-editor，项目中通过定时器轮询 window.monaco 是否存在来判断 monaco-editor 是否加载完成，如未完成，提供一个 loading 进行等待。

## 二 多文件支持

monaco-editor 的官方例子中，基本都是单文件的处理，不过多文件处理也非常简单，本文在此处仅做简单的介绍。

多文件处理主要涉及到的就是 [monaco.editor.create](https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html#create) 以及 [monaco.editor.createModel](https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html#createModel) 两个 api。

其中，createModel 就是多文件处理的核心 api。根据文件路径创建不同的 model，在需要切换时，通过调用 [editor.setModel](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html#setModel) 即可实现多文件的切换

创建多文件并切换的一般的伪代码如下：

```js
const files = {
  '/test.js': 'xxx',
  '/app/test.js': 'xxx2',
}

const editor = monaco.editor.create(domNode, {
  ...options,
  model: null, // 此处model设为null，是阻止默认创建的空model
})

Object.keys(files).forEach((path) =>
  monaco.editor.createModel(
    files[path],
    'javascript',
    new monaco.Uri().with({ path })
  )
)

function openFile(path) {
  const model = monaco.editor
    .getModels()
    .find((model) => model.uri.path === path)
  editor.setModel(model)
}

openFile('/test.js')
```

## 三 保留切换之前状态

通过上述方法，可以实现多文件切换，但是在文件切换前后，会发现鼠标滚动的位置，文字的选中态均发生丢失的问题。

此时可以通过创建一个 map 来存储不同文件在切换前的状态，核心代码如下：

```js
const editorStatus = new Map()
const preFilePath = ''

const editor = monaco.editor.create(domNode, {
  ...options,
  model: null,
})

function openFile(path) {
  const model = monaco.editor
    .getModels()
    .find((model) => model.uri.path === path)

  if (path !== preFilePath) {
    // 储存上一个path的编辑器的状态
    editorStatus.set(preFilePath, editor.saveViewState())
  }
  // 切换到新的model
  editor.setModel(model)
  const editorState = editorStates.get(path)
  if (editorState) {
    // 恢复编辑器的状态
    editor.restoreViewState(editorState)
  }
  // 聚焦编辑器
  editor.focus()
  preFilePath = path
}
```

核心便是借助 editor 实例的 [saveViewState](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html#saveViewState) 方法实现编辑器状态的存储，通过 [restoreViewState](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html#restoreViewState) 方法进行恢复。

## 四 文件跳转

monaco-editor 作为一款优秀的编辑器，其本身是能够感知到其他 model 的存在，并进行相关代码补全的提示。虽然 hover 上去能看到相关信息，但是我们最常用的 cmd + 点击，默认是不能够跳转的。

这一条也算是比较常见的问题了，详细的原因及解决方案可以查看此 issue。

简单来说，库本身没有实现这个打开，是因为如果允许跳转，那么用户没有很明显的方法可以再跳转回去。

实际中，可以通过覆盖 openCodeEditor 的方式来解决，在没有找到跳转结果的情况下，自己实现 model 切换：

```js
const editorService = editor._codeEditorService
const openEditorBase = editorService.openCodeEditor.bind(editorService)
editorService.openCodeEditor = async (input, source) => {
  const result = await openEditorBase(input, source)
  if (result === null) {
    const fullPath = input.resource.path
    // 跳转到对应的model
    source.setModel(monaco.editor.getModel(input.resource))
    // 此处还可以自行添加文件选中态等处理

    // 设置选中区以及聚焦的行数
    source.setSelection(input.options.selection)
    source.revealLine(input.options.selection.startLineNumber)
  }
  return result // always return the base result
}
```

## 五 受控

在实际编写 react 组件中，往往还需要对文件内容进行受控的操作，这就需要编辑器在内容变化时通知外界，同时也允许外界直接修改文本内容。

先说内容变化的监听，monaco-editor 的每个 model 都提供了 onDidChangeContent 这样的方法来监听文件改变，可以继续改造我们的 openFile 函数。

```js
let listener = null

function openFile(path) {
  const model = monaco.editor
    .getModels()
    .find((model) => model.uri.path === path)

  if (path !== preFilePath) {
    // 储存上一个path的编辑器的状态
    editorStatus.set(preFilePath, editor.saveViewState())
  }
  // 切换到新的model
  editor.setModel(model)
  const editorState = editorStates.get(path)
  if (editorState) {
    // 恢复编辑器的状态
    editor.restoreViewState(editorState)
  }
  // 聚焦编辑器
  editor.focus()
  preFilePath = path

  if (listener) {
    // 取消上一次的监听
    listener.dispose()
  }

  // 监听文件的变更
  listener = model.onDidChangeContent(() => {
    const v = model.getValue()
    if (props.onChange) {
      props.onChange({
        value: v,
        path,
      })
    }
  })
}
```

解决了内部改动对外界的通知，外界想要直接修改文件的值，可以直接通过 [model.setValue](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ITextModel.html#setValue) 进行修改，但是这样直接操作，就会丢失编辑器 undo 的堆栈，想要保留 undo，可以通过 [model.pushEditOperations](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ITextModel.html#pushEditOperations) 来实现替换，具体代码如下：

```js
function updateModel(path, value) {
  let model = monaco.editor.getModels().find((model) => model.uri.path === path)

  if (model && model.getValue() !== value) {
    // 通过该方法，可以实现undo堆栈的保留
    model.pushEditOperations(
      [],
      [
        {
          range: model.getFullModelRange(),
          text: value,
        },
      ],
      () => {}
    )
  }
}
```

## 六 ESLint 支持

monaco-editor 本身是有语法分析的，但是自带的仅仅只有语法错误的检查，并没有代码风格的检查，当然，也不应该有代码风格的检查。

ESLint 的原理，是遍历语法树然后检验，其核心的 Linter，是不依赖 node 环境的，并且官方也进行了单独的打包输出，具体可以通过 clone 官方代码 后，执行 npm run webpack 拿到核心的打包后的 ESLint.js。其本质是对 [linter.js](https://github.com/ESLint/ESLint/blob/main/lib/linter/linter.js) 文件的打包。

同时官方也基于该打包产物，提供了 ESLint 的官方 (demo)[https://eslint.org/play/]，该 linter 的使用方法如下：

```js
import { Linter } from 'path/to/bundled/ESLint.js';

const linter = new Linter();

// 定义新增的规则，比如react/hooks, react特殊的一些规则
// linter中已经定义了包含了ESLint的所有基本规则，此处更多的是一些插件的规则的定义。
linter.defineRule(ruleName, ruleImpl)；

linter.verify(text, {
    rules: {
        'some rules you want': 'off or warn',
    },
    settings: {},
    parserOptions: {},
    env: {},
})
```

如果只使用上述 linter 提供的方法，存在几个问题：

- 规则太多，一一编写太累且不一定符合团队规范
- 一些插件的规则无法使用，比如 react 项目强依赖的 ESLint-plugin-react, react-hooks 的规则

所以还需要进行一些针对性的定制。在日常的 react 项目中，基本上团队都是基于 ESLint-config-airbnb 规则配置好大部分的 rules，然后再对部分规则根据团队进行适配。

通过阅读 ESLint-config-airbnb 的代码，其做了两部分的工作：

- 对 ESLint 的自带的大部分规则进行了配置
- 对 ESLint 的插件，ESLint-plugin-react, ESLint-plugin-react-hooks 的规则，也进行了配置。

而 ESLint-plugin-react, ESLint-plugin-react-hooks，核心是新增了一些针对 react 及 hooks 的规则。

那么其实解决方案如下：

- 使用打包后的 ESLint.js 导出的 linter 类
- 借助其 defineRule 的方法，对 react, react/hooks 的规则进行增加
- 合并 airbnb 的规则，作为各种规则的 config 合集备用
- 调用 linter.verify 方法，配合 3 生成的 airbnb 规则，即可实现完整的 ESLint 验证。

在每次代码变更时，频繁同步执行 ESLint 的 verify 可能会带来 ui 的卡顿，在此，我采取方案是：

- 通过 webworker 执行 linter.verify
- 在 model.onDidChangeContent 中通知 worker 进行执行。并通过防抖来减少执行频率
- 通过 model.getVersionId，拿到当前 id，来避免延迟过久导致结果对不上的问题

主进程核心的代码如下：

```js
// 监听ESLint web worker 的返回
worker.onmessage = function (event) {
  const { markers, version } = event.data
  const model = editor.getModel()
  // 判断当前model的versionId与请求时是否一致
  if (model && model.getVersionId() === version) {
    window.monaco.editor.setModelMarkers(model, 'ESLint', markers)
  }
}

let timer = null
// model内容变更时通知ESLint worker
model.onDidChangeContent(() => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    worker.postMessage({
      code: model.getValue(),
      // 发起通知时携带versionId
      version: model.getVersionId(),
      path,
    })
  }, 500)
})
```

worker 内核心代码如下：

```js
// 引入ESLint，内部结构如下：
/*
{
    esLinter, // 已经实例化，并且补充了react, react/hooks规则定义的实例
    // 合并了airbnb-config的规则配置
    config: {
        rules,
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            ecmaFeatures: {
                jsx: true
            }
        },
        env: {
            browser: true
        },
    }
}
*/
importScripts('path/to/bundled/ESLint/and/ESLint-airbnbconfig.js')

// 更详细的config, 参考ESLint linter源码中关于config的定义: https://github.com/ESLint/ESLint/blob/main/lib/linter/linter.js#L1441
const config = {
  ...self.linter.config,
  rules: {
    ...self.linter.config.rules,
    // 可以自定义覆盖原本的rules
  },
  settings: {},
}

// monaco的定义可以参考：https://microsoft.github.io/monaco-editor/api/enums/monaco.MarkerSeverity.html
const severityMap = {
  2: 8, // 2 for ESLint is error
  1: 4, // 1 for ESLint is warning
}

self.addEventListener('message', function (e) {
  const { code, version, path } = e.data
  const extName = getExtName(path)
  // 对于非js, jsx代码，不做校验
  if (['js', 'jsx'].indexOf(extName) === -1) {
    self.postMessage({ markers: [], version })
    return
  }
  const errs = self.linter.esLinter.verify(code, config)
  const markers = errs.map((err) => ({
    code: {
      value: err.ruleId,
      target: ruleDefines.get(err.ruleId).meta.docs.url,
    },
    startLineNumber: err.line,
    endLineNumber: err.endLine,
    startColumn: err.column,
    endColumn: err.endColumn,
    message: err.message,
    // 设置错误的等级，此处ESLint与monaco的存在差异，做一层映射
    severity: severityMap[err.severity],
    source: 'ESLint',
  }))
  // 发回主进程
  self.postMessage({ markers, version })
})
```

主进程监听文本变化，消抖后传递给 worker 进行 linter，同时携带 versionId 作为返回的比对标记，linter 验证后将 markers 返回给主进程，主进程设置 markers。

## 七 Prettier 支持

相比于 ESLint, Prettier 官方支持浏览器， 支持 amd, commonjs, es modules 的用法，非常方便。其使用方法的核心就是调用不同的 parser，去解析不同的文件，在我当前的场景下，使用到了以下几个 parser:

- babel: 处理 js
- html: 处理 html
- postcss: 用来处理 css, less, scss
- typescript: 处理 ts

一个非常简单的使用代码如下：

```js
const text = Prettier.format(model.getValue(), {
  // 指定文件路径
  filepath: model.uri.path,
  // parser集合
  plugins: PrettierPlugins,
  // 更多的options见：https://Prettier.io/docs/en/options.html
  singleQuote: true,
  tabWidth: 4,
})
```

在上述配置中，有一个配置需要注意：filepath。

该配置是用来来告知 Prettier 当前是哪种文件，需要调用什么解析器进行处理。在当前 WebIDE 场景下，将文件路径传递即可，当然，也可以自行根据文件后缀计算后使用 parser 字段指定用哪个解析器。

在和 monaco-editor 结合时，需要监听 cmd + s 快捷键来实现保存时，便进行格式化代码。

考虑到 monaco-editor 本身也提供了格式化的指令，可以通过 ⇧ + ⌥ + F 进行格式化。

故相比于 cmd + s 时，执行自定义的函数，不如直接覆盖掉自带的格式化指令，在 cmd + s 时直接执行指令来完成格式化来的优雅。

覆盖主要通过 [languages.registerDocumentFormattingEditProvider](https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html#registerDocumentFormattingEditProvider) 方法，具体用法如下：

```js
function provideDocumentFormattingEdits(model: any) {
  const p = window.require('Prettier')
  const text = p.Prettier.format(model.getValue(), {
    filepath: model.uri.path,
    plugins: p.PrettierPlugins,
    singleQuote: true,
    tabWidth: 4,
  })

  return [
    {
      range: model.getFullModelRange(),
      text,
    },
  ]
}

monaco.languages.registerDocumentFormattingEditProvider('javascript', {
  provideDocumentFormattingEdits,
})
monaco.languages.registerDocumentFormattingEditProvider('css', {
  provideDocumentFormattingEdits,
})
monaco.languages.registerDocumentFormattingEditProvider('less', {
  provideDocumentFormattingEdits,
})
```

上述代码中 window.require，是 amd 的方式，由于本文在选择引入 monaco-editor 时，采用了 amd 的方式，所以此处 Prettier 也顺带采用了 amd 的方式，并从 cdn 引入来减少包的体积，具体代码如下：

```js
window.define(
  'Prettier',
  [
    'https://unpkg.com/Prettier@2.5.1/standalone.js',
    'https://unpkg.com/Prettier@2.5.1/parser-babel.js',
    'https://unpkg.com/Prettier@2.5.1/parser-html.js',
    'https://unpkg.com/Prettier@2.5.1/parser-postcss.js',
    'https://unpkg.com/Prettier@2.5.1/parser-typescript.js',
  ],
  (Prettier: any, ...args: any[]) => {
    const PrettierPlugins = {
      babel: args[0],
      html: args[1],
      postcss: args[2],
      typescript: args[3],
    }
    return {
      Prettier,
      PrettierPlugins,
    }
  }
)
```

在完成 Prettier 的引入，提供格式化的 provider 之后，此时，执行 ⇧ + ⌥ + F 即可实现格式化，最后一步便是在用户 cmd + s 时执行该指令即可，使用 [editor.getAction](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html#getAction) 方法即可，伪代码如下：

```js
// editor为create方法创建的editor实例
editor.getAction('editor.action.formatDocument').run()
```

## 八 代码补全

onaco-editor 本身已经具备了常见的代码补全，比如 window 变量，dom，css 属性等。但是并未提供 node_modules 中的代码补全，比如最常见的 react，没有提示，体验会差很多。

经过调研，monaco-editor 可以提供代码提示的入口至少有两个 api：

- [registerCompletionItemProvider](https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html#registerCompletionItemProvider)，需要自定义触发规则及内容
- [addExtraLib](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.LanguageServiceDefaults.html#addExtraLib)，通过添加 index.d.ts，使得在自动输入的时候，提供由 index.d.ts 解析出来的变量进行自动补全。

第一种方案网上的文章较多，但是对于实际的需求，导入 react, react-dom，如果采用此种方案，就需要自行完成对 index.d.ts 的解析，同时输出类型定义方案，在实际使用时非常繁琐，不利于后期维护。

第二种方案比较隐蔽，也是偶然发现的，经过验证，stackbliz 就是用的这种方案。但是 stackbliz 只支持 ts 的跳转及代码补全。

经过测试，只需要同时在 ts 中的 javascriptDefaults 及 typescriptDefaults 中使用 addExtraLib 即可实现代码补全。

体验及成本远远优于方案一。

方案二的问题在于未知第三方包的解析，目前看，stackbliz 也仅仅只是对直系 npm 依赖进行了 .d.ts 的解析。相关依赖并无后续进行。实际也能理解，在不经过二次解析 .d.ts 的情况下，是不会对二次引入的依赖进行解析。故当前版本也不做 index.d.ts 的解析，仅提供直接依赖的代码补全及跳转。不过 ts 本身提供了 types 分析 的能力，故最终使用方案二，内置 react, react-dom 的类型定义，暂不做二次依赖的包解析。相关伪代码如下：

```js
window.monaco.languages.typescript.javascriptDefaults.addExtraLib(
  'content of react/index.d.ts',
  'music:/node_modules/@types/react/index.d.ts'
)
```

同时，通过 [addExtraLib](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.LanguageServiceDefaults.html#addExtraLib) 增加的 .d.ts 的定义，本身也会自动创建一个 model，借助前文所描述的 openCodeEditor 的覆盖方案，可以顺带实现 cmd + click 打开 index.d.ts 的需求，体验更佳。

## 九 主题替换

相关文档：<https://segmentfault.com/a/1190000040746839>

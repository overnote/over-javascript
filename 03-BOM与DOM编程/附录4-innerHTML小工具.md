# 附录 4-innerHTML 小工具

### 4.1 将 HTML 字符串转换成 DOM

jQuery 向 DOM 注入一段 HTML 非常简单：

```js
$(document.body).append('<div><h1>Greetings</h1><p>Yoshi here</p></div>')
```

实现上述方法需要如下步骤：

- 1、确保 HTML 字符串是合法有效的。
- 2、将它包裹在任意符合浏览器规则要求的闭合标签内。
- 3、使用 innerHTML 将这串 HTML 插入到虚拟 DOM 元素中。
- 4、提取该 DOM 节点。

确保自闭合元素被正确解释，可以对 HTML 字符串进行快速预处理，将诸如 `<table />` 的元素转换为 `<table></table>`（保证在各浏览器下的体验一致）：

```js
const tags =
  /^(area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i

// 转换函数， 通过使用正则表达式将自闭合标签转为
function convert(html) {
  return html.replace(/(<(\w+)[^>]*?)\/>/g, (all, front, tag) => {
    return tags.test(tag) ? all : front + '></' + tag + '>'
  })
}

assert(convert('<a/>') === '<a></a>', 'Check anchor conversion.')
assert(convert('<hr/>') === '<hr/>', 'Check hr conversion.')
```

此外还要注意父级元素与子集元素存在一定的特殊关系，比如：select 的子级必定是 option，可以构建问题元素和它们的容器之间的映射来解决：

- 通过 innerHTML 将该字符串直接注入到它的特定父元素中，该父元素提前使用内置的 document.createElement 创建好。尽管大多数情况
  下的大部分的浏览器都支持这种方式，但仍然不能保证完全通用。
- HTML 字符串可以在使用对应父元素包装后，直接注入到任意容器元素中（比方`<div>`），这样更保险，但相对麻烦

第二种方案更适合现代浏览器，不过需要注意以下 2 个元素的特殊包装情况：

- 使用具有 multiple 属性的 `<select>` 元素（而不是单选），因为它不会自动检查任何包含在其中的选项（而单选则会自动检查第一个选项）。
- 对 col 的兼容处理需要一个额外的`<tbody>`，否则 `<colgroup>` 不能正确生成。

将元素标签转为一系列 DOM 节点：

```js
function getNodes(htmlString, doc) {
  const map = {
    '<td': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    '<th': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    '<tr': [2, '<table><thead>', '</thead></table>'],
    '<option': [1, '<select multiple>', '</select>'],
    '<optgroup': [1, '<select multiple>', '</select>'],
    '<legend': [1, '<fieldset>', '</fieldset>'],
    '<thead': [1, '<table>', '</table>'],
    '<tbody': [1, '<table>', '</table>'],
    '<tfoot': [1, '<table>', '</table>'],
    '<colgroup': [1, '<table>', '</table>'],
    // 需要特殊父级容器的元素映射表。每个条目都包含新节点的深度，以及父元素的HTML头尾片断
    '<caption': [1, '<table>', '</table>'],
    '<col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  }

  const tagName = htmlString.match(/<\w+/)
  // 匹配起始标记和标签名
  let mapEntry = tagName ? map[tagName[0]] : null

  //  如果映射表中有匹配，使用匹配结果：如果没有，则构造空的“父”标记，深度设为0，作为结果
  if (!mapEntry) {
    mapEntry = [0, ' ', ' ']
  }
  // 创建用来包含新节点的</div>。注意，如果传入了文档(document)对象，使用传入的，否则默认当前document对象
  let div = (doc || document).createElement('div')
  // 使用匹配得到的父级容器元素，包装起传入的HTML字符串，并将其注入到新创建的<div>中
  div.innerHTML = mapEntry[1] + htmlString + mapEntry[2]

  // 按照映射关系定义的深度，向下遍历刚刚创建的DOM树，最终得到的应该是新创建的2元素。
  while (mapEntry[0]--) {
    div = div.lastChild
  }
  return div.childNodes // 返回新创建的元素
}

assert(
  getNodes('<td>test</td><td>test2</td>').length === 2,
  'Get two nodes back from the method.'
)
assert(
  getNodes('<td>test</td>')[0].nodeName === 'TD',
  "Verify that we're getting the right node."
)
```

### 4.2 将 DOM 元素插入到文档中

DOM fragments 特性提供了一个存储临时 DOM 节点的容器，适合执行插入操作。

```js
function getNodes(htmlString, doc, fragment) {
  const map = {
    '<td': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    '<th': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    '<tr': [2, '<table><thead>', '</thead></table>'],
    '<option': [1, '<select multiple>', '</select>'],
    '<optgroup': [1, '<select multiple>', '</select>'],
    '<legend': [1, '<fieldset>', '</fieldset>'],
    '<thead': [1, '<table>', '</table>'],
    '<tbody': [1, '<table>', '</table>'],
    '<tfoot': [1, '<table>', '</table>'],
    '<colgroup': [1, '<table>', '</table>'],
    // 需要特殊父级容器的元素映射表。每个条目都包含新节点的深度，以及父元素的HTML头尾片断
    '<caption': [1, '<table>', '</table>'],
    '<col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  }

  const tagName = htmlString.match(/<\w+/)
  // 匹配起始标记和标签名
  let mapEntry = tagName ? map[tagName[0]] : null

  //  如果映射表中有匹配，使用匹配结果：如果没有，则构造空的“父”标记，深度设为0，作为结果
  if (!mapEntry) {
    mapEntry = [0, ' ', ' ']
  }
  // 创建用来包含新节点的</div>。注意，如果传入了文档(document)对象，使用传入的，否则默认当前document对象
  let div = (doc || document).createElement('div')
  // 使用匹配得到的父级容器元素，包装起传入的HTML字符串，并将其注入到新创建的<div>中
  div.innerHTML = mapEntry[1] + htmlString + mapEntry[2]

  // 按照映射关系定义的深度，向下遍历刚刚创建的DOM树，最终得到的应该是新创建的2元素。
  while (mapEntry[0]--) {
    div = div.lastChild
  }

  // 如果fragment存在，将节点插入进去
  if (fragment) {
    while (div.firstChild) {
      fragment.appendChild(div.firstChild)
    }
  }

  return div.childNodes // 返回新创建的元素
}
```

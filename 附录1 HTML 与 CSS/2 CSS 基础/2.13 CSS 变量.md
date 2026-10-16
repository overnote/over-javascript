# CSS 变量

CSS 变量定义方式：

```css
:root {
  --primary-color: deepskyblue;
}
button {
  background-color: var(--primary-color);
}
```

CSS 的变量支持使用短横线和空格命名，但不可以使用数字进行命名。使用 `$、[、]、^、(、)、%、"`等特殊字符的命名时，需要使用反斜杠转义。

var 还支持第二个参数，是一个备选值。

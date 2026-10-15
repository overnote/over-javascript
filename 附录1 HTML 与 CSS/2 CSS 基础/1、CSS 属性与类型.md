#

css 由 属性+类型值决定显示结果，如：

```css
background-image: none | <image>;
mask-image: none | <image> | <mask-source>;
```

这里 background-image 是属性，而这个属性拥有很多类型值：`<url> 、<gradient>、element()、image()、image-set()、cross-fade()` 等。

常见的类型值有：

- <image>：<url>、<gradient>、element()、image()、image-set()、cross-fade()、paint()
- <box>:content-box、border-box、padding-box
- <shape-box>: <box>、margin-box
- <basic-shape>:inset()、circle()、ellipse()、polygon()、path()

属性值语法，以 `linear-gradient( [ <angle> | to <side-or-corner> ,]? <color-stop-list> )` 为例，包含三部分

- 关键字：to、auto、none、ease、inherit、initial、unset、revert
- 数据类型： 被 `<>` 包裹的，`<angle>、<side-or-corner>和<color-stop-list>`
- 符号：
  - `,`：分隔数个并列值或者函数参数值
  - `/`：分隔一个值的多个部分，在缩写中用于分离类型相同但属于不同 CSS 属性的值
  - 表示出现次数的数量符号：
    - `*`：可出现任意次数
    - `+`：可出现一次或者多次
    - `?`：可出现零次、一次，即可选
    - `{A,B}`：最少出现 A 次，最多出现 B 次
    - `#`：可出现一次、多次、但多次出现必须逗号分隔
    - `!`：当前分组必须产生一个值
  - 表示元素关系的组合符号：
    - `&&`：与符号，各部分必须出现
    - `||`：或符号，各部分至少出现一个
    - `|`：互斥符号，各部分只能出现一个
    - `[]`：优先级，其实就是数学运算中的小括号 `()`，css 中 小括号表示函数，则改用 中括号表示

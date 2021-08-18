# 06-容器对象-1-Array

## 一 Array 的基础使用

### 1.1 Array 对象创建

Object 对象是 JavaScript 所有对象的祖先对象，通过该对象也派生了一部分子数据类型，如 Array、Function、Date 等。

Array 即 JavaScript 的数组，和其他静态编程语言不同的是，JavaScript 的 Array 对象可以保存任意类型数据，且长度不固定（内部自动扩容缩容）。

创建 Array 有多种方式：

```js
// new方式：new操作符可以省略，不过不推荐
let arr1 = new Array() // 可以传入整数数值，表示数组长度
let arr2 = new Array(1, 2, 3)

// 字面量方式
let arr3 = []
let arr4 = [1, 2, 3]
```

此外通过实例方法 concat()、slice()能够基于数组创建新数组，通过静态方法 from()、of()也可以创建数组。

### 1.2 数组元素获取、设置

使用索引即可直接获取数组的元素：

```js
let arr = [1, 3, 6]
console.log(arr[1]) // 3
```

注意：数组的首位元素是从 0 开始的！

上述方法也可以用来设置数组的元素：

```js
let arr = [1, 3, 6]
arr[1] = 9
console.log(arr[1]) // 9
// 当值超过最大索引，则数组长度会自动扩充到该索引值+1
arr[4] = 5
console.log(arr.length) // 5
```

### 1.3 length 属性

数组对象的 length 属性用于获取数组数目：

```js
let arr = [2, 3, 5]
console.log(arr.length) // 3
```

当超出数组 length 位置被设置了数据，数组会重新计算 length 的值：

```js
let arr = [2, 3, 5]
console.log(arr.length) // 3

arr[10] = 10
console.log(arr.length) // 11，此时3-10位置数据是不存在的，值都是undefined
```

注意：JavaScript 数组的 length 不是只读的，而是可以修改的！这就造成了 JS 的数组可以通过修改 length 来从末尾添加、删除数据：

```js
let colors = ['red', 'blue', 'green']
// 重设length
colors.length = 2
console.log(colors) // [ 'red', 'blue' ]
```

同理，如果设置 length 超过了原本的长度，则新添加的元素都将以 undefined 填充。

### 1.4 数组空位

数组空位即使用一串逗号来创建空位（hole），ES5 与 ES6 的处理不相同：

```js
// 创建能存储5个元素的数组，有值的地方可以这样做：[3 , , , ,5]
const options = [, , , , ,]
// ES5
console.log(options) // [, , , , ,]
// ES6
console.log(options) // [undefined, undefined, undefined, undefined, undefined,]
```

## 二 Array 的实例方法

### 2.1 栈与队列方法：push()、pop()、shift()、unshift()

数组对象的实例都具备 压栈方法 push() 和 弹栈方法 pop() 用来模仿数据结构栈：

```js
let arr = [2, 3, 5]

// push：末尾追加元素
arr.push(7)
console.log(arr) // [ 2, 3, 5, 7 ]

// pop：末尾删除元素
arr.pop()
console.log(arr) // [ 2, 3, 5 ]
```

数组对象的实例都具备 shift 和 unshift 方法，用来模仿数据结构队列：

```js
// unshift: 首位添加元素
arr.unshift(1)
console.log(arr) // [ 1, 2, 3, 5 ]

// shift：首位删除元素
arr.shift()
console.log(arr) // [ 2, 3, 5 ]
```

### 2.2 数组排序：sort()、reverse()

```js
let arr = [3, 7, 2, 5]

// 排序：
arr.sort() // 默认由小到大排序
console.log(arr) // [ 2, 3, 5, 7 ]

// 反转：
arr.reverse()
console.log(arr) // [ 7, 5, 3, 2 ]
```

sort 方法默认是由小到大排序，其内部会调用每个元素的 toString()方法，然后得到可比较字符串，最后确定如何排序。但是会遇到下列问题：

```js
let arr = [0, 1, 5, 10, 15]

arr.sort()
console.log(arr) // [ 0, 1, 10, 15, 5 ]
```

这里并未得到用户期望的数据。sort 方法可以接收一个比较函数作为参数，以确保哪个值位于哪个值的前面：

```js
function compare(v1, v2) {
  if (v1 < v2) {
    return -1
  } else if (v1 > v2) {
    return 1
  } else {
    return 0
  }
}

let arr = [0, 1, 5, 10, 15]

arr.sort(compare)
console.log(arr) // [ 0, 1, 5, 10, 15 ]
```

### 2.3 获取索引位置：indexOf()、lastIndexOf()

ECMAScript 5 为数组实例添加了两个位置方法： indexOf()和 lastIndexOf()。这两个方法都接收两个参数：要查找的项和（可选的）表示查找起点位置的索引。其中， indexOf()方法从数组的开头（位置 0）开始向后查找， lastIndexOf()方法则从数组的末尾开始向前查找。

这两个方法都返回要查找的项在数组中的位置，或者在没找到的情况下返回 1。在比较第一个参数与数组中的每一项时，会使用全等操作符；也就是说，要求查找的项必须严格相等：

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]
console.log(numbers.indexOf(4)) //3
console.log(numbers.lastIndexOf(4)) //5
console.log(numbers.indexOf(4, 4)) //5
console.log(numbers.lastIndexOf(4, 4)) //3
let person = { name: 'Nicholas' }
let people = [{ name: 'Nicholas' }]
let morePeople = [person]
console.log(people.indexOf(person)) //-1
console.log(morePeople.indexOf(person)) //0
```

### 2.4 基于数组创建数组：concat()、slice()

concat()方法可以基于当前数组中的所有项创建一个新数组。这个方法会先创建当前数组一个副本，然后将接收到的参数添加到这个副本的末尾，最后返回新构建的数组。在没有给 concat()方法传递参数的情况下，它只是复制当前数组并返回副本。如果传递给 concat()方法的是一或多个数组，则该方法会将这些数组中的每一项都添加到结果数组中。如果传递的值不是数组，这些值就会被简单地添加到结果数组的末尾：

```js
let colors = ['red', 'green', 'blue']
let colors2 = colors.concat('yellow', ['black', 'brown'])
console.log(colors) //red,green,blue
console.log(colors2) //red,green,blue,yellow,black,brown
```

slice()能够基于当前数组中的一或多个项创建一个新数组。 slice()方法可以接受一或两个参数，即要返回项的起始和结束位置。在只有一个参数的情况下， slice()方法返回从该参数指定位置开始到当前数组末尾的所有项。如果有两个参数，该方法返回起始和结束位置之间的项——但不包括结束位置的项。注意， slice()方法不会影响原始数组。

```js
let colors = ['red', 'green', 'blue', 'yellow', 'purple']
let colors2 = colors.slice(1)
let colors3 = colors.slice(1, 4)
console.log(colors2) //green,blue,yellow,purple
console.log(colors3) //green,blue,yellow
```

splice()的主要用途是向数组的中部插入项，但使用这种方法的方式则有如下 3 种。

- 删除：可以删除任意数量的项，只需指定 2 个参数：要删除的第一项的位置和要删除的项数。例如， splice(0,2)会删除数组中的前两项。
- 插入：可以向指定位置插入任意数量的项，只需提供 3 个参数：起始位置、 0（要删除的项数）和要插入的项。如果要插入多个项，可以再传入第四、第五，以至任意多个项。例如，splice(2,0,"red","green")会从当前数组的位置 2 开始插入字符串"red"和"green"。
- 替换：可以向指定位置插入任意数量的项，且同时删除任意数量的项，只需指定 3 个参数：起始位置、要删除的项数和要插入的任意数量的项。插入的项数不必与删除的项数相等。例如，splice (2,1,"red","green")会删除当前数组位置 2 的项，然后再从位置 2 开始插入字符串"red"和"green"。

splice()方法始终都会返回一个数组，该数组中包含从原始数组中删除的项（如果没有删除任何项，则返回一个空数组）。

```js
let colors = ['red', 'green', 'blue']
let removed = colors.splice(0, 1) // 删除第一项
console.log(colors) // green,blue
console.log(removed) // red，返回的数组中只包含一项
removed = colors.splice(1, 0, 'yellow', 'orange') // 从位置 1 开始插入两项
console.log(colors) // green,yellow,orange,blue
console.log(removed) // 返回的是一个空数组
removed = colors.splice(1, 1, 'red', 'purple') // 插入两项，删除一项
console.log(colors) // green,red,purple,orange,blue
console.log(removed) // yellow，返回的数组中只包含一项
```

### 2.5 复制和填充 copyWithin()、fill()

ES6 提供了批量复制方法 copyWithin()、填充数组方法 fill()：

```js
const zeroes = [0, 0, 0, 0, 0]

zeroes.fill(5) // 所有数据填充为5
console.log(zeroes) // [ 5, 5, 5, 5, 5 ]
zeroes.fill(6, 3) // 索引大于3的填充为6
console.log(zeroes) // [ 5, 5, 5, 6, 6 ]
zeroes.fill(7, 1, 3) // 索引大于等于1且小于3的填充为7
console.log(zeroes) // [ 5, 7, 7, 6, 6 ]
//  用 8 填充索引大于等于 1 且小于 4 的元素
zeroes.fill(8, -4, -1)
console.log(zeroes) // [ 5, 8, 8, 8, 6 ]
```

copyWithin()会按照指定范围浅复制数组中的部分内容，然后将它们插入到指定索引开始的位置。开始索引和结束索引则与 fill()使用同样的计算方法:

```js
let ints,
  reset = () => (ints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
reset()
// 从 ints 中复制索引 0 开始的内容，插入到索引 5 开始的位置
// 在源索引或目标索引到达数组边界时停止
ints.copyWithin(5)
console.log(ints) // [0, 1, 2, 3, 4, 0, 1, 2, 3, 4]
```

### 2.6 数组打平 flatten()

ECMAScript 2019 在 Array.prototype 上增加了两个方法： flat()和 flatMap()。这两个方法为打平数组提供了便利。如果没有这两个方法，则打平数组就要使用迭代或递归。

下面是如果没有这两个新方法要打平数组的一个示例实现：

```js
function flatten(sourceArray, flattenedArray = []) {
  for (const element of sourceArray) {
    if (Array.isArray(element)) {
      flatten(element, flattenedArray)
    } else {
      flattenedArray.push(element)
    }
  }
  return flattenedArray
}
const arr = [[0], 1, 2, [3, [4, 5]], 6]
console.log(flatten(arr))
// [0, 1, 2, 3, 4, 5, 6]
```

这个例子在很多方面像一个树形数据结构：数组中每个元素都像一个子节点，非数组元素是叶节点。因此，这个例子中的输入数组是一个高度为 2 有 7 个叶节点的树。打平这个数组本质上是对叶节点的按序遍历。

有时候如果能指定打平到第几级嵌套是很有用的。比如下面这个例子，它重写了上面的版本，允许指定要打平几级：

```js
function flatten(sourceArray, depth, flattenedArray = []) {
  for (const element of sourceArray) {
    if (Array.isArray(element) && depth > 0) {
      flatten(element, depth - 1, flattenedArray)
    } else {
      flattenedArray.push(element)
    }
  }
  return flattenedArray
}
const arr = [[0], 1, 2, [3, [4, 5]], 6]
console.log(flatten(arr, 1))
// [0, 1, 2, 3, [4, 5], 6]
```

为了解决上述问题，规范增加了 Array.prototype.flat()方法。该方法接收 depth 参数（默认值为 1），返回一个对要打平 Array 实例的浅复制副本。下面看几个例子：

```js
const arr = [[0], 1, 2, [3, [4, 5]], 6]
console.log(arr.flat(2))
// [0, 1, 2, 3, 4, 5, 6]
console.log(arr.flat())
// [0, 1, 2, 3, [4, 5], 6]
```

因为是执行浅复制，所以包含循环引用的数组在被打平时会从源数组复制值：

```js
const arr = [[0], 1, 2, [3, [4, 5]], 6]
arr.push(arr)
console.log(arr.flat())
// [0, 1, 2, 3, 4, 5, 6, [0], 1, 2, [3, [4, 5]], 6]
```

Array.prototype.flatMap()方法会在打平数组之前执行一次映射操作。在功能上， arr.flatMap(f)与 arr.map(f).flat()等价；但 arr.flatMap()更高效，因为浏览器只需要执行一次遍历:

```js
const arr = [[1], [3], [5]]
console.log(arr.map(([x]) => [x, x + 1]))
// [[1, 2], [3, 4], [5, 6]]
console.log(arr.flatMap(([x]) => [x, x + 1]))
// [1, 2, 3, 4, 5, 6]
```

flatMap()在非数组对象的方法返回数组时特别有用，例如字符串的 split()方法。来看下面的例子，该例子把一组输入字符串分割为单词，然后把这些单词拼接为一个单词数组：

```js
const arr = ['Lorem ipsum dolor sit amet,', 'consectetur adipiscing elit.']
console.log(arr.flatMap((x) => x.split(/[\W+]/)))
// ["Lorem", "ipsum", "dolor", "sit", "amet", "", "consectetur", "adipiscing","elit", ""]
```

对于上面的例子，可以利用空数组进一步过滤上一次映射后的结果，这也是一个数据处理技巧（虽然可能会有些性能损失）。下面的例子扩展了上面的例子，去掉了空字符串:

```js
const arr = ['Lorem ipsum dolor sit amet,', 'consectetur adipiscing elit.']
console.log(arr.flatMap((x) => x.split(/[\W+]/)).flatMap((x) => x || []))
// ["Lorem", "ipsum", "dolor", "sit", "amet", consectetur", "adipiscing", "elit"]
```

## 三 数组迭代相关的实例方法

### 3.0 数组的简单迭代

使用 for 循环即可直接迭代数组：

```js
let arr = [1, 2, 3]
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
}
```

除了元素可以迭代以外，数组的索引、元素、索引/元素键值对都有对应的迭代方法：

```js
const a = ['foo', 'bar', 'baz', 'qux']
// 因为这些方法都返回迭代器，所以可以将它们的内容通过 Array.from()直接转换为数组实例
const aKeys = Array.from(a.keys())
const aValues = Array.from(a.values())
const aEntries = Array.from(a.entries())
console.log(aKeys) // [0, 1, 2, 3]
console.log(aValues) // ["foo", "bar", "baz", "qux"]
console.log(aEntries) // [[0, "foo"], [1, "bar"], [2, "baz"], [3, "qux"]]

// 延伸：通过解构赋值实战使用
for (const [idx, element] of a.entries()) {
  console.log(idx)
  console.log(element)
}
```

ES5 为数组定义了 5 个迭代方法。每个方法都接收两个参数：要在每一项上运行的函数和（可选的）运行该函数的作用域对象——影响 this 的值。传入这些方法中的函数会接收三个参数：数组项的值、该项在数组中的位置和数组对象本身:

- every()：对数组中的每一项运行给定函数，如果该函数对每一项都返回 true，则返回 true。
- filter()：对数组中的每一项运行给定函数，返回该函数会返回 true 的项组成的数组。
- forEach()：对数组中的每一项运行给定函数。这个方法没有返回值。
- map()：对数组中的每一项运行给定函数，返回每次函数调用的结果组成的数组。
- some()：对数组中的每一项运行给定函数，如果该函数对任一项返回 true，则返回 true。

以上方法都不会修改数组中的包含的值。

### 3.1 every()、some()

在这些方法中，最相似的是 every()和 some()，它们都用于查询数组中的项是否满足某个条件。对 every()来说，传入的函数必须对每一项都返回 true，这个方法才返回 true；否则，它就返回 false。而 some()方法则是只要传入的函数对数组中的某一项返回 true，就会返回 true。

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]

let everyResult = numbers.every(function (item, index, array) {
  return item > 2
})

console.log(everyResult) //false

let someResult = numbers.some(function (item, index, array) {
  return item > 2
})

console.log(someResult)
```

### 3.2 filter()

filter()函数，它利用指定的函数确定是否在返回的数组中包含某一项。例如，要返回一个所有数值都大于 2 的数组，可以使用以下代码:

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]
let filterResult = numbers.filter(function (item, index, array) {
  return item > 2
})
console.log(filterResult) //[3,4,5,4,3]
```

### 3.3 map()

map()也返回一个数组，而这个数组的每一项都是在原始数组中的对应项上运行传入函数的结果。例如，可以给数组中的每一项乘以 2，然后返回这些乘积组成的数组:

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]
let mapResult = numbers.map(function (item, index, array) {
  return item * 2
})
console.log(mapResult) //[2,4,6,8,10,8,6,4,2]
```

### 3.4 forEach()

forEach()只是对数组中的每一项运行传入的函数。这个方法没有返回值，本质上与使用 for 循环迭代数组一样。

```js
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]
numbers.forEach(function (item, index, array) {
  //执行某些操作
})
```

### 3.5 reduce()、reduceRight()归并

归并方法 reduce()和 reduceRight()会迭代数组的所有项，然后构建一个最终返回的值。其中 reduce()方法从数组的第一项开始，逐个遍历到最后，而 reduceRight()则从数组的最后一项开始，向前遍历到第一项。

这两个方法都接收两个参数：一个在每一项上调用的函数和（可选的）作为归并基础的初始值。传给 reduce()和 reduceRight()的函数接收 4 个参数：前一个值、当前值、项的索引和数组对象。这个函数返回的任何值都会作为第一个参数自动传给下一项。第一次迭代发生在数组的第二项上，因此第一个参数是数组的第一项，第二个参数就是数组的第二项。

使用 reduce()方法可以执行求数组中所有值之和的操作，比如：

```js
let values = [1, 2, 3, 4, 5]

let sum = values.reduce(function (prev, cur, index, array) {
  return prev + cur
})

console.log(sum) //15
```

reduceRight()的作用类似，只不过方向相反：

```js
let values = [1, 2, 3, 4, 5]

let sum = values.reduceRight(function (prev, cur, index, array) {
  return prev + cur
})

console.log(sum) //15
```

## 四 Array 静态方法

### 4.1 Array.isArray()检测数组

instanceof 可以用来检测数据是否是数组类型：

```js
let arr = [1, 2, 3]
console.log(arr instanceof Array) // true
```

instanceof 用于在一个执行环境中判断数组，如果在网页中包含多个框架，即多个全局执行环境，也即会存在多个不同版本的 Array 构造函数，那么从一个框架向另一个框架传入一个数组，那么传入的数组与在第二个框架中原生创建的数组分别具有各自不同的构造函数。

ES5 为了解决上述问题，增加了 Array.isArray()方法，用于最终确定某个值到底是不是数组，而不管它是在哪个全局执行环境中创建的：

```js
let arr = [1, 2, 3]
console.log(Array.isArray(arr)) // true
```

### 4.2 Array.from() 创建数组

ES6 新增的 Array.from() 可以将类数组结构转换为数组实例：

```js
console.log(Array.from('matter')) // ['m', 'a', 't'.'t'.'e','r']
```

Array.from() 可以对现有数组进行浅复制：

```js
let arr = [1, 2, { category: 1, obj: { name: 'li', age: 30 } }]
let newArr = Array.from(arr)
console.log(newArr) // [ 1, 2, { category: 1, obj: { name: 'li', age: 30 } } ]
arr[2].obj.age = 40
console.log(newArr) //[ 1, 2, { category: 1, obj: { name: 'li', age: 40 } } ]
```

只要是可迭代的对象，Array.from()都可以将其转换为数组：

```js
// 转换迭代器
const iter = {
  *[Symbol.iterator]() {
    yield 1
    yield 2
    yield 3
    yield 4
  },
}
console.log(Array.from(iter)) //[ 1, 2, 3, 4 ]

// 转换 arguments对象
function getArgsArray() {
  return Array.from(arguments)
}
console.log(getArgsArray(1, 2, 3, 4)) // [1, 2, 3, 4]

// 转换带有必要属性的对象
const arrayLikeObject = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  length: 4,
}
console.log(Array.from(arrayLikeObject)) // [1, 2, 3, 4]
```

Array.from()还接收第二个可选的映射函数参数。这个函数可以直接增强新数组的值，而无须像调用 Array.from().map()那样先创建一个中间数组。还可以接收第三个可选参数，用于指定映射函数中 this 的值。但这个重写的 this 值在箭头函数中不适用：

```js
const a1 = [1, 2, 3, 4]
const a2 = Array.from(a1, (x) => x ** 2)
const a3 = Array.from(
  a1,
  function (x) {
    return x ** this.exponent
  },
  { exponent: 2 }
)
console.log(a2) // [1, 4, 9, 16]
console.log(a3) // [1, 4, 9, 16]
```

### 4.3 Array.of() 创建数组

ES6 新增的 Array.of() 可以将一组参数转换为数组实例，用于替代 ES6 之前的 `Array.prototype.slice.call(arguments)`，一种异常笨拙的将 arguments 对象转换为数组的写法：

```js
console.log(Array.of(1, 2, 3, 4)) // [1, 2, 3, 4]
console.log(Array.of(undefined)) // [undefined]
```

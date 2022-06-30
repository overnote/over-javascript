# 02-基类 Object

## 一 Object 类型

### 1.1 Object 类型基本使用

Object 是 ECMAScript 所有引用类型的祖先，即基类（基本类）。

创建方式：

```js
// new 方式
let obj1 = new Object()
let obj2 = new Object() // 有效，但是不推荐该方式
console.log(typeof obj1) // object
console.log(obj1 == obj2) // false

// 字面量方式
let obj = {}
console.log(obj1 == obj) // false
```

基于 Object 类型还有一些衍生的引用类型，如：Array、Function、Date、Math 等。所以 Object 与 Java 中的 java.lang.Object 类非常相似，也是派生其他对象的`基类`，即是所有类的祖先！

### 1.2 Object 对象实例

由于 Object 对象是所有对象的祖先对象（基类），所以其属性和方法，其他对象都会拥有：

- `constructor`属性：保存当前对象的构造函数
- `hasOwnProperty(propStr) 方法`：检测实例对象是否包含该属性用于检查给定的属性（不会检测原型中的属性）
- `isPrototypeOf(protoObj) 方法`：检测当前对象是否是传入的原型对象
- `propertyIsEnumerable(propStr)`：检测传入的参数属性是否能够被 for-in 枚举到。
- `toString()`：返回对象的字符串表示。
- `valueOf()`：返回对象的字符串、数值或布尔值表示
- `getPrototypeOf(obj)`：返回 obj 实例对应构造函数的原型

从上看出，Object 主要用来处理对象相关的操作。

## 二 Object 类常见使用场景

### 2.1 Object.keys() 获取对象成员

Object.keys() 用来获取对象成员数组：

```js
let obj = {
  name: 'lisi',
  age: 30,
  run: function () {
    console.log(this.name + ' is running')
  },
}

let keys = Object.keys(obj)
console.log(keys) //[ 'name', 'age', 'run' ]

for (let item in obj) {
  console.log(item) // name  age  run
}
```

> 可枚举性：JS 代码创建的属性都是可枚举的，包括自有属性、继承属性都是可枚举的，但是可以使用特殊手段改变属性为不可枚举

注意：**`Object.keys()` 只能获取对象中可被枚举的属性！**属性是否可枚举在下一节中有介绍。**只有可被枚举的属性，才能使用 `for in` 方式进行遍历**。

与`Object.keys()` 类似的是：`Object.getOwnPropertyNames()`，该方法用于返回对象所有自有属性名称的数组。

技巧延伸：在遍历对象属性时，往往需要一些过滤操作，如去除继承属性，去除函数属性，示例如下：

```js
for (let item in obj) {
  if (!item.hasOwnProperty(item)) {
    continue // 跳过继承的属性
  }

  if (typeof son[item] === 'function') {
    continue // 跳过方法
  }
}
```

### 2.2 对象的成员检测

使用属性直接查询、in、hasOwnProperty()、propertyIsEnumerable() 等方式可以检测对象中是否存在该成员。但是如果对象的属性是通过继承得到的，那么上述操作就会出现一些特殊情况：

```js
class Father {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  run() {
    console.log('running...')
  }
}

class Son extends Father {
  constructor(name, age) {
    super()
  }
}

let s = new Son('四', 30)
s.age = 40

// in 方式 检测成员：继承方法也可以检测到
console.log('age' in s) // true
console.log('name' in s) // true
console.log('toString' in s) // true

// Object.hasOwnProperty() 方式：不会检查原型链
console.log(s.hasOwnProperty('age')) // true
console.log(s.hasOwnProperty('name')) // true
console.log(s.hasOwnProperty('toString')) // false 继承方法无法识别

// Object.propertyIsEnumerable()() 方式：是 hasOwnProperty() 的增强版
// 只有检测到是自有属性，且可枚举型为 true 时，返回值才为 true
console.log(s.hasOwnProperty('age')) // true
console.log(s.hasOwnProperty('name')) // true
console.log(s.hasOwnProperty('toString')) // false 继承方法无法识别
```

延伸：使用 `s.age !== undefined` 的方式也可以用来判断对象是否存在属性，作用与 in 类似，但是在一些场合，这种做法欠妥周全：

```js
let obj = { x: undefined } // 对象属性被显式赋值了 undefined
console.log(obj.x !== undefined) // false
console.log('x' in obj) // true
```

## 三 Object 深入限制对象成员

### 3.1 改变成员特征

对象的成员在 JS 引擎中有着各种特征，比如：是否可访问等，这些特征并不能让开发者直接访问：

- `Configurable`：默认值为 true，表示能否通过 delete 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为访问器属性。
- `Enumerable`：默认值为 true，表示能否通过 for-in 循环返回属性
- `Writable`：默认值为 true，表示能否修改属性的值
- `Value`：默认值为 false，包含这个属性的数据值。读取属性值的时候，从这个位置读；写入属性值的时候，把新值保存在这个位置

示例：

```js
let p = {
  // 直接在对对象上定义了属性，则 Configurable、Enumerable、Writable 都被默认设置为了 true
  name: 'lisi', // name 属性的  Value 特征被设置为了 lisi
}
```

对象成员的这些默认特征如果需要修改，需要借助 ES5 的 `Object.defineProperty()` 方法，示例：

```js
let person = {}

Object.defineProperty(person, 'name', {
  writable: false,
  configurable: false,
  value: 'lisi',
})

console.log(person.name) // lisi

// 这里仍然是 lisi，并未改变，因为该属性是只读的，而且在严格模式下，该操作会直接报错
person.name = 'zs'
console.log(person.name) // lisi

// 类似的规则同样适用于 delete，因为 configurable 为 false，不允许删除
delete p.name
console.log(person.name) // lisi
```

注意：

- defineProperty 方法可以被多次调用，但是一旦设置 configurable 设置为 false 之后就不能再调用了！
- defineProperty 方法如果不指定内部属性，默认都是 false

### 3.2 改变访问器属性

访问器属性是一对 getter、setter 函数（非必须），分别用于读取属性、写入属性。访问器属性也有四个特征：

- Configurable：默认值为 true，表示能否通过 delete 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为访问器属性。
- Enumerable：默认值为 true，表示能否通过 for-in 循环返回属性
- Get：在读取属性时调用的函数，默认值为 undefined
- Set：在写入属性时调用的函数，默认值为 undefined

示例：

```js
let book = {
  _year: 2004,
  edition: 1,
}

Object.defineProperty(book, 'year', {
  get: function () {
    return this._year
  },
  set: function (newValue) {
    if (newValue > 2004) {
      this._year = newValue
      this.edition += newValue - 2004
    }
  },
})

book.year = 2005
console.log(book.edition) //2
```

不一定非要同时指定 getter 和 setter。只指定 getter 意味着属性是不能写，尝试写入属性会被忽略。在严格模式下，尝试写入只指定了 getter 函数的属性会抛出错误。类似地，只指定 setter 函数的属性也不能读，否则在非严格模式下会返回 undefined，而在严格模式下会抛出错误。

在 IE 中，只有 9 及以上版本才支持，如果是旧版，一 般 都 使 用 两 个 非 标 准 的 方 法：`__defineGetter__()`和`__defineSetter__()`:

```js
let book = {
  _year: 2004,
  edition: 1,
}
//定义访问器的旧有方法
book.__defineGetter__('year', function () {
  return this._year
})
book.__defineSetter__('year', function (newValue) {
  if (newValue > 2004) {
    this._year = newValue
    this.edition += newValue - 2004
  }
})
book.year = 2005
console.log(book.edition) //2
```

### 3.3 定义多个属性

为了方便开发，JS 也提供了同时定义多个属性的方法`Object.defineProperties()`：

```js
let book = {}
Object.defineProperties(book, {
  _year: {
    value: 2004,
  },
  edition: {
    value: 1,
  },
  year: {
    get: function () {
      return this._year
    },
    set: function (newValue) {
      if (newValue > 2004) {
        this._year = newValue
        this.edition += newValue - 2004
      }
    },
  },
})
```

### 3.4 读取属性特性

用 ECMAScript 5 的 `Object.getOwnPropertyDescriptor()`方法，可以取得给定属性的描述符。这个方法接收两个参数：属性所在的对象和要读取其描述符的属性名称。返回值是一个对象，如果是访问器属性，这个对象的属性有 configurable、enumerable、get 和 set；如果是数据属性，这个对象的属性有 configurable、enumerable、writable 和 value。例如：

```js
let book = {}
Object.defineProperties(book, {
  _year: {
    value: 2004,
  },
  edition: {
    value: 1,
  },
  year: {
    get: function () {
      return this._year
    },
    set: function (newValue) {
      if (newValue > 2004) {
        this._year = newValue
        this.edition += newValue - 2004
      }
    },
  },
})

let descriptor = Object.getOwnPropertyDescriptor(book, '_year')
console.log(descriptor.value) //2004
console.log(descriptor.configurable) //false
console.log(typeof descriptor.get) //"undefined"

let descriptor = Object.getOwnPropertyDescriptor(book, 'year')
console.log(descriptor.value) //undefined
console.log(descriptor.enumerable) //false
console.log(typeof descriptor.get) //"function"
```

### 3.5 锁定对象

锁定键：preventExtensions 方法锁定对象后，添加新的键，不会产生影响，甚至在严格模式下，会报错。

封闭对象：seal() 方法可以直接彻底封闭对象。

冻结对象：freeze 方法。冻结后的对象彻底无法修改、删除。

```js
let host = {
  url: 'localhost:8080/api',
  port: 443,
}

Object.freeze(host) // host 已经无法变更
host.port = 446
console.log(host.port) // 443

console.log(Object.isFrozen(host)) // true
```

## 三 Object.freeze()

**如果要让 const 声明的引用类型变量的内容也无法改变，可以使用 Object.freeze()**:

```js
const HOST = {
  url: '/api/users',
  port: 80,
}
Object.freeze(HOST)

HOST.port = 443
console.log(HOST.port) // 仍然为 80
```

注意：**var 重复声明不会报错，而 let、const 会报错！**

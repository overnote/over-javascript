# 12-基本类型-Symbol

## 一 Symbol 类型基本使用

Symbol(符号) 是 ES6 新增的基本数据类型，其实例是**唯一、不可变的**，其用途是确保对象属性使用唯一标识符，不发生属性冲突！

贴士：Symbol 并不能用来作为创建对象的私有属性，因为 Object API 提供了获取 Symbol 属性的方法，且 ES 未来方案已经规定 `#` 符号表示私有属性。

创建 Symbol 类型：

```js
// 直接创建
let s1 = Symbol()
console.log(typeof s1) // symbol
let s2 = Symbol()
console.log(typeof s2) // symbol

// 传入一个字符串参数描述，这个字符串只是一个描述，用来提供调试帮助，没有其他意义
let s3 = Symbol('demo3')
console.log(typeof s3) // symbol
let s4 = Symbol('demo4')
console.log(typeof s4) // symbol

// 甚至可以传入对象
let s5 = Symbol({ name: 'lisi' })

// 任意两个 Symbol 都不相等
console.log(s1 == s2) // false
console.log(s3 == s4) // false
```

注意：Symbol 类型是值类型，其没有对应包装对象！而数值、布尔等都有包装类型，如：Number()、Boolean()，这种包装类型与 Symbol 并不是一回事。所以 Symbol 不能使用 `new`进行构造，会报错：`Symbol is not a constructor`。如果要强行使用符号包装对象，可以使用 Object 函数：

```js
let s = Symbol()
let sObj = Object(s)
```

## 二 Symbol 作用示例

### 2.1 Symbol 控制对象属性唯一

任意两个 Symbol 都不相等，利用该特性可以解决一些实际问题。比如两个对象都要对一个对象进行属性插入，插入的属性的 key 名称相同，那么就会引发问题，有了 Symbol 就可以解决：

```js
let obj = {
  name: 'zs',
  [Symbol('category')]: '食品',
}

// 再添加一个 category 分类
obj[Symbol('category')] = '西餐'
console.log(obj) // {name: "zs", Symbol(category): "食品", Symbol(category): "西餐"}

// Symbol 属性需要使用特殊的获取方式
console.log(Object.getOwnPropertySymbols(obj)) // [Symbol(category), Symbol(category)]
console.log(Reflect.ownKeys(obj)) //["name", Symbol(category), Symbol(category)]
```

### 2.2 Symbol 控制对象属性无法访问

```js
let users = {
  lisi: '30 岁，前端工程师',
  lisi: '24 岁，设计师',
}

// 这 2 个人的名字一样
console.log(users.lisi) // 24 岁，设计师
```

如果要继续采用上述的书写格式：

```js
let user1 = {
  name: 'lisi',
  key: Symbol(),
}

let user2 = {
  name: 'lisi',
  key: Symbol(),
}

let userInfo = {
  [user1.key]: '30 岁，前端工程师',
  [user2.key]: '24 岁，设计师',
}
```

使用 Symbol 来控制对象中的成员无法被访问：

```js
const DATA = Symol();
const user = {
  [DATA]: {name},
  set name(v) {
    this[DATA].name = v;
  }
  get name(){
    return this[DATA].name;
  }
}
```

## 三 Symbol 作为对象属性

如果对象的属性是 symbol 类型，那么推荐使用反射方式获取：

```js
let s = Symbol()

let p = {
  name: 'lisi',
  [s]: '隐藏属性',
}

// 使用 for in 或者 for of遍历：无法遍历到 [s] 成员
// for (const key in p){}
// for (const key of Object.keys(p)){}

// 使用 Object.getOwnPropertySymbols(p) ：只能遍历到 Symbol 类型属性
// for(const key of Object.getOwnPropertySymbols(p)){}

// 使用Reflect.ownKeys(p)： 遍历所有属性
for (const key of Reflect.ownKeys(p)) {
  console.log(key) // name  Symbol()
}
```

### 四 Symbol 常用属性

### 4.1 Symbol.for() 全局符号注册表

先看示例：

```js
let s1 = Symbol.for('foo')
let s2 = Symbol.for('foo')
console.log(s1 === s2) // true

let s3 = Symbol('foo')
console.log(s1 === s3) // false
```

通过 Symbol.for() 创建的 Symbol 会注册到一个全局表中，这个全局表内的数据可以通过 Symbol.keyFor() 查询到：

```js
let s1 = Symbol.for('foo')
console.log(Symbol.keyFor(s1)) // foo

let s2 = Symbol('bar')
console.log(Symbol.keyFor(s2)) // undefined，如果传递的参数不是符号，则报错
```

全局注册表使用场景：运行时候的不同部分需要共享和重用符号，则可以使用一个相同的字符串作为键，在全局符号注册表中创建该符号。

### 4.2 Symbol.hasInstance

类似关键字 instanceof，Symbol.hasInstance 用来检查对象在其原型链上是否存在原型：

```js
class Foo {}

let f = new Foo()

// 检查 f 实例的原型链上是否有 Foo
console.log(Foo[Symbol.hasInstance](f)) // true
```

不过要注意静态修饰符：

```js
class Foo {}

class Fov extends Foo {
  static [Symbol.hasInstance]() {
    return false
  }
}

let f = new Fov()

console.log(Foo[Symbol.hasInstance](f)) // true
console.log(f instanceof Foo) // true
console.log(Fov[Symbol.hasInstance](f)) // false
console.log(f instanceof Fov) // false
```

### 4.3 Symbol.asyncIterator

Symbol.asyncIterator 是 ES2018 中实现异步迭代器 API 的函数，返回对象默认的 AsyncIterator，由 for-await-of 语句使用：

```js
class Foo {
  async *[Symbol.asyncIterator]() {}
}

let f = new Foo()
console.log(f[Symbol.asyncIterator]()) //AsyncGenerator {<suspended>}
```

由 Symbol.asyncIterator 函数生成的对象应该通过其 next()方法陆续返回 Promise 实例。可以通过显式地调用 next()方法返回，也可以隐式地通过异步生成器函数返回：

```js
class Emitter {
  constructor(max) {
    this.max = max
    this.asyncIdx = 0
  }
  async *[Symbol.asyncIterator]() {
    while (this.asyncIdx < this.max) {
      yield new Promise((resolve) => resolve(this.asyncIdx++))
    }
  }
}
async function asyncCount() {
  let emitter = new Emitter(5)
  for await (const x of emitter) {
    console.log(x)
  }
}
asyncCount() // 0 1 2 3 4
```

### 4.4 Symbol.iterator

Symbol.iterator 用于返回对象默认的 Iterator，由 for-of 使用：

```js
class Foo {
  *[Symbol.iterator]() {}
}
let f = new Foo()
console.log(f[Symbol.iterator]()) // Generator {<suspended>}
```

由 Symbol.iterator 函数生成的对象应该通过其 next()方法陆续返回值，可以通过显式调用 next()方法返回，也可以隐式地通过生成器函数返回：

```js
class Emitter {
  constructor(max) {
    this.max = max
    this.idx = 0
  }
  *[Symbol.iterator]() {
    while (this.idx < this.max) {
      yield this.idx++
    }
  }
}
function count() {
  let emitter = new Emitter(5)
  for (const x of emitter) {
    console.log(x)
  }
}
count() // 0 1 2 3 4
```

### 4.5 Symbol.species

Symbol.species 是创建派生对象的构造函数，这个属性在内置类型中最常用，用于对内置类型实例方法的返回值暴露实例化派生对象的方法。用 Symbol.species 定义静态的获取器（ getter）方法，可以覆盖新创建实例的原型定义：

```js
class Bar extends Array {}

class Baz extends Array {
  static get [Symbol.species]() {
    return Array
  }
}

let bar = new Bar()
console.log(bar instanceof Array) // true
console.log(bar instanceof Bar) // true
bar = bar.concat('bar')
console.log(bar instanceof Array) // true
console.log(bar instanceof Bar) // true

let baz = new Baz()
console.log(baz instanceof Array) // true
console.log(baz instanceof Baz) // true
baz = baz.concat('baz')
console.log(baz instanceof Array) // true
console.log(baz instanceof Baz) // false
```

### 4.6 Symbol.toPrimitive

Symbol.toPrimitive 可以将对象转换为相应的原始值。很多内置操作都会尝试强制将对象转换为原始值，包括字符串、数值和未指定的原始类型。对于一个自定义对象实例，通过在这个实例的 Symbol.toPrimitive 属性上定义一个函数可以改变默认行为。

```js
class Foo {}
let foo = new Foo()
console.log(3 + foo) // "3[object Object]"
console.log(3 - foo) // NaN
console.log(String(foo)) // "[object Object]"
class Bar {
  constructor() {
    this[Symbol.toPrimitive] = function (hint) {
      switch (hint) {
        case 'number':
          return 3
        case 'string':
          return 'string bar'
        case 'default':
        default:
          return 'default bar'
      }
    }
  }
}

let bar = new Bar()
console.log(3 + bar) // "3default bar"
console.log(3 - bar) // 0
console.log(String(bar)) // "string bar"
```

### 4,7 Symbol.toStringTag

Symbol.toStringTag 用于创建对象的默认字符串描述。通过 toString()方法获取对象标识时，会检索由 Symbol.toStringTag 指定的实例标识符，默认为"Object"。内置类型已经指定了这个值，但自定义类实例还需要明确定义：

```js
let s = new Set()
console.log(s) // Set(0) {}
console.log(s.toString()) // [object Set]
console.log(s[Symbol.toStringTag]) // Set

class Foo {}
let foo = new Foo()
console.log(foo) // Foo {}
console.log(foo.toString()) // [object Object]
console.log(foo[Symbol.toStringTag]) // undefined

class Bar {
  constructor() {
    this[Symbol.toStringTag] = 'Bar'
  }
}
let bar = new Bar()
console.log(bar) // Bar {}
console.log(bar.toString()) // [object Bar]
console.log(bar[Symbol.toStringTag]) // Bar
```

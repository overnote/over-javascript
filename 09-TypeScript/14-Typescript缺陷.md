# 14-Typescript 缺陷

## 一 非健全的类型系统

### 1.1 健全的类型系统概念

一个健全的类型系统能确保你的程序不会进入无效状态。例如，如果一个表达式的静态类型是 string，则在运行时，对它求值时你肯定只会得到一个 string。

在健全的类型系统中，永远不会在编译时 或运行时 出现表达式与预期类型不匹配的情况。

当然，健全性（soundness） 也是有级别的，TypeScript 具有一定程度的健全性，并会捕获以下类型的错误：

```ts
// 类型 'string' 不能赋值给 类型 'number'
const increment = (i: number): number => {
  return i + '1'
}

// 类型 '"98765432"' 的参数不能赋值给类型 'number' 的参数.
const countdown: number = increment('98765432')
```

### 1.2 TypeScript 中的类型不健全现象

TypeScript 并不保证 100%的及安全性，而是在正确性与生产力之间取得了一个平衡，这也就造成变量在运行时可能不是定义时的类型：

```ts
interface A {
  x: number
}

let a: A = { x: 3 }
let b: { x: number | string } = a
b.x = 'unsound'
let x: number = a.x // 不健全

a.x.toFixed(0)
```

上面的代码是不正确的，因为从 A 接口中可知 a.x 应该是一个数字。不幸的是，经过一些重新赋值后，它最终以一个字符串的形式出现，并且后面的代码能通过编译，但会在运行时出错。很不幸，这里显示的表达式可以正确编译。

这种平衡策略导致了 TypeScript 很容易出现运行时问题，any 类型泛滥后更容易引起这个现象。

## 二 运行时类型检查缺失

运行时类型检查不是 TypeScript 的目标之一，因此这种愿望可能永远不会实现。例如，在处理从 API 调用返回的 JSON 负载时，运行时类型检查会很有用。如果我们可以在类型级别上控制它，就用不着一整筐错误和许多单元测试了。

我们无法在运行时保证任何事情，因此可能会出现以下情况：

```ts
const getFullName = async (): string => {
  const person: AxiosResponse = await api()

  //response.name.fullName 可能在运行时成为 undefined
  return response.name.fullName
}
```

一些库如 io-ts，对这些需求进行了支持，但是也需要对模型进行复制。

## 三 any 类型

any 类型很容易引起滥用，其扩散会让整个项目的健全性大打折扣。

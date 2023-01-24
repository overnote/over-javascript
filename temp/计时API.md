### 2.5 计时 API

Date.now() 的时间精度很低，只有毫秒级。H5 额外规范了计时相关的 API：window.performance.now()，该方法返回一个微妙精度的浮点数，可以保证时间冲的单调增长：

```js
const t0 = performance.now();
const t1 = performance.now();
console.log(t0); // 1768.625000026077
console.log(t1); // 1768.6300000059418
const duration = t1 – t0;
console.log(duration); // 0.004999979864805937
```

performance.now() 计时器采用相对度量。这个计时器在执行上下文创建时从 0 开始计时。例如，打开页面或创建工作线程时，performance.now() 就会从 0 开始计时。由于这个计时器在不同上下文中初始化时可能存在时间差，因此不同上下文之间如果没有共享参照点则不可能直接比较 performance.now()。performance.timeOrigin 属性返回计时器初始化时全局系统时钟的值。

```js
const relativeTimestamp = performance.now()
const absoluteTimestamp = performance.timeOrigin + relativeTimestamp
console.log(relativeTimestamp) // 244.43500000052154
console.log(absoluteTimestamp) // 1561926208892.4001
```

Performance Timeline API 使用一套用于度量客户端延迟的工具扩展了 Performance 接口。性能度量将会采用计算结束与开始时间差的形式。这些开始和结束时间会被记录为 DOMHighResTimeStamp 值，而封装这个时间戳的对象是 PerformanceEntry 的实例。

浏览器会自动记录各种 PerformanceEntry 对象，而使用 performance.mark() 也可以记录自定义的 PerformanceEntry 对象。在一个执行上下文中被记录的所有性能条目可以通过 performance.getEntries() 获取：

```js
console.log(performance.getEntries())
// [PerformanceNavigationTiming, PerformanceResourceTiming, ... ]
```

这个返回的集合代表浏览器的性能时间线（performance timeline）。每个 PerformanceEntry 对象都有 name、entryType、startTime 和 duration 属性。

不过，PerformanceEntry 实际上是一个抽象基类，比如录自定义性能条目要使用 performance.mark() 方法：

```js
performance.mark('foo')
console.log(performance.getEntriesByType('mark')[0])
// PerformanceMark {
// name: "foo",
// entryType: "mark",
// startTime: 269.8800000362098,
// duration: 0
// }
```

在计算开始前和结束后各创建一个自定义性能条目可以计算时间差。最新的标记（mark）会被推到 getEntriesByType() 返回数组的开始：

```js
performance.mark('foo')
for (let i = 0; i < 1e6; ++i) {}
performance.mark('bar')
const [endMark, startMark] = performance.getEntriesByType('mark')
console.log(startMark.startTime - endMark.startTime) // 1.3299999991431832
```

除了自定义性能条目，还可以生成 PerformanceMeasure（性能度量）条目，对应由名字作为标识的两个标记之间的持续时间。PerformanceMeasure 的实例由 performance.measure() 方法生成：

```js
performance.mark('foo')
for (let i = 0; i < 1e6; ++i) {}
performance.mark('bar')
performance.measure('baz', 'foo', 'bar')
const [differenceMark] = performance.getEntriesByType('measure')
console.log(differenceMark)
```

Navigation Timing API 提供了高精度时间戳，用于度量当前页面加载速度。浏览器会在导航事件发生时自动记录 PerformanceNavigationTiming 条目。这个对象会捕获大量时间戳，用于描述页面是何时以及如何加载的：

```js
// 算了 loadEventStart 和 loadEventEnd 时间戳之间的差
const [performanceNavigationTimingEntry] = performance.getEntriesByType('navigation');
console.log(performanceNavigationTimingEntry)

console.log(performanceNavigationTimingEntry.loadEventEnd –
performanceNavigationTimingEntry.loadEventStart);
// 0.805000017862767
```

Resource Timing API 提供了高精度时间戳，用于度量当前页面加载时请求资源的速度。浏览器会在加载资源时自动记录 PerformanceResourceTiming。这个对象会捕获大量时间戳，用于描述资源加载的速度：

```js
// 计算加载一个特定资源所花的时间
const pre = performance.getEntriesByType('resource')[0]
console.log(pre)

console.log(pre.responseEnd – pre.requestStart)
// 493.9600000507198
```

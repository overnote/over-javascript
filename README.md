# README

## 关于本笔记

OverNote 系列笔记是我在平时一些学习时间阅读书籍博客、观看视频后整理出来的一套体系化的笔记，着重将一个整套知识体系由浅入深的记录下来，并做**可持续的**扩展。由于笔记刚刚开始整理，许多地方仍然没有细化，笔误依然很多，敬请期待不断校正后的正式版。正式版会以类似 gitbook 的形式开放，便于阅读。

为何是笔记形式，而不是独立博客形式？

```txt
因为我个人不是很喜欢在类似博客这样的平台上分享零碎的知识点，
独立博客的内容目录极度不清晰，久而久之只能成为一个自己也不会问津的垃圾收集器。

像 OverNote 这样层次分明的结构，更方便基于 Git 在原来的基础上进行增删改。
```

贴士：ES6 现在基本被各运行时接受，故 ES6 的内容已经完全被整合入对应章节，不再单独列出。如 let 声明已经并入了变量相关章节，class 并入了面向对象相关章节。

## 资料

贴士：**书不在于多，而在于精**

### 网页书籍 CSS

笔者推荐直接阅读新时期的一些必读著作：

- [《CSS 权威指南（第四版）》](https://book.douban.com/subject/33398314/)：经典 CSS 书籍
- [《深入解析 CSS》](https://book.douban.com/subject/35021471/)：新近较好的 CSS 基础与进阶书籍，有大量工作细节补充
- [《CSS 揭秘》](https://book.douban.com/subject/26745943/)：重点书籍，CSS 书籍瑰宝！！！

其他优秀书籍：

```txt
基础类：以下三本都是零基础读物，零基础时选择任意一本即可
《《HTML & CSS 设计与构建网站》》
《Head First HTML 与 CSS》第2版
《HTML5 与 CSS3 基础教程》第8版
《CSS 设计指南》

提升类：
《精通 CSS》第 3 版：不推荐，翻译不佳，内容与《深入解析 CSS》重合
《CSS 实战手册》第四版：不推荐，内容与《深入解析 CSS》重合，若有第五版可入手
《CSS 禅意花园》：不推荐，内容偏设计，非程序员读物，且时代较为久远
《CSS 世界》：可阅读，深入 CSS 的一本书，但是作者行文风格较为特殊
《CSS 选择器世界》：可阅读，内容较好，不过只深入讲了选择器
```

### JavaScript

**基础语法与 DOM 编程**：

- [《JavaScript 高级程序设计》第 4 版](https://book.douban.com/subject/35175321/)：红宝书，最好的 JS 入门书籍之一
- [《JavaScript 语言精髓与编程实践（第 3 版）》](https://book.douban.com/subject/35085910/)：国内非常深入优秀的 JS 书籍
- [《深入理解 ECMAScript6》](https://book.douban.com/subject/27072230/)：很好的 ES6 书籍
- [《ECMAScript6 入门》第 3 版](https://book.douban.com/subject/27127030/)：很好的 ES6 书籍
- [《JavaScript 权威指南》第 7 版](https://book.douban.com/subject/35396470/)：即犀牛书，JS 的百科全书，与红宝书冲突过多

其他优秀书籍，可以不看：

```txt
HTML与CSS：
《HTML 5与CSS 3核心技法》：彩色书籍，推荐作为零基础入门使用

JavaScript
《JavaScript编程精解》第3版：佳作《Eloquent JavaScript》，深入浅出，整体偏基础，翻译不佳。
《JavaScript语言精粹》修订版：即蝴蝶书，短小精悍，附录中对JS语言糟粕的汇总值得一看！但大多问题已被ES6相关书籍总结。

DOM：
《JavaScript DOM 编程艺术》第 2 版：内容极简，适合零基础入门
《HTML5 秘籍（第 2 版）》：内容较好，推荐学习
《锋利的 jQuery》第 2 版：适合学习jQuery时一看
《JavaScript&jQuery交互式Web前端开发》：适合学习使用jQuery制作优秀的交互式网站

不推荐：
《Head First JavaScript程序设计》：零基础入门书籍，较老且与《HTML 5与CSS 3核心技法》冲突
《JavaScript编程全解》-井上诚一郎 ：不推荐，内容全面详细，但是被《红宝书》完全替代
《HTML5权威指南》：不推荐，与 《HTML5 秘籍》冲突
```

**JavaScript 提升**：

- [《你不知道 JavaScript》上卷+中卷](https://book.douban.com/subject/26351021/)：笔者认为目前最好的 JS 深入书籍之一
- [《JavaScript 忍者秘籍》第 2 版](https://book.douban.com/subject/30143702/)：对函数的讲解：闭包、重载、柯里化化讲解极好
- [《JavaScript 核心技术开发解密》](https://book.douban.com/subject/30190189/)：短小精悍的介绍了一些重点

其他优秀书籍：

```txt
《Effective JavaScript》：内容被红宝书覆盖
《JavaScript面向对象编程指南（第2版）》：部分内容被红宝书覆盖，后半部分的设计模式等内容可以看其他书籍
```

**框架**：

- [《Webpack 实战：入门、进阶与调优》](https://book.douban.com/subject/34430881/)
- [《深入浅出 Vue.js》](https://book.douban.com/subject/32581281/)
- [《Vue.js 应用测试》](https://book.douban.com/subject/34998070/)
- [《深入 React 技术栈》](https://book.douban.com/subject/26918038/)
- [《深入浅出 React 和 Redux》](https://book.douban.com/subject/27033213/)
- [《React 状态管理与同构实战》](https://book.douban.com/subject/30290509/)

**综合提升**：

- [《现代前端技术解析》](https://book.douban.com/subject/27021790/)：前端目前技术趋势的汇总，适合茶余饭后简单阅读。
- [《高效前端：Web 高效编程与优化实践》](https://book.douban.com/subject/30170670/)
- [《高性能 JavaScript》](https://book.douban.com/subject/5362856/)
- [《Web 性能权威指南》](https://book.douban.com/subject/25856314/)
- [《了不起的 JavaScript 工程师：从前端到全端高级进阶》](https://book.douban.com/subject/34788884/)
- [《JavaScript 设计模式与开发实践》](https://book.douban.com/subject/26382780/)
- [《JavaScript 模式》](https://book.douban.com/subject/11506062/)
- [《jQuery 技术内幕》](https://book.douban.com/subject/25823709/):虽然 jQeury 现在应用面越来越窄，但其内部的实现思想仍可一看

其他优秀书籍：

```txt
《编写可维护的 JavaScript》：不推荐，现在ESLint等工具已经成熟。
```

### Node

- [overnote 笔记](https://github.com/overnote/over-javascript/tree/master/04-NodeJS)：市面上的入门书籍太过时，还是直接看本笔记吧 o(╯□╰)o
- [《Node.js 设计模式（第 2 版）》](https://book.douban.com/subject/30159269/)：质内容上乘，但推荐看英文原版
- [《深入浅出 Node.js》](https://book.douban.com/subject/25768396/)：Node 书籍的集大成者，部分内容已过时，但仍然值得精读
- [《Node.js:来一打 C++扩展》](https://book.douban.com/subject/30247892/)：适合学习开发扩展使用

### 桌面开发

- [《Electron 跨平台开发实战》](https://book.douban.com/subject/34838092/)
- [《Electron 实战：入门、进阶与性能优化》](https://book.douban.com/subject/35069275/)

### 图形学、canvas 等

- [《HTML5+JavaScript 动画基础》](https://book.douban.com/subject/24744218/)：目前最好的动画书籍
- [《HTML5 Canvas 核心技术》](https://book.douban.com/subject/24533314/)：目前最好的 canvas 书籍
- [《WebGL 编程指南》](https://book.douban.com/subject/25909351/)
- [《Three.js 开发指南》](https://book.douban.com/subject/26349497/)

## 附

**OverNote**地址：<https://github.com/overnote>  
**笔者的地址**：<https://github.com/ruyuejun>

**OverNote 分类**：

- [Golang](https://github.com/overnote/over-golang)：详尽的 Go 领域笔记：Go 语法、Go 并发编程、GoWeb 编程、Go 微服务等
- [大前端](https://github.com/overnote/over-javascript)：包含 JavaScript、Node.js、vue/react、微信开发、Flutter 等大前端技术
- [数据结构与算法](https://github.com/overnote/over-algorithm)：以 C/Go 实现为主记录数据结构与算法的笔记
- [服务端架构](https://github.com/overnote/over-server)：分布式与微服务笔记，附 Nginx、Mysql、Redis 等常用服务端技术
- [Python 与机器学习](https://github.com/overnote/over-python)：Python 相关笔记，完善中
- [cs](https://github.com/overnote/over-cs)：计算机组成原理、操作系统、计算机网络、编译原理基础学科笔记
- [大数据](https://github.com/overnote/over-bigdata)：大数据笔记，完善中
- [Flutter](https://github.com/overnote/over-flutter)：完善中

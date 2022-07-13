# 01-Nestjs 框架基础

## 一 Nest 简介

Nest 是使用 TypeScript 开发的 Node 服务端框架，其中文文档地址为：<https://docs.nestjs.cn/>。

Nest 的设计灵感来源于 Angular，其默认内核是 Express（可切换为 fastify）。与 Express、Koa 不同，Nest 具备了大量企业级开发特性，这些特性往往与 Java 中的 Spring 框架开发思想相似：

- 基于 TypeScript 语言开发，具备类型校验功能，也有更便利的语法联想，适合大型工程项目
- 具备依赖注入（DI）、控制反转（IOC）功能，解耦了业务代码
- 提供了大量 cli 工具命令与第三方模块，开发起来相对方便
- 支持函数式、面向对象、函数式响应编程等范式

Express 与 Koa 适合小型项目，如个人博客等，但是其约定很差，项目格式会因为不同开发者的个人风格而千奇百怪，阿里的 egg 虽然也做了约束，但是仍然只适合对项目做了普通约束，他们都是只适合作为上层框架的底层框架而存在。

Nest 借鉴了 Spring、Anular 的设计思想， 是 NodeJS 真正意义上的第一个 Web 框架，本质上 Nest 解决的是：Express、Koa 这些底层框架在开发时遇到的项目架构问题，即：高效性、可扩展、可靠性。

## 二 Nest 初步使用

### 2.1 环境搭建

```txt
# 环境要求
node -v         # v12.10.0
npm -v          # 6.10.3

# 安装 nest 脚手架
npm i -g @nestjs/cli

# 创建 nest 项目
nest new demo

# 启动
cd demo
npm run start:dev           # :参数为启动形式，:dev 支持热重启

# 访问
http://localhost:3000
```

### 2.2 目录分析

```txt
src
├── main.ts                 # 入口：使用 NestFactory 创建了实例
├── app.module.ts           # 应用程序的根模块
├── app.controller.ts       # 带有单个路由的基本控制器示例
├── app.controller.spec.ts  # 具备拦截功能
├── app.service.ts          # 服务层示例
```

nest 项目是由 ts-node 运行的，可以在开发时节省编译 .ts 的过程，其目录是按照业务模块进行划分（module），比如`user.module.ts`，`order.module.ts`，在每个模块下进行控制层、服务层的开发。

注意：
**nest 的工厂管理了大量的模块（module），当使用到该模块时，直接取用即可，由 nest 框架自己负责注入，而无需开发者自己手动去 new。**，这就是 Java 的 Web 框架 Spring 的核心思想。

### 2.3 nest cli 命令使用

nest 无需手动创建目录，并为目录中的 controller、service、module 添加依赖关系，而是使用 cli 命令即可自动完成上述功能：

```txt
# 创建模块
nest g mo user          # g 即 generator，mo 是 module 的缩写

# 在模块基础上创建控制层
nest g co user          # co 是 controller 的缩写

# 在模块基础上创建服务层
nest g s user           # s 是 service 的缩写
```

贴士：`nest --help` 可以查看缩写规范。

### 2.3 在 module 中注册控制器与服务

在 Nestjs 中，所有的 controller 和 service 都要在对应的 module 中注册：

```ts
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 三 控制层

### 3.1 路由

Nestjs 路由不是集中式管理，而是分散在 controller 中。如图所示：

![控制器](../images/nest/01.png)

控制器使用了大量请求相关的装饰器来实现业务：

```ts
import { Controller, Get } from '@nestjs/common'

import { CatsService } from './cats.service'

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  // query 参数：自动解析参数
  @Get('demo1')
  demoA(@Query() query: Record<string, any>) {
    console.log('query:', query)
    return {}
  }

  // 多个参数
  @Get('demo2')
  demoB(@Query() { uid, name }): string {
    console.log(uid, name)
    return {}
  }

  // param 参数
  @Get('demo3/:uid')
  demoC(@Param() param: { uid: number }) {
    console.log('uid:', param.uid)
    return {}
  }

  // body 参数：这里如果前端传递了非 dto 属性，也是被接收到了。因为 TS 不严格，只在开发时检查！
  // dto 层主要是在开发阶段进行前端数据校验，其类型如下：
  //   export class CreateDemoDto implements Demo {
  //     uid: number
  //     name: string
  //     username: string
  //     password: string
  // }
  @Post('demo4')
  demoE(@Body() demo: CreateDemoDto) {
    console.log('demo:', demo)
    return {}
  }
}
```

如果需要在所有请求之前加上 prefix，可以在 main.ts 中直接设置 GlobalPrefix：

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')
  await app.listen(3000)
}
bootstrap()
```

除了使用 @Get 装饰器，我们还可以使用其它 HTTP 方法装饰器。比如：@Put(), @Delete(), @Patch(), @Options(), @Head(), and @All()，注意 All 并不是 HTTP 的方法，而是 Nest 提供的一个快捷方式，表示接收任何类型的 HTTP 请求。

Nest 支持基于模式的路由规则匹配，比如 `*` 表示匹配任意的字母组合：

```ts
// 将匹配 abcd, ab_cd, abecd 等规则
@Get('ab*cd')
```

匹配规则如下：

- `*` 匹配任意数量的任意字符
- `?` 匹配任意单个字符
- `[abc]` 匹配方括号中的任意一个字符
- `[a-z]` 匹配字母、数字区间

贴士：路由的注册顺序与控制器类中的方法顺序相关，如果你先装饰了一个 cats/:id 的路由，后面又装饰了一个 cats 路由。

### 3.2 请求

请求对象包括：

```ts
@Request() req
@Response() res
@Next() next
@Session() req.session
@Param(key?: string) req.params / req.params[key]
@Body(key?: string) req.body / req.body[key]
@Query(key?: string) req.query / req.query[key]
@Headers(name?: string) req.headers / req.headers[name]
```

示例：

```ts
// http://localhost:3000/?username=zs
@Get()
getHello(@Query() q: String): string {
    console.log(q)  // { username: 'zs' }
    return this.appService.getHello();
}
```

### 3.3 响应对象

响应的默认状态码是 200，POST 则是 201，可以采用下面的方式指定响应：

- 内置方法：推荐该方式。如果返回一个 js 对象或者数据会自动序列化 `json`，如果是字符串则不会序列化。可以使用@HttpCode()装饰器改变
- 指定框架：可以使用`@Res()`装饰器装饰响应对象，这样可以使用 `Express` 的方式处理响应： `res.status(200).send()`

使用装饰器 @HttpCode(204) 来指定处理器级别的 默认 HttpCode 为 204 示例：

```ts
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

可以使用 `@Header()` 来设置自定义的请求头，也可以使用 `response.header()` 设置:

```ts
@Post()
@Header('Cache-Control', 'none')
create() {
return 'This action adds a new cat';
}
```

## 四 服务层

在 MVC 模式中，controller 通过 model 获取数据。对应的，在 Nestjs 中，controller 负责处理传入的请求，并调用对应的 service 完成业务处理，返回对客户端的响应。service 可以看做夹在 controller 和 model 之间的一层，在 service 调用 DAO（在 Nestjs 中是各种 ORM 工具或者自己封装的 DAO 层）实现数据库的访问，进行数据的处理整合。

```ts
import { Injectable } from '@nestjs/common'

@Injectable()
export class CatsService {
  getCat(id: string): string {
    return `This action returns ${id} cats`
  }
}
```

上面代码中通过 @Injectable() 定义了一个 service，这样你就可以在其他 controller 或者 service 中注入这个 service。

## 三 Nest 设计思想

### 3.1 依赖注入

控制反转 (Inversion of Control) 即事情的控制权转交给其他人，在编程中，程序的流程控制权发生了转变。在反转前：项目的代码决定程序的工作流程，并调用框架代码，在反转后，框架代码反而直接决定了程序的工作流程，并能调用项目代码。控制反转的核心作用就是：复用。

常见的控制反转实现方式有：

- 依赖注入（DI:Dependency Inject）：被动接收依赖对象，由容器将被依赖对象注入到对象内部；
- 依赖查询 (DL:Dependency Lookup)：主动查询依赖对象，由对象自身通过 服务定位器 查询被依赖对象；依赖查询也经常以服务定位器模式（Service Locator）的形式出现。

DI 是面向对象中控制反转最常见的实现方式，可以极大程度降低代码的耦合度。

下面是传统开发的示例：

```js
// 制作一两车子，需要引擎对象、车轮对象
class Engine {}
class Wheel {}

class Car {
    private engine: Engine
    private wheel: Wheel
    constructor() {
        this.engine = new Engine()
        this.wheel = new Wheel()
    }
    show(){
        console.log(this.engine)
        console.log(this.wheel)
    }
}

const car = new Car()
car.show()
```

此时 Car 类就依赖了 Engine 和 Wheel 类，构造器执行了：实例化、赋值两个动作。如果现在车子的引擎将使用另外一种类型：ElectricEngine，怎么办呢？很显然这里需要替换这个私有属性的类型。而当 Car 的子类很多，且对引擎有自己的使用方式时，这里替换起来就需要考虑更多了。也即：替换一个类，会导致大量的其他关联类产生问题。

现在我们来用 IoC 改造下：

```js
class Engine {}
class Wheel {}

class Container {
    private pool: Map<string, any>
    constructor() {
        this.pool = new Map()
    }
    resgisterr<T>(name: string, constructor: T) {
        this.pool.set(name, constructor)
    }
    get(name: string) {
        const Target = this.pool.get(name)
        if (!Target) {
            return null
        }
        return new Target()
    }
}

const c = new Container()
c.resgisterr('engine', Engine)
c.resgisterr('wheel', Wheel)

class Car {
    private engine: Engine
    private wheel: Wheel
    constructor() {
        this.engine = c.get('engine')
        this.wheel = c.get('wheel')
    }
    show() {
        console.log(this.engine)
        console.log(this.wheel)
    }
}

const car = new Car()
car.show()
```

从上看出，IoC 容器 Container 相当于 Car 以及与其关联的类 Engine、Wheel 之间的桥梁，Car 本身不再构造其属性的实例，而是交给了 Container，解除了其耦合。即 Car 对 Engine、Wheel 的实例化流程控制权交给了 Container。而容器中可以存储多种对象类型，那么我们在需要修改 Car 的属性类型时，只需要调整容器中输出的类型即可。

Nest 中，通过 @Injectable 装饰器向 IoC 容器注册：

```ts
// 在 service 层向 IoC 注册
import { Injectable } from '@nestjs/common'
import { Cat } from './interfaces/cat.interface'

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = []

  create(cat: Cat) {
    this.cats.push(cat)
  }

  findAll(): Cat[] {
    return this.cats
  }
}

// 在控制层注入 service 实例
import { Controller, Get, Post, Body } from '@nestjs/common'
import { CreateCatDto } from './dto/create-cat.dto'
import { CatsService } from './cats.service'
import { Cat } from './interfaces/cat.interface'

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto)
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll()
  }
}
```

CatsService 作为一个 privider，需要在 module 中注册，这样在该 module 启动时，会解析 module 中所有的依赖，当 module 销毁时，provider 也会一起销毁。

```ts
import { Module } from '@nestjs/common'
import { CatsController } from './cats/cats.controller'
import { CatsService } from './cats/cats.service'

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class ApplicationModule {}
```

### 3.2 模块化

模块化可以更加清晰地组织应用，Nest 通过 Module 装饰器把同一个分层下的代码组织成单独的模块，并能互相聚合称为一个功能完备的功能块：

```ts
import { Module } from '@nestjs/common'
import { CatsController } from './cats.controller'
import { CatsService } from './cats.service'
import { CoreModule } from './core/core.module'

@Module({
  imports: [CoreModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

### 3.3 AOP

面向切面编程（Aspect Oriented Programming，简称 AOP）主要是针对业务处理过程中的切面进行提取，在某个步骤和阶段进行一些操作，从而达到 DRY（Don't Repeat Yourself）的目的。AOP 对 OOP 来说，是一种补充，比如可以在某一切面中对全局的 Log、错误进行处理，这种一刀切的方式，也就意味着，AOP 的处理方式相对比较粗粒度。

在 Nestjs 中，AOP 分为下面几个部分（按顺序排列）：

- Middlewares
- Guards
- Interceptors (在流被操纵之前)
- Pipes
- Interceptors (在流被操纵之后)
- Exception filters (如果发现任何异常)

## 参考

<https://zhuanlan.zhihu.com/p/73862674>

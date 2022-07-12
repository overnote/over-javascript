class Engine {}
class Wheel {}
class ElectricEngine {}

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
c.resgisterr('electricEngine', ElectricEngine)

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

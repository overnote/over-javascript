interface Option<T> {
    flatMap<U>(f: (value: T) => None): None
    flatMap<U>(f: (value: T) => Option<U>): Option<U>
    getOrElse(value: T): T
}

class Some<T> implements Option<T> {
    constructor(private value: T) {}

    flatMap<U>(f: (value: T) => None): None
    flatMap<U>(f: (value: T) => Some<U>): Some<U>

    flatMap<U>(f: (value: T) => Option<U>): Option<U> {
        return f(this.value)
    }

    getOrElse(value: T): T {
        throw new Error('Method not implemented.')
    }
}

class None implements Option<never> {
    flatMap(): None {
        return this
    }

    getOrElse<U>(value: U): U {
        return value
    }
}

function createOption<T>(value: null | undefined): None
function createOption<T>(value: T): Some<T>
function createOption<T>(value: T): Option<T> {
    if (value === null) {
        return new None()
    }
    return new Some(value)
}

let res = createOption(6) // Some<number>
    .flatMap((n) => createOption(n * 3)) // Some<number>
    .flatMap((n) => new None()) //None
    .getOrElse(7) // 7

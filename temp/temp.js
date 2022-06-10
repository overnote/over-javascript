class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

let p = new Point(0, 0)
console.log(p.x)
p.x = 11

console.log(p.x)

class GuaPoint extends GuaObject {
    // 表示二维点的类
    constructor(x, y) {
        super()
        this.x = x
        this.y = y
    }

    static subtract(p1, p2) {
        return new GuaPoint(p1.x - p2.x, p1.y - p2.y)
    }

    translate(delta) {
        const {x, y} = delta
        this.x += x
        this.y += y
    }
}

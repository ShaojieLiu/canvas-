class GuaCanvas extends GuaObject {
    constructor(selector) {
        super()
        let canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.eles = []
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.bytesPerPixel = 4
        // this.pixelBuffer = this.pixels.data
    }

    render() {
        // 执行这个函数后, 才会实际地把图像画出来
        // ES6 新语法, 取出想要的属性并赋值给变量, 不懂自己搜「ES6 新语法」
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }

    clear(color=GuaColor.white()) {
        // color GuaColor
        // 用 color 填充整个 canvas
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, color)
            }
        }
        // this.render()
    }

    _setPixel(x, y, color) {
        // color: GuaColor
        // 这个函数用来设置像素点, _ 开头表示这是一个内部函数, 这是我们的约定
        // 浮点转 int
        x = int(x)
        y = int(y)
        // 用座标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        let {r, g, b, a} = color
        // 一个像素 4 字节, 分别表示 r g b a
        p[i] = r
        p[i+1] = g
        p[i+2] = b
        p[i+3] = a
    }

    drawPoint(point, color=GuaColor.black()) {
        // point: GuaPoint
        let {w, h} = this
        let p = point
        if (p.x >= 0 && p.x <= w) {
            if (p.y >= 0 && p.y <= h) {
                this._setPixel(p.x, p.y, color)
            }
        }
    }

    save() {
        let {context} = this
        const imageData = context.getImageData(0, 0, this.w, this.h)
        this.lastData = new Uint8ClampedArray(imageData.data)
    }

    restore() {
        if (this.lastData) {
            this.clear()
            this.pixels.data.set(this.lastData)
        }
    }

    listenMouse() {
        const c = this.canvas
        // const {movingLine, movingDraw, movingRect, downPointer, upPointer} = this
        const that = this
        c.addEventListener('mousedown', (ev) => {
            this.save()
            const x = ev.offsetX
            const y = ev.offsetY
            this.downing = true
            this.lastPoint = GuaPoint.new(x, y)

            const tool = window.current.tool
            let downFunc = this.downDict[tool];
            downFunc = downFunc || (() => {});
            execFunArr(this, downFunc, ev)
            // downFunc = downFunc.bind(that)
            // downFunc(ev)
        })
        c.addEventListener('mousemove', ev => {
            const x = ev.offsetX
            const y = ev.offsetY
            this.currentPoint = GuaPoint.new(x, y)

            const tool = window.current.tool
            let moveFunc = this.moveDict[tool];
            moveFunc = moveFunc || (() => {});
            moveFunc = moveFunc.bind(that)

            if (this.downing) {
                moveFunc(ev)
                this.render()
            }
        })
        document.body.addEventListener('mouseup', ev => {

            const tool = window.current.tool
            let upFunc = this.upDict[tool];
            upFunc = upFunc || (() => {});
            upFunc = upFunc.bind(that)
            upFunc(ev)

            if (this.currentShape) {
                //const copyEle = Object.assign({}, this.currentShape)
                this.addElement(this.currentShape)
                this.currentShape = null
            }

            this.downing = false
            this.lastPoint = null
            this.currentPoint = null
        })
    }

    drawLine(p1, p2, color=GuaColor.black()) {
        const pointArr = []
        const num = getMaxNum(p1, p2)
        for(let i = 0; i < num; i++) {
            const x = p1.x + (p2.x - p1.x) * i / num
            const y = p1.y + (p2.y - p1.y) * i / num
            const p = GuaPoint.new(x, y)
            pointArr.push(p)
        }
        pointArr.map(p => this.drawPoint(p, color))
        // log(pointArr, num)
    }

    drawRect(upperLeft, size, fillColor='', borderColor=GuaColor.black()) {
        // upperLeft: GuaPoint, 矩形左上角座标
        // size: GuaSize, 矩形尺寸
        // fillColor: GuaColor, 矩形的填充颜色, 默认为空, 表示不填充
        // borderColor: GuaColor, 矩形的的边框颜色, 默认伪黑色
        // 0    1
        // 2    3
        const p0 = upperLeft
        const p1 = GuaPoint.new(p0.x + size.w, p0.y)
        const p2 = GuaPoint.new(p0.x, p0.y + size.h)
        const p3 = GuaPoint.new(p0.x + size.w, p0.y + size.h)
        // 边框
        const lineParaArr = [
            [p0, p1],
            [p1, p3],
            [p3, p2],
            [p2, p0],
        ]
        // 画填充
        const fillParaArr = []
        const h = size.h
        for (let i = 1; i < h; i++) {
            const pStart = GuaPoint.new(p0.x + 1, p0.y + i)
            const pEnd = GuaPoint.new(p1.x, p1.y + i)
            fillParaArr.push([pStart, pEnd])
        }
        fillColor && fillParaArr.map(para => this.drawLine(...para, fillColor))
        borderColor && lineParaArr.map(para => this.drawLine(...para, borderColor))
    }

    __debug_draw_demo() {
        // 这是一个 demo 函数, 用来给你看看如何设置像素
        // ES6 新语法, 取出想要的属性并赋值给变量, 不懂自己搜「ES6 新语法」
        let {context, pixels} = this
        // 获取像素数据, data 是一个数组
        let data = pixels.data
        // 一个像素 4 字节, 分别表示 r g b a
        for (let i = 0; i < data.length; i += 4) {
            let [r, g, b, a] = data.slice(i, i + 4)
            r = 200
            a = 50
            data[i] = r
            data[i+3] = a
        }
        context.putImageData(pixels, 0, 0)
    }
}

const execFunArr = function(self, funArr, ev) {
    if (funArr instanceof Array) {
        funArr.map(fun => fun.call(self, ev))
    } else {
        funArr.call(self, ev)
    }
}



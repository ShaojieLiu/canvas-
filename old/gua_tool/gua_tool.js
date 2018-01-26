/**
 * Created by liushaojie on 2017/9/29.
 */
// DONE: modify line and draw into a class like rect
const movingLine = function(ev) {
    this.restore()
    const {fillColor, strokeColor, stage} = window.current
    const x = ev.offsetX
    const y = ev.offsetY
    const p = GuaPoint.new(x, y)
    const param = {
        stage,
        pointArr: [this.lastPoint, p],
        strokeColor,
    }
    this.currentShape = GuaPath.new(param)
    this.currentShape.render()
    //this.drawLine(this.lastPoint, p, strokeColor)
}

const movingDraw = function(ev) {
    const {fillColor, strokeColor} = window.current
    const x = ev.offsetX
    const y = ev.offsetY
    const p = GuaPoint.new(x, y)
    if (this.currentShape) {
        this.currentShape.push(p)
    } else {
        const param = {
            stage: this,
            pointArr: [this.lastPoint, p],
            strokeColor,
        }
        this.currentShape = GuaPath.new(param)
    }
    //log(this.currentShape)
    this.currentShape.render()
    //this.drawLine(this.lastPoint, p, strokeColor)
    this.lastPoint = p
}

const movingRect = function(ev) {
    this.restore()
    const {fillColor, strokeColor} = window.current
    const p1 = this.lastPoint
    const x1 = p1.x
    const y1 = p1.y
    const x2 = ev.offsetX
    const y2 = ev.offsetY
    const w = Math.abs(x1 - x2)
    const h = Math.abs(y1 - y2)
    const x0 = x1 < x2 ? x1 : x2
    const y0 = y1 < y2 ? y1 : y2

    const p0 = GuaPoint.new(x0, y0)
    const size = GuaSize.new(w, h)

    this.currentShape = GuaRect.new({
        stage: this,
        position: p0,
        size,
        fillColor,
        strokeColor,
    })
    this.currentShape.render()
    this.render()
    //this.drawRect(p0, size, fillColor, strokeColor)
}

const downPointer = function(ev) {
    const x = ev.offsetX
    const y = ev.offsetY
    const activeRect = this.eles.filter(rect => isPointInRect(rect, x, y)).slice(-1)[0]
    if (activeRect) {
        this.pointerActive = activeRect
        // const {position, size} = activeRect
        // const param = {
        //     position,
        //     size,
        //     fillColor: GuaColor.pink(),
        // }
        // this.tempShape = GuaRect.new(param)
        this.tempFillColor = activeRect.getFill()
        activeRect.setFill(GuaColor.pink())
        this.render()
    }
}

const upPointer = function(ev) {
    const activeRect = this.pointerActive
    activeRect && activeRect.upPointer && activeRect.upPointer.map(handle => handle(ev))
    activeRect.setFill(this.tempFillColor)
    this.pointerActive = null
    this.tempFillColor = null
    // this.tempShape = null
    // this.restore()
    this.render()
}

const downMover = function(ev) {
    const x = ev.offsetX
    const y = ev.offsetY
    this.movingElement = this.eles.filter(rect => isPointInRect(rect, x, y)).slice(-1)[0]
}

const movingMover = function(ev) {
    const {lastPoint, currentPoint, movingElement} = this
    const delta = GuaPoint.subtract(currentPoint, lastPoint)
    //log(movingElement)
    //this.restore()
    movingElement && movingElement.position.translate(delta)
    this.clear()
    this.render()
    this.lastPoint = currentPoint
}


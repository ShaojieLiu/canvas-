/**
 * Created by liushaojie on 2017/9/29.
 */
class GuaCanvasCtrl extends GuaCanvas {
    constructor(selector) {
        super(selector)
        this.init()
    }

    initTool() {
        this.downDict = {
            pointer: downPointer,
            mover: [downMover, downPointer],
        }
        this.moveDict = {
            mover: movingMover,
            line: movingLine,
            draw: movingDraw,
            rect: movingRect,
        }
        this.upDict = {
            pointer: upPointer,
            mover: upPointer,
        }
    }

    init() {
        this.initTool()
        window.current.stage = this
    }

    addElement(obj) {
        this.eles.push(obj)
    }

    render() {
        this.clear()
        this.eles.map(el => el.render())
        this.currentShape && this.currentShape.render()
        this.tempShape && this.tempShape.render()
        super.render()
    }


}
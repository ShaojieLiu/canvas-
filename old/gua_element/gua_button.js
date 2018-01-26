/**
 * Created by liushaojie on 2017/10/5.
 */

class GuaButton extends GuaRect {
    constructor(param) {
        super(param)
        this.canvas = param.canvas
        this.upPointer = []
    }
    static new(param) {
        const {fillColor, strokeColor, stage} = window.current
        const position = GuaPoint.new(10, 10)
        const size = GuaSize.new(50, 50)
        const defaultParam = {
            stage,
            position,
            size,
            fillColor,
            strokeColor,
        }
        const newParam = Object.assign({}, defaultParam, param)
        return new GuaButton(newParam)
    }
    addAction(handleClick) {
        this.upPointer.push(handleClick)
    }

}
/**
 * Created by liushaojie on 2017/9/29.
 */
class GuaRect extends GuaElement {
    constructor(param) {
        super()
        //const {stage, position, size, fillColor, strokeColor} = param
        //Object.assign(this, {stage, position, size, fillColor, strokeColor})
        Object.assign(this, param)
    }

    static is(rect) {
        return rect.position && rect.size
    }

    setFill(fillColor) {
        this.fillColor = fillColor
    }

    getFill() {
        return this.fillColor
    }

    render() {
        // this render mean to write the pixel data of this class into the cache of the canvas, but
        // you still need to use gua_canvas.render to render the cache.
        const {stage, position, size, fillColor, strokeColor} = this
        stage.drawRect(position, size, fillColor, strokeColor)
    }
}

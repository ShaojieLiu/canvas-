/**
 * Created by liushaojie on 2017/10/5.
 */

class GuaPath extends GuaElement{
    constructor(param) {
        super()
        this.stage = param.stage
        this.pointArr = param.pointArr
        this.strokeColor = param.strokeColor
    }
    push(p) {
        this.pointArr.push(p)
    }
    render() {
        const {pointArr, stage, strokeColor} = this
        const pairArr = getPairArr(pointArr)
        pairArr.map(pair => stage.drawLine(...pair, strokeColor))
    }
}

const getPairArr = arr => {
    const arr1 = arr.slice(0, -1)
    return arr1.map((p,i) => arr.slice(i, i + 2))
}

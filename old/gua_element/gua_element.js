/**
 * Created by liushaojie on 2017/9/29.
 */
class GuaElement extends GuaObject{
    constructor(param) {
        super()
        this.initProp(param)
    }
    initProp(param) {
        if (!param || !param.stage) {
            this.stage = window.current.stage
        }
    }
}

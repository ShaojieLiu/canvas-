/**
 * Created by liushaojie on 2017/9/27.
 */
class GuaToolBox extends GuaObject {
    constructor() {
        super()
        this.init()
        this.render()
        this.bind()
    }

    init() {
        window.current = {
            tool: '',
            strokeColor: {r: 0, g: 0, b: 0, a: 255},
            canvas: _e('#id-canvas'),
        }
        this.toolParams = [
            {
                icon: 'fa fa-3x fa-arrows',
                toolName: 'mover',
                type: 'setTool',
            }, {
                icon: 'fa fa-3x fa-hand-pointer-o',
                text: 'pointer',
                toolName: 'pointer',
                type: 'setTool',
            }, {
                icon: 'fa fa-3x fa-pencil',
                text: 'Pencil',
                toolName: 'draw',
                type: 'setTool',
            }, {
                icon: 'fa fa-3x fa-arrows-h',
                text: 'Line',
                toolName: 'line',
                type: 'setTool',
            }, {
                icon: 'fa fa-3x fa-square-o',
                text: 'Rect',
                toolName: 'rect',
                type: 'setTool',
            }, {
                diy: `<div class="toolBtn">
                          <div>填充</div>
                          <input class="radius" id="picker-fill" type="color"/>
                      </div>`,
                text: 'Color',
                toolName: 'color',
                type: 'popup',
            }, {
                diy: `<div class="toolBtn">
                          <div>边框</div>
                          <input class="radius" id="picker-stroke" type="color"/>
                      </div>`,
                text: 'Color',
                toolName: 'color',
                type: 'popup',
            }
        ]
        this.eles = this.toolParams.map(p => p.diy || template(p))
        this.dom = this.eles.join('')
    }

    bind() {
        const ps = this.toolParams
        const toolBtnDom = _es('.toolBox .toolBtn')
        const setTool = (dom, index) => {
            window.current.tool = ps[index].toolName
            toolBtnDom.map(dom => dom.classList.remove('active'))
            dom.classList.add('active')
        }
        const popup = () => {

        }
        toolBtnDom.map((dom, i) => {
            dom.addEventListener('click', (index => ev => {
                const type = ps[index].type
                const func = {
                    setTool,
                    popup,
                }[type]
                func(dom, index)
            })(i))
        })

        _e('#picker-stroke').addEventListener('change', ev => {
            window.current.strokeColor = ev.target.value.colorRgb()
        })

        _e('#picker-fill').addEventListener('change', ev => {
            window.current.fillColor = ev.target.value.colorRgb()
        })
    }

    render() {
        _e('.toolBox').insertAdjacentHTML('beforeend', this.dom)
    }
}

const template = (toolParam) => {
    return ` <span class='toolBtn'> <i class="${toolParam.icon}"></i></span>`
    //return ` <span class='toolBtn'> ${ toolParam.text } </span>`
}
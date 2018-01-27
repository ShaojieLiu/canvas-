class DrawBoard {
    constructor(div) {
	    this._initCanvas(div)
    }

    init(opt) {
        this._initState(opt)
        this._initBind()
    }

    _initCanvas(div) {
        this.w = div.clientWidth
        this.h = div.clientHeight
        let c = document.createElement('canvas')
        c.width = this.w
        c.height = this.h
        c.id = div.id + '-draw'
        div.appendChild(c)
        this.canvas = c
        this.ctx = c.getContext('2d')
    }

    _initState(opt) {
        this.penSize = opt.pen.size
        this.eraserSize = opt.eraser.w
        this.eraserIco = opt.eraser.ico
        this.maxStack = opt.maxStack
        
        this.tool = 'pen' // 'eraser' 'no'
        this.isDown = false
        this.color = '#f00'
        this.history = []
        this.last = null

        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'
    }

    _initBind() {
        this._mousedown = this._mousedown.bind(this)
        this._mousemove = this._mousemove.bind(this)
        this._mouseup = this._mouseup.bind(this)

        this.canvas.addEventListener('mousedown', this._mousedown)
        this.canvas.addEventListener('mousemove', this._mousemove)
        this.canvas.addEventListener('mouseup', this._mouseup)
        this.canvas.addEventListener('mouseleave', () => this.isDown = false)
    }

    _mousedown(ev) {
        this.isDown = true
        this._save()
        console.log('_mousedown', ev)

        let x = ev.offsetX
        let y = ev.offsetY
        this.last = {x, y}

        let func = {
            'pen': () => {},
            'eraser': () => {},
            'no': () => {},
        }[this.tool]

        func()
    }

    _mousemove(ev) {
        if (!this.isDown) {return}
        console.log('_mousemove')

        let x = ev.offsetX
        let y = ev.offsetY
        let p = {x, y}

        let func = {
            'pen': () => {
                this._draw(this.last, p)
            },
            'eraser': () => {
                this._eraser(this.last, p)
            },
            'no': () => {},
        }[this.tool]

        func()
        this.last = {x, y}
    }

    _mouseup() {
        this.isDown = false
    }

    _lineTo(last, p, color, width=1) {
        let {ctx} = this
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.moveTo(last.x, last.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
    }

    _draw(last, p) {
        let {ctx, color, penSize} = this
        ctx.globalCompositeOperation = 'source-over'
        this._lineTo(last, p, color, penSize)
    }

    _eraser(last, p) {
        let {ctx, eraserSize} = this
        ctx.globalCompositeOperation = 'destination-out'
        this._lineTo(last, p, '#00ff00', eraserSize)
    }

    setTool(tool) {
        if (-1 === ['pen', 'eraser', 'no'].indexOf(tool)) {return -1}
        if (tool === 'eraser') {
            console.log('er')
            this.canvas.style.cursor = `url(${this.eraserIco}), auto`
        }
        this.tool = tool
    }

    setColor(color) {
        this.color = color
    }

    _save() {
        let {history, maxStack} = this
        let image = this.ctx.getImageData(0, 0, this.w, this.h)
        history.push(image)
        if (history.length > maxStack) {
	        history.shift()
        }
    }

    undo() {
        let {ctx, w, h, history} = this
        if (history.length === 0) {
            console.log('no more stack')
            return
        }
        ctx.clearRect(0, 0, w, h)
        ctx.putImageData(history.pop(), 0, 0)
    }
    
    clear() {
	    let {ctx, w, h} = this
        this._save()
	    ctx.clearRect(0, 0, w, h)
    }
}

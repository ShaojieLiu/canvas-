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
        {
            this.eraser = {}
            let {type, w, h, ico} = opt.eraser
            Object.assign(this.eraser, {type, w, h, ico})
        }

        this.penSize = opt.pen.size
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
        this.canvas.addEventListener('mousedown', this._mousedown.bind(this))
        this.canvas.addEventListener('mousemove', this._mousemove.bind(this))
        this.canvas.addEventListener('mouseup', this._mouseup.bind(this))
        this.canvas.addEventListener('mouseleave', () => this.isDown = false)
    }

    _mousedown(ev) {
        this.isDown = true
        this._save()

        let x = ev.offsetX
        let y = ev.offsetY
        this.last = {x, y}
    }

    _mousemove(ev) {
        if (!this.isDown) {return}

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
        this.last = p
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

    _maxDis(last, p) {
        let xSub = p.x - last.x
        let ySub = p.y - last.y
        let x = Math.abs(xSub)
        let y = Math.abs(ySub)
        return {
            max: x > y ? x : y,
            xSub,
            ySub,
        }
    }

    _rectTo(last, p, color, w, h) {
        let {ctx} = this
        let {max, xSub, ySub} = this._maxDis(last, p)

        ctx.fillStyle = color
        for (let i = 0; i < max; i ++) {
            let ratio = i / max
            let x = last.x + ratio * xSub
            let y = last.y + ratio * ySub
            ctx.rect(x - w / 2, y - h / 2, w, h)
        }
        ctx.fill()
    }

    _draw(last, p) {
        let {ctx, color, penSize} = this
        ctx.globalCompositeOperation = 'source-over'
        this._lineTo(last, p, color, penSize)
    }

    _eraser(last, p) {
        let {ctx, eraser} = this
        let {type, w, h} = eraser
        ctx.globalCompositeOperation = 'destination-out'

        let func = {
            'circle': () => this._lineTo(last, p, 'white', w),
            'rectangle': () => this._rectTo(last, p, 'white', w, h),
        }[type]

        func()
    }

    setTool(tool) {
        if (-1 === ['pen', 'eraser', 'no'].indexOf(tool)) {return -1}
        if (tool === 'eraser') {
            let {ico, w, h} = this.eraser
            this.canvas.style.cursor = `url(${ico}) ${w / 2} ${h / 2}, auto`
        } else {
            this.canvas.style.cursor = 'auto'
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
            console.warn('no more stack')
            return -1
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

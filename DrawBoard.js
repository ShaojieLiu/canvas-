class canvasAdaptable {
    constructor() {
    
    }
    
	canvasAdapteDPR(canvas, width, height) {
        const _ctx = canvas.getContext('2d'),
            _gl = canvas.getContext('webgl');
        
        const pixelRatio = this.overwriteCtx(_ctx);
        canvas.width = pixelRatio * width;
        canvas.height = pixelRatio * height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        canvas.getContext = function(type) {
            switch (type) {
                case '2d':
                    return _ctx;
                
                case 'webgl':
                    return _gl;
                
                default:
                    return;
            }
        }
        
        return canvas;
    }
    
    overwriteCtx(ctx) {
        const pixelRatio = (function() {
            const backingStore = ctx.backingStorePixelRatio ||
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
            
            return (window.devicePixelRatio || 1) / backingStore;
        })();
        
        const forEach = function(obj, func) {
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    func(obj[p], p);
                }
            }
        };
        
        const  ratioArgs = {
            'fillRect': 'all',
            'clearRect': 'all',
            'strokeRect': 'all',
            'moveTo': 'all',
            'lineTo': 'all',
            'arc': [0,1,2],
            'arcTo': 'all',
            'bezierCurveTo': 'all',
            'isPointinPath': 'all',
            'isPointinStroke': 'all',
            'quadraticCurveTo': 'all',
            'rect': 'all',
            'translate': 'all',
            'createRadialGradient': 'all',
            'createLinearGradient': 'all'
        };
        
        if (pixelRatio === 1) { return 1 };
        
        forEach(ratioArgs, function(value, key) {
            ctx[key] = (function(_super) {
                return function() {
                    let i, len,
                        args = Array.prototype.slice.call(arguments);
                    
                    if (value === 'all') {
                        args = args.map(function(a) {
                            return a * pixelRatio;
                        });
                    }
                    else if (Array.isArray(value)) {
                        for (i = 0, len = value.length; i < len; i++) {
                            args[value[i]] *= pixelRatio;
                        }
                    }
                    
                    return _super.apply(this, args);
                };
            })(ctx[key]);
        });
        
        // Stroke lineWidth adjustment
        ctx.stroke = (function(_super) {
            return function() {
                this.lineWidth *= pixelRatio;
                _super.apply(this, arguments);
                this.lineWidth /= pixelRatio;
            };
        })(ctx.stroke);
        
        // Text
        //
        ctx.fillText = (function(_super) {
            return function() {
                const args = Array.prototype.slice.call(arguments);
                
                args[1] *= pixelRatio; // x
                args[2] *= pixelRatio; // y
                args[3] *= pixelRatio; // width
                
                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m * pixelRatio) + u;
                    }
                );
                
                _super.apply(this, args);
                
                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m / pixelRatio) + u;
                    }
                );
            };
        })(ctx.fillText);
        
        ctx.strokeText = (function(_super) {
            return function() {
                const args = Array.prototype.slice.call(arguments);
                
                args[1] *= pixelRatio; // x
                args[2] *= pixelRatio; // y
                
                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m * pixelRatio) + u;
                    }
                );
                
                _super.apply(this, args);
                
                this.font = this.font.replace(
                    /(\d+)(px|em|rem|pt)/g,
                    function(w, m, u) {
                        return (m / pixelRatio) + u;
                    }
                );
            };
        })(ctx.strokeText);
        
        return pixelRatio;
    }
}

class DrawBoard extends canvasAdaptable {
    constructor(div, adapteDPR) {
        super()
	    this._initCanvas(div, adapteDPR)
    }

    init(opt) {
        this._initState(opt)
        this._initBind()
    }

    _initCanvas(div, adapteDPR=true) {
        this.w = div.clientWidth
        this.h = div.clientHeight
        let c = document.createElement('canvas')
	    c.width = this.w
	    c.height = this.h
        if (adapteDPR) {
            c = this.canvasAdapteDPR(c, this.w, this.h)
            this.w = c.width
            this.h = c.height
        }
        
        c.id = div.id + '-draw'
        div.appendChild(c)
        this.canvas = c
        this.ctx = c.getContext('2d')
	    this.pageX = c.offsetLeft
	    this.pageY = c.offsetTop
    }

    _initState(opt) {
        {
            this.eraser = {}
            let {type, w, h, offsetX, offsetY, ico} = opt.eraser
            Object.assign(this.eraser, {type, w, h, ico, offsetX, offsetY})
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
        this.canvas.addEventListener('touchstart', this._mousedown.bind(this))
        this.canvas.addEventListener('mousemove', this._mousemove.bind(this))
        this.canvas.addEventListener('touchmove', this._mousemove.bind(this))
        this.canvas.addEventListener('mouseup', this._mouseup.bind(this))
        this.canvas.addEventListener('touchend', this._mouseup.bind(this))
        this.canvas.addEventListener('mouseleave', this._mouseup.bind(this))
    }
    
    _adaptTouch(ev) {
        if (ev.touches) {
            return ev.touches[0]
        } else {
	        return ev
        }
    }

    _mousedown(ev) {
        // console.log(ev)
        this.isDown = true
        this._save()
	    this._mousemove(ev)
    }

    _mousemove(ev) {
        if (!this.isDown) {return}
	    ev = this._adaptTouch(ev)

        let x = ev.pageX - this.pageX
        let y = ev.pageY - this.pageY
        let p = {x, y}

        let func = {
            'pen': () => {
                this._draw(this.last || p, p)
            },
            'eraser': () => {
                this._eraser(this.last || p, p)
            },
            'no': () => {},
        }[this.tool]

        func()
        this.last = p
    }

    _mouseup() {
        this.isDown = false
        this.last = null
    }

    _lineTo(last, p, color, width=1) {
        let {ctx} = this
	    ctx.beginPath()
	    ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = width
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
            max: x > y ? x : y || 1,
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
	    // ctx.globalCompositeOperation = 'source-over'
	    ctx.beginPath()
	
	    let func = {
            'circle': () => this._lineTo(last, p, 'white', w),
            'rectangle': () => this._rectTo(last, p, 'white', w, h),
        }[type]
        func()
    }

    setTool(tool) {
        if (-1 === ['pen', 'eraser', 'no'].indexOf(tool)) {return -1}
        if (tool === 'eraser') {
            let {ico, offsetX, offsetY} = this.eraser
            this.canvas.style.cursor = `url(${ico}) ${offsetX} ${offsetY}, auto`
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
        // ctx.fill()
    }
    
    clear() {
	    let {ctx, w, h} = this
        this._save()
	    ctx.clearRect(0, 0, w, h)
    }
}

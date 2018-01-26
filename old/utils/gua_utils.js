const log = console.log.bind(console)
const int = Math.floor

const _e = (sel) => document.querySelector(sel)
const _es = (sel) => Array.from(document.querySelectorAll(sel))

String.prototype.colorRgb = function(){
    var sColor = this.toLowerCase();
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i=1; i<4; i+=1) {
                sColorNew += sColor.slice(i, i+1).concat(sColor.slice(i, i+1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i=1; i<7; i+=2) {
            sColorChange.push(parseInt("0x"+sColor.slice(i, i+2)));
        }
        let color = {
            r: sColorChange[0],
            g: sColorChange[1],
            b: sColorChange[2],
            a: 255,
        }
        return color;
    }
    return sColor;
};

const getLength = (p1, p2) => {
    const dx = int(Math.abs(p2.x - p1.x))
    const dy = int(Math.abs(p2.y - p1.y))
    return Math.sqrt(dx * dx + dy * dy)
}

const getMaxNum = (p1, p2) => {
    const dx = int(Math.abs(p2.x - p1.x))
    const dy = int(Math.abs(p2.y - p1.y))
    return dx > dy ? dx : dy
}

const isPointInRect = (rect, x, y) => {
    return GuaRect.is(rect) && isPointInside({x, y}, rect.position, rect.size)
}
const isPointInside = (point, leftUpper, size) => {
    const {x, y} = point
    const {w, h} = size
    const x1 = leftUpper.x
    const y1 = leftUpper.y
    const x2 = x1 + w
    const y2 = y1 + h
    return x > x1 && x < x2 && y > y1 && y < y2
}
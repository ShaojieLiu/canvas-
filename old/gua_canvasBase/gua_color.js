class GuaColor extends GuaObject {
    // 表示颜色的类
    constructor(r, g, b, a) {
        super()
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
    // 常见的几个颜色
    static black() {
        return this.new(0, 0, 0, 255)
    }
    static white() {
        return this.new(255, 255, 255, 255)
    }
    static red() {
        return this.new(255, 0, 0, 255)
    }
    static pink() {
        return this.new(255, 0, 0, 100)
    }

    static fromHex(str) {
        var sColor = str.toLowerCase();
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
            return this.new(...sColorChange, 255);
        }
        //return sColor;
    }
}

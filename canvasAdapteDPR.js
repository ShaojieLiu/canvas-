var canvasAdapteDPR = function(canvas, width, height) {
	const _ctx = canvas.getContext('2d'),
				_gl = canvas.getContext('webgl');

	const pixelRatio = overwriteCtx(_ctx);
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

function overwriteCtx(ctx) {
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
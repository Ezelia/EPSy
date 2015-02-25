var EPSY;
(function (EPSY) {
    (function (utils) {
        (function (math) {
            function toRad(deg) {
                return Math.PI * deg / 180;
            }
            math.toRad = toRad;

            function isNumber(i) {
                return typeof i === 'number';
            }
            math.isNumber = isNumber;

            function isInteger(num) {
                return num === (num | 0);
            }
            math.isInteger = isInteger;

            function frandom(min, max) {
                return Math.random() * (max - min) + min;
            }
            math.frandom = frandom;

            function irandom(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }
            math.irandom = irandom;

            function normalize(vector) {
                var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

                vector.x /= length;
                vector.y /= length;
            }
            math.normalize = normalize;
        })(utils.math || (utils.math = {}));
        var math = utils.math;
    })(EPSY.utils || (EPSY.utils = {}));
    var utils = EPSY.utils;
})(EPSY || (EPSY = {}));
var EPSY;
(function (EPSY) {
    (function (utils) {
        (function (_obj) {
            function clone(obj, props) {
                var clone = {};
                this.extend(clone, obj);
                return clone;
            }
            _obj.clone = clone;
            function extend(obj, config) {
                for (var prop in config) {
                    if (config.hasOwnProperty(prop)) {
                        obj[prop] = config[prop];
                    }
                }
            }
            _obj.extend = extend;

            function recursiveExtend(obj, config, exceptions) {
                exceptions = exceptions || [];
                for (var prop in config) {
                    if (config.hasOwnProperty(prop)) {
                        if (exceptions.indexOf(prop) > -1) {
                            obj[prop] = config[prop];
                        } else {
                            if (typeof config[prop] === 'object') {
                                this.recursiveExtend(obj[prop], config[prop], exceptions);
                            } else {
                                obj[prop] = config[prop];
                            }
                        }
                    }
                }
            }
            _obj.recursiveExtend = recursiveExtend;
            function recursiveExtendInclusive(obj, config, whitelist) {
                if (!whitelist || !whitelist.length || whitelist.length <= 0)
                    return;

                for (var prop in config) {
                    if (whitelist.indexOf(prop) >= 0) {
                        if (typeof config[prop] === 'object') {
                            if (!obj[prop])
                                obj[prop] = {};
                            this.recursiveExtend(obj[prop], config[prop]);
                        } else {
                            obj[prop] = config[prop];
                        }
                    }
                }
            }
            _obj.recursiveExtendInclusive = recursiveExtendInclusive;
        })(utils.obj || (utils.obj = {}));
        var obj = utils.obj;
    })(EPSY.utils || (EPSY.utils = {}));
    var utils = EPSY.utils;
})(EPSY || (EPSY = {}));
var EPSY;
(function (EPSY) {
    EPSY.EmitterParams = ['id', 'border', 'duration', 'emissionRate', 'totalParticles', 'xFactor', 'aFactor', 'xEquation', 'yEquation', 'posTransform', 'zIndex'];

    var Emitter = (function () {
        function Emitter(system) {
            this.id = (Math.random() * 1e20).toString(36);
            this.settings = new EPSY.EmitterEntity();
            this.time = Date.now();
            this._totalParticles = 0;
            this.emissionRate = 0;
            this.allOrNone = false;
            this.aFactor = { x: 0, y: 0 };
            this.xFactor = { x: 0, y: 0 };
            this._xEqName = '';
            this._yEqName = '';
            this.active = false;
            this.duration = 0;
            this.cycles = Infinity;
            this._particlePool = [];
            this._particleCount = 0;
            this._particleIndex = 0;
            this._elapsed = 0;
            this._curCycle = 0;
            this._emitCounter = 0;
            this.border = { top: 100, left: 100, bottom: 100, right: 100 };
            this.recyclable = [];
            this._baseSystem = EPSY.utils.obj.clone(system, ['texture']);
            this.load(system);
        }
        Object.defineProperty(Emitter.prototype, "zIndex", {
            get: function () {
                if (this.container) {
                    return this.container.__z || 0;
                }

                return 0;
            },
            set: function (value) {
                if (this.container) {
                    this.container.__z = ~~value;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Emitter.prototype, "xEquation", {
            get: function () {
                return this._xEqName;
            },
            set: function (value) {
                if (typeof Math[value] == 'function') {
                    this._xEqName = value;
                    this._xEquation = Math[value];
                } else {
                    this._xEqName = '';
                    this._xEquation = undefined;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Emitter.prototype, "yEquation", {
            get: function () {
                return this._yEqName;
            },
            set: function (value) {
                if (typeof Math[value] == 'function') {
                    this._yEqName = value;
                    this._yEquation = Math[value];
                } else {
                    this._yEqName = '';
                    this._yEquation = undefined;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Emitter.prototype, "posTransform", {
            get: function () {
                if (!this._posTransform)
                    return undefined;

                var code = this._posTransform.toString();
                return code.match(/[^{]+(.+)\}/g)[0];
            },
            set: function (fn) {
                if (typeof fn == 'function') {
                    this._posTransform = fn;
                } else {
                    this._posTransform = new Function('pos', 'particle', fn);
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Emitter.prototype, "particles", {
            get: function () {
                return this._particlePool;
            },
            set: function (value) {
                this._particlePool = value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Emitter.prototype, "totalParticles", {
            get: function () {
                return this._totalParticles;
            },
            set: function (tp) {
                tp = tp | 0;
                if (tp !== this._totalParticles) {
                    this._totalParticles = tp;
                    this.restart();
                }
            },
            enumerable: true,
            configurable: true
        });

        Emitter.prototype.load = function (config) {
            this._totalParticles = 0;
            this.emissionRate = 0;

            this.active = false;
            this.duration = 0;

            this.settings.pos.x = 0;
            this.settings.pos.y = 0;

            this.settings.posVar.x = 0;
            this.settings.posVar.y = 0;

            this.settings.speed = 0;
            this.settings.speedVar = 0;

            this.settings.angle = 0;
            this.settings.angleVar = 0;

            this.settings.life = 0;
            this.settings.lifeVar = 0;

            this.settings.radius = 0;
            this.settings.radiusVar = 0;

            this.settings.texture = null;

            this.settings.textureAdditive = false;

            this.settings.startScale = 0;
            this.settings.startScaleVar = 0;
            this.settings.endScale = 0;
            this.settings.endScaleVar = 0;

            this.settings.startColor[0] = 0;
            this.settings.startColor[1] = 0;
            this.settings.startColor[2] = 0;
            this.settings.startColor[3] = 0;

            this.settings.startColorVar[0] = 0;
            this.settings.startColorVar[1] = 0;
            this.settings.startColorVar[2] = 0;
            this.settings.startColorVar[3] = 0;

            this.settings.endColor[0] = 0;
            this.settings.endColor[1] = 0;
            this.settings.endColor[2] = 0;
            this.settings.endColor[3] = 0;

            this.settings.endColorVar[0] = 0;
            this.settings.endColorVar[1] = 0;
            this.settings.endColorVar[2] = 0;
            this.settings.endColorVar[3] = 0;

            this.settings.gravity.x = 0;
            this.settings.gravity.y = 0;

            this.settings.radialAccel = 0;
            this.settings.radialAccelVar = 0;
            this.settings.tangentialAccel = 0;
            this.settings.tangentialAccelVar = 0;

            EPSY.utils.obj.recursiveExtend(this.settings, config, EPSY.EmitterParams);
            EPSY.utils.obj.recursiveExtendInclusive(this, config, EPSY.EmitterParams);

            if (isNaN(this.duration))
                this.duration = Infinity;

            this.id = config.name || this.id;

            this.restart();
        };

        Emitter.prototype.save = function () {
            var pconfig = JSON.parse(JSON.stringify(this.settings));
            EPSY.utils.obj.recursiveExtendInclusive(pconfig, this, EPSY.EmitterParams);

            return pconfig;
        };

        Emitter.prototype.restart = function () {
            if (this._particlePool.length < this.totalParticles) {
                for (var i = this._particlePool.length; i < this.totalParticles; ++i) {
                    this._particlePool.push(new EPSY.Particle());
                }
            }

            if (this._particlePool.length > this.totalParticles) {
                var spliced = this._particlePool.splice(this.totalParticles);

                this.recyclable = this.recyclable.concat(spliced);
            }

            for (var i = 0; i < this.totalParticles; ++i) {
                var particle = this._particlePool[i];
                particle.recycled = true;
            }

            this._particleCount = 0;
            this._particleIndex = 0;
            this._elapsed = 0;
            this._curCycle = 0;
            this._emitCounter = 0;
        };

        Emitter.prototype.reset = function () {
            this.load(this._baseSystem);
        };

        Emitter.prototype._isFull = function () {
            return this._particleCount === this.totalParticles;
        };

        Emitter.prototype.createParticle = function () {
            if (this._isFull()) {
                return false;
            }

            var p = this._particlePool[this._particleCount];

            this.initParticle(p);

            this._particleCount++;

            return true;
        };

        Emitter.prototype.initParticle = function (particle) {
            particle.texture = this.settings.texture;
            particle.textureAdditive = this.settings.textureAdditive;

            var posVar = {
                x: this.settings.posVar.x * EPSY.utils.math.frandom(-1, 1),
                y: this.settings.posVar.y * EPSY.utils.math.frandom(-1, 1)
            };
            if (this._posTransform) {
                posVar = this._posTransform.call(this, posVar, particle);
            }

            particle.pos.x = this.settings.pos.x + posVar.x;
            particle.pos.y = this.settings.pos.y + posVar.y;

            var angle = this.settings.angle + this.settings.angleVar * EPSY.utils.math.frandom(-1, 1);
            var speed = this.settings.speed + this.settings.speedVar * EPSY.utils.math.frandom(-1, 1);

            particle.setVelocity(angle, speed);

            particle.radialAccel = this.settings.radialAccel + this.settings.radialAccelVar * EPSY.utils.math.frandom(-1, 1) || 0;
            particle.tangentialAccel = this.settings.tangentialAccel + this.settings.tangentialAccelVar * EPSY.utils.math.frandom(-1, 1) || 0;

            var life = this.settings.life + this.settings.lifeVar * EPSY.utils.math.frandom(-1, 1) || 0;
            particle.life = Math.max(0, life);

            particle.scale = EPSY.utils.math.isNumber(this.settings.startScale) ? this.settings.startScale : 1;
            particle.deltaScale = EPSY.utils.math.isNumber(this.settings.endScale) ? (this.settings.endScale - this.settings.startScale) : 0;
            particle.deltaScale /= particle.life;

            particle.radius = EPSY.utils.math.isNumber(this.settings.radius) ? this.settings.radius + (this.settings.radiusVar || 0) * EPSY.utils.math.frandom(-1, 1) : 0;

            if (this.settings.startColor) {
                var startColor = [this.settings.startColor[0] + this.settings.startColorVar[0] * EPSY.utils.math.frandom(-1, 1), this.settings.startColor[1] + this.settings.startColorVar[1] * EPSY.utils.math.frandom(-1, 1), this.settings.startColor[2] + this.settings.startColorVar[2] * EPSY.utils.math.frandom(-1, 1), this.settings.startColor[3] + this.settings.startColorVar[3] * EPSY.utils.math.frandom(-1, 1)];

                var endColor = startColor;
                if (this.settings.endColor) {
                    endColor = [this.settings.endColor[0] + this.settings.endColorVar[0] * EPSY.utils.math.frandom(-1, 1), this.settings.endColor[1] + this.settings.endColorVar[1] * EPSY.utils.math.frandom(-1, 1), this.settings.endColor[2] + this.settings.endColorVar[2] * EPSY.utils.math.frandom(-1, 1), this.settings.endColor[3] + this.settings.endColorVar[3] * EPSY.utils.math.frandom(-1, 1)];
                }

                particle.color = startColor;
                particle.deltaColor = [(endColor[0] - startColor[0]) / particle.life, (endColor[1] - startColor[1]) / particle.life, (endColor[2] - startColor[2]) / particle.life, (endColor[3] - startColor[3]) / particle.life];

                for (var c = 0; c < 3; c++) {
                    particle.startColor[c] = ~~particle.startColor[c];
                    particle.endColor[c] = ~~particle.endColor[c];
                    particle.deltaColor[c] = ~~particle.deltaColor[c];
                }
            }
        };

        Emitter.prototype.updateParticle = function (p, delta, i) {
            var inEdge = (!this.border) || (p.pos.x >= this.settings.pos.x - this.border.left && p.pos.y >= this.settings.pos.y - this.border.top && p.pos.x <= this.settings.pos.x + this.border.right && p.pos.y <= this.settings.pos.y + this.border.bottom);

            if (!inEdge) {
                p.life = 0;
            }

            if (p.life > 0) {
                p.radial.x = 0;
                p.radial.y = 0;
                p.forces.x = 0;
                p.forces.y = 0;

                if ((p.pos.x !== this.settings.pos.x || p.pos.y !== this.settings.pos.y) && (p.radialAccel || p.tangentialAccel)) {
                    p.radial.x = p.pos.x - this.settings.pos.x;
                    p.radial.y = p.pos.y - this.settings.pos.y;

                    EPSY.utils.math.normalize(p.radial);
                }

                p.tangential.x = p.radial.x;
                p.tangential.y = p.radial.y;

                p.radial.x *= p.radialAccel;
                p.radial.y *= p.radialAccel;

                var newy = p.tangential.x;
                p.tangential.x = -p.tangential.y;
                p.tangential.y = newy;

                p.tangential.x *= p.tangentialAccel;
                p.tangential.y *= p.tangentialAccel;

                p.forces.x = p.radial.x + p.tangential.x + this.settings.gravity.x;
                p.forces.y = p.radial.y + p.tangential.y + this.settings.gravity.y;

                p.forces.x *= delta;
                p.forces.y *= delta;

                p.vel.x += p.forces.x;
                p.vel.y += p.forces.y;

                p.lastpos.x = p.pos.x;
                p.lastpos.y = p.pos.y;

                var ax = 0;
                var ay = 0;
                if (this._xEquation)
                    ax = this.aFactor.x * this._xEquation(p.life * this.xFactor.x * Math.PI);
                if (this._yEquation)
                    ay = this.aFactor.y * this._yEquation(p.life * this.xFactor.y * Math.PI);

                p.pos.x += p.vel.x * delta + ax;
                p.pos.y += p.vel.y * delta + ay;

                p.life -= delta;

                p.scale += p.deltaScale * delta;

                if (p.color) {
                    if (this.settings.colorList.length > 0) {
                        p.color[0] = this.settings.colorList[p.colorIdx][0];
                        p.color[1] = this.settings.colorList[p.colorIdx][1];
                        p.color[2] = this.settings.colorList[p.colorIdx][2];
                        p.color[3] = this.settings.colorList[p.colorIdx][3];

                        p.colorIdx++;
                        if (p.colorIdx >= this.settings.colorList.length)
                            p.colorIdx = 0;
                    } else {
                        p.color[0] += p.deltaColor[0] * delta;
                        p.color[1] += p.deltaColor[1] * delta;
                        p.color[2] += p.deltaColor[2] * delta;
                        p.color[3] += p.deltaColor[3] * delta;
                    }
                }

                ++this._particleIndex;
            } else {
                p.color[3] = 0;

                var temp = this._particlePool[i];

                this._particlePool[i] = this._particlePool[this._particleCount - 1];
                this._particlePool[this._particleCount - 1] = temp;

                --this._particleCount;
            }
        };

        Emitter.prototype.kill = function () {
            for (var i = 0; i < this._particlePool.length; i++) {
                var p = this._particlePool[i];
                p.life = 0;
            }

            this._particlePool = [];

            this.duration = -1;
            this._particleCount = 0;
            this._particleIndex = 0;
            this._elapsed = 0;
            this._emitCounter = 0;
        };
        Emitter.prototype.update = function (delta) {
            this._elapsed += delta;
            this.active = this._elapsed < this.duration;

            if (!this.active) {
                return;
            }

            if (this.emissionRate) {
                var rate = 1.0 / this.emissionRate;
                this._emitCounter += delta;
                if (!this.allOrNone) {
                    while (!this._isFull() && this._emitCounter > rate) {
                        this.createParticle();
                        this._emitCounter -= rate;
                    }
                    ;
                } else if (this._particleCount == 0 && this._curCycle < this.cycles) {
                    while (!this._isFull()) {
                        this.createParticle();
                    }
                    ;
                    this._curCycle++;
                }
            }

            this._particleIndex = 0;

            while (this._particleIndex < this._particleCount) {
                var p = this._particlePool[this._particleIndex];
                this.updateParticle(p, delta, this._particleIndex);
            }
        };
        return Emitter;
    })();
    EPSY.Emitter = Emitter;
    ;
})(EPSY || (EPSY = {}));
var EPSY;
(function (EPSY) {
    var EmitterEntity = (function () {
        function EmitterEntity() {
            this.pos = { x: 0, y: 0 };
            this.posVar = { x: 0, y: 0 };
            this.speed = 0;
            this.speedVar = 0;
            this.angle = 0;
            this.angleVar = 0;
            this.life = 0;
            this.lifeVar = 0;
            this.radius = 0;
            this.radiusVar = 0;
            this.textureAdditive = false;
            this.startScale = 0;
            this.startScaleVar = 0;
            this.endScale = 0;
            this.endScaleVar = 0;
            this.startColor = [0, 0, 0, 0];
            this.startColorVar = [0, 0, 0, 0];
            this.endColor = [0, 0, 0, 0];
            this.endColorVar = [0, 0, 0, 0];
            this.colorList = [];
            this.gravity = { x: 0, y: 0 };
            this.radialAccel = 0;
            this.radialAccelVar = 0;
            this.tangentialAccel = 0;
            this.tangentialAccelVar = 0;
        }
        return EmitterEntity;
    })();
    EPSY.EmitterEntity = EmitterEntity;
})(EPSY || (EPSY = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EPSY;
(function (EPSY) {
    var Particle = (function (_super) {
        __extends(Particle, _super);
        function Particle() {
            _super.call(this);
            this.lastpos = { x: -1, y: -1 };
            this.vel = { x: 0, y: 0 };
            this.forces = { x: 0, y: 0 };
            this.radial = { x: 0, y: 0 };
            this.tangential = { x: 0, y: 0 };
            this.colorIdx = 0;
            this.recycled = false;
            this.setVelocity(0, 0);
        }
        Particle.prototype.setVelocity = function (angle, speed) {
            this.vel.x = Math.cos(EPSY.utils.math.toRad(angle)) * speed;
            this.vel.y = -Math.sin(EPSY.utils.math.toRad(angle)) * speed;
        };
        return Particle;
    })(EPSY.EmitterEntity);
    EPSY.Particle = Particle;
})(EPSY || (EPSY = {}));
var EPSY;
(function (EPSY) {
    var bufferCache = {};

    function colorArrayToString(array, overrideAlpha) {
        var r = array[0] | 0;
        var g = array[1] | 0;
        var b = array[2] | 0;
        var a = overrideAlpha || array[3];

        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }

    function getBuffer(particle) {
        var img = particle.img;
        if (!img) {
            img = new Image();
            particle.ready = false;
            img.onload = function () {
                particle.ready = true;
            };
            img.src = particle.texture;
            particle.img = img;
        }

        if (!particle.ready)
            return undefined;

        var size = '' + img.width + 'x' + img.height;

        var canvas = bufferCache[size];

        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            bufferCache[size] = canvas;
        }

        return canvas;
    }

    var CanvasRenderer = (function () {
        function CanvasRenderer(context) {
            this.context = context;
            this.defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACz0lEQVR42t2XP0hbURTGnfp/KK3QFiylCG11aRYpBQWFDiJCg266BNQtdnBQyOASQjp1KS4KGVw6iXMWEUdHUShkCBhSQpaQkJg/Jmm/H3xLEdtaWvLawMfJvfec79x77jnnvdfX96/9MpnM9VwudzOfz98qFAq3kYyZ/6tOi8XinVKpdLdSqfRXq9UHwsNarfYIyZh51tH7Y5s5Pj6+BqHI7+OsXq8/aTQag8LzZrM5JAwjGTPPOnroY4f9bzvPZrM3OBEnFPFTOXohvGy1WiPC6/Pz81FhDMmYedbRQx877OG5snPutFwu3zs7OxvQyZ6JPGSnE8KkMN1ut98KYSRjz094MyHssIcHviud3M4fE15OJuJxOZoSZoU5ISIsCIuWEc+zPoW+IzIED3y/FAnujLCxczt/JbI3Pum8sCQsCyudTmdVWEMy9vyS9cLYYe9NDMD705wgcbg7h33Ezmd8wqidrgtxISm8t4x7ns1ErT/jTYzABy/8Pyw1spcE4g4d9rDJ3ok8JiSED8KGsClsWW54nvUY+rYL+zpC8MJ/aYmyO0qILCaRfOfzPnnMJ/0opIRPwk63291FepzyetKbiNp+Cj544b80CtwRdUwpkc1OqCWHPWHybTtNS+5LHlimPb9tvYSvg5yYhQ9e+PFzWfj7aSa++0ln9bLvlvCm7GRP8lDySDhBerzn9ZT1152Yc/A5Fwbxc+EaqFPaKR3N9T7tO1xxgm04zJz0UPis/6fCFyRjbyJtPfTjro4IfPDCj58LfYEHCllKydDZ3GQWHP6kE23H4T6y05Jk1fLUkdh3TmzabtV9gmY1Cj9+8PfdBniqOQGHaa/O/kXXOaW25fAeOOycvPpVP6THJ86JXVcHdmtuVlTDGPz4wV+wItDzHOh5FfS8DwSiE/b8WdDzp2Eg3gd6/kYUiHfCQLwVB+K7IBBfRoH5Nvyvf98A3rZr7fen7G8AAAAASUVORK5CYII=';
        }
        CanvasRenderer.prototype.renderParticle = function (particle) {
            if (!particle.texture)
                particle.texture = this.defaultTexture;

            particle.buffer = particle.buffer || getBuffer(particle);

            if (!particle.buffer)
                return;

            var bufferContext = particle.buffer.getContext('2d');

            var w = (particle.img.width * particle.scale) | 0;
            var h = (particle.img.height * particle.scale) | 0;

            var x = particle.pos.x - w / 2;
            var y = particle.pos.y - h / 2;

            bufferContext.clearRect(0, 0, particle.buffer.width, particle.buffer.height);
            bufferContext.globalAlpha = particle.color[3];
            bufferContext.drawImage(particle.img, 0, 0);

            bufferContext.globalCompositeOperation = "source-atop";
            bufferContext.fillStyle = colorArrayToString(particle.color, 1);
            bufferContext.fillRect(0, 0, particle.buffer.width, particle.buffer.height);

            bufferContext.globalCompositeOperation = "source-over";
            bufferContext.globalAlpha = 1;

            if (particle.textureAdditive) {
                this.context.globalCompositeOperation = 'lighter';
            } else {
                this.context.globalCompositeOperation = 'source-over';
            }

            this.context.drawImage(particle.buffer, 0, 0, particle.buffer.width, particle.buffer.height, x, y, w, h);
        };

        CanvasRenderer.prototype.render = function (emitter) {
            var particles = emitter.particles;
            for (var i = 0; i < particles.length; ++i) {
                var p = particles[i];
                if (p.life > 0 && p.color) {
                    this.renderParticle(p);
                }
            }
            this.context.globalCompositeOperation = 'source-over';
        };

        CanvasRenderer.prototype.reset = function () {
            return;
        };
        return CanvasRenderer;
    })();
    EPSY.CanvasRenderer = CanvasRenderer;
})(EPSY || (EPSY = {}));
var EPSY;
(function (EPSY) {
    var PixiRenderer = (function () {
        function PixiRenderer(context) {
            this.context = context;
            this.defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACz0lEQVR42t2XP0hbURTGnfp/KK3QFiylCG11aRYpBQWFDiJCg266BNQtdnBQyOASQjp1KS4KGVw6iXMWEUdHUShkCBhSQpaQkJg/Jmm/H3xLEdtaWvLawMfJvfec79x77jnnvdfX96/9MpnM9VwudzOfz98qFAq3kYyZ/6tOi8XinVKpdLdSqfRXq9UHwsNarfYIyZh51tH7Y5s5Pj6+BqHI7+OsXq8/aTQag8LzZrM5JAwjGTPPOnroY4f9bzvPZrM3OBEnFPFTOXohvGy1WiPC6/Pz81FhDMmYedbRQx877OG5snPutFwu3zs7OxvQyZ6JPGSnE8KkMN1ut98KYSRjz094MyHssIcHviud3M4fE15OJuJxOZoSZoU5ISIsCIuWEc+zPoW+IzIED3y/FAnujLCxczt/JbI3Pum8sCQsCyudTmdVWEMy9vyS9cLYYe9NDMD705wgcbg7h33Ezmd8wqidrgtxISm8t4x7ns1ErT/jTYzABy/8Pyw1spcE4g4d9rDJ3ok8JiSED8KGsClsWW54nvUY+rYL+zpC8MJ/aYmyO0qILCaRfOfzPnnMJ/0opIRPwk63291FepzyetKbiNp+Cj544b80CtwRdUwpkc1OqCWHPWHybTtNS+5LHlimPb9tvYSvg5yYhQ9e+PFzWfj7aSa++0ln9bLvlvCm7GRP8lDySDhBerzn9ZT1152Yc/A5Fwbxc+EaqFPaKR3N9T7tO1xxgm04zJz0UPis/6fCFyRjbyJtPfTjro4IfPDCj58LfYEHCllKydDZ3GQWHP6kE23H4T6y05Jk1fLUkdh3TmzabtV9gmY1Cj9+8PfdBniqOQGHaa/O/kXXOaW25fAeOOycvPpVP6THJ86JXVcHdmtuVlTDGPz4wV+wItDzHOh5FfS8DwSiE/b8WdDzp2Eg3gd6/kYUiHfCQLwVB+K7IBBfRoH5Nvyvf98A3rZr7fen7G8AAAAASUVORK5CYII=';
            this.buffer = [];
            this._sortFn = function (a, b) {
                return (a.__z || 0) - (b.__z || 0);
            };
        }
        PixiRenderer.prototype.updateParticleSprite = function (emitter, particle) {
            if (particle.life <= 0 && particle.sprite) {
                particle.sprite.visible = false;
                return;
            }

            if (!particle.sprite || particle.recycled) {
                var texture = PIXI.Texture.fromImage(particle.texture || this.defaultTexture);

                if (particle.recycled && particle.sprite) {
                    particle.sprite.texture = texture;
                } else {
                    particle.sprite = new PIXI.Sprite(texture);
                }

                particle.sprite.__parentParticle = particle;

                particle.sprite.anchor.x = 0.5;
                particle.sprite.anchor.y = 0.5;

                particle.sprite.tail = 0;
            }

            if (!particle.inserted) {
                particle.inserted = true;
                this.buffer.push(particle.sprite);
                emitter.container.addChild(particle.sprite);
            }

            particle.sprite.visible = particle.life > 0;
            particle.sprite.width = particle.radius * particle.scale;
            particle.sprite.height = particle.radius * particle.scale;

            particle.sprite.position.x = particle.pos.x;
            particle.sprite.position.y = particle.pos.y;
            if (particle.textureAdditive) {
                particle.sprite.blendMode = PIXI.blendModes.ADD;
            } else {
                particle.sprite.blendMode = PIXI.blendModes.NORMAL;
            }

            particle.sprite.tint = ~~particle.color[2] + 256 * ~~particle.color[1] + 65536 * ~~particle.color[0];
            particle.sprite.alpha = particle.color[3];
        };

        PixiRenderer.prototype.render = function (emitter) {
            var particles = emitter.particles;

            if (!emitter.container) {
                emitter.container = new PIXI.DisplayObjectContainer();
                this.context.addChild(emitter.container);
            }

            for (var i = 0; i < particles.length; ++i) {
                var p = particles[i];
                if (p.color) {
                    this.updateParticleSprite(emitter, p);
                }
            }

            if (emitter.recyclable.length > 0) {
                var particle;
                while (particle = emitter.recyclable.pop()) {
                    particle.life = 0;
                    if (particle.sprite) {
                        particle.sprite.visible = false;
                        if (particle.sprite.__parentParticle)
                            particle.sprite.__parentParticle.inserted = false;
                    }
                }
            }
        };

        PixiRenderer.prototype.hideAllParticles = function (emitter) {
            for (var i = 0; i < emitter.particles.length; i++) {
                var particle = emitter.particles[i];
                particle.life = 0;
            }
        };

        PixiRenderer.prototype.sort = function () {
            this.context.children.sort(this._sortFn);
        };
        PixiRenderer.prototype.reset = function () {
            var removed = 0;
            do {
                var sprite = this.buffer.pop();
                if (!sprite)
                    continue;
                for (var i = 0; i < this.context.children.length; i++) {
                    var emitterContext = this.context.children[i];
                    if (!emitterContext)
                        continue;

                    try  {
                        emitterContext.removeChild(sprite);

                        removed++;
                        continue;
                    } catch (ex) {
                    }
                }

                if (sprite.__parentParticle) {
                    sprite.__parentParticle.inserted = false;
                    sprite.__parentParticle.life = 0;
                }
            } while(this.buffer.length > 0);
            console.log('reset particles = ', removed);
        };
        return PixiRenderer;
    })();
    EPSY.PixiRenderer = PixiRenderer;
})(EPSY || (EPSY = {}));
//# sourceMappingURL=EPSY.js.map

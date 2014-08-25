
module EPSY {
    export var EmitterParams = ['id', 'border', 'duration', 'emissionRate', 'totalParticles', 'xFactor', 'aFactor', 'xEquation', 'yEquation', 'posTransform', 'zIndex'];

    export class Emitter {
        public id = (Math.random() * 1e20).toString(36);
        
        
        
        public container: any;

        public settings = new EmitterEntity();


        private time = Date.now();
        
        //public _defaultTexture: any;
        //public _predefinedSystemName: any;
        public _baseSystem: any;
        public _totalParticles = 0;
        

        public emissionRate = 0;
        public allOrNone = false;


        public aFactor = { x: 0, y: 0 };
        public xFactor = { x: 0, y: 0 };
        private _xEquation: (number) => any;
        private _yEquation: (number) => any;
        private _xEqName: string = '';
        private _yEqName: string = '';
        private _posTransform: (...any) => any;



        
        public active = false;
        public duration = 0;
        public cycles = Infinity;


        

        private _particlePool: Particle[] = [];
        private _particleCount = 0;
        private _particleIndex = 0;
        private _elapsed = 0;
        private _curCycle = 0;
        private _emitCounter = 0;

        public border = {top:100, left:100, bottom:100, right:100};

        public recyclable = [];

        constructor(system) {
            this._baseSystem = utils.obj.clone(system, ['texture']);
            this.load(system);
        }


        //#region [Getters/Setters] ===========================================
        get zIndex(): number {
            if (this.container) {
                return this.container.__z || 0;
            }

            return 0;
        }
        set zIndex(value: number) {
            if (this.container) {
                this.container.__z = ~~value;
            }
        }

        get xEquation(): string {
            return this._xEqName;
        }
        set xEquation(value: string) {
            if (typeof Math[value] == 'function') {
                this._xEqName = value;
                this._xEquation = Math[value];
            }
            else {
                this._xEqName = '';
                this._xEquation = undefined;
            }
        }
        get yEquation(): string {
            return this._yEqName;
        }
        set yEquation(value: string) {
            if (typeof Math[value] == 'function') {
                this._yEqName = value;
                this._yEquation = Math[value];
            }
            else {
                this._yEqName = '';
                this._yEquation = undefined;
            }
        }


        get posTransform(): any {
            if (!this._posTransform) return undefined;


            var code = this._posTransform.toString();
            return code.match(/[^{]+(.+)\}/g)[0]
        }
        set posTransform(fn: any) {
            if (typeof fn == 'function') {
                this._posTransform = fn;
            }
            else {
                this._posTransform = <(...any)=>any>new Function('pos', 'particle', fn);
            }
        }

        


        get particles(): Particle[] {
            return this._particlePool;
        }
        set particles(value: Particle[]) {
            this._particlePool = value;
        }



        get totalParticles(): number {
            return this._totalParticles;
        }
        set totalParticles(tp: number) {
            tp = tp | 0;
            if (tp !== this._totalParticles) {
                this._totalParticles = tp;
                this.restart();
            }
        }

        //#endregion ===========================================================



        /*
         * Applies all the properties in config to the particle system,
         * a good way to change just one or two things about the system
         * on the fly
         */
        //public overlay(config) {
        //    util.extend(this, config);
        //    this.restart();
        //}

        //public resetTexture() {
        //    this.overlay({
        //        texture: this._defaultTexture
        //    });
        //}

        /*
         * completely reconfigures the particle system. First applies all 
         * the defaults, then overlays everything found in config
         */
        public load(config) {
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

            
            utils.obj.recursiveExtend(this.settings, config, EmitterParams);
            utils.obj.recursiveExtendInclusive(this, config, EmitterParams);

            if (isNaN(this.duration)) this.duration = Infinity;


            this.id = config.name || this.id;


            this.restart();
        }

        public save() {
            var pconfig = JSON.parse(JSON.stringify(this.settings));
            utils.obj.recursiveExtendInclusive(pconfig, this, EmitterParams);

            return pconfig;
            
        }
        
        /*
         */
        public restart() {
            if (this._particlePool.length < this.totalParticles) {
                for (var i = this._particlePool.length; i < this.totalParticles; ++i) {
                    this._particlePool.push(new Particle());
                }
            }

            if (this._particlePool.length > this.totalParticles) {            
                var spliced = this._particlePool.splice(this.totalParticles);

                this.recyclable = this.recyclable.concat(spliced);
            }
            


            for (var i = 0; i < this.totalParticles; ++i) {
                var particle: Particle = this._particlePool[i];
                particle.recycled = true;

                
            }

            this._particleCount = 0;
            this._particleIndex = 0;
            this._elapsed = 0;
            this._curCycle = 0;
            this._emitCounter = 0;
        }

        public reset() {
            this.load(this._baseSystem);
        }

        /*
         * Returns whether all the particles in the pool are currently active
         */
        private _isFull() {
            return this._particleCount === this.totalParticles;
        }

        /*
         * Recycle particle if available, otherwise do nothing
         */
        private createParticle() {
            if (this._isFull()) {
                return false;
            }

            var p = this._particlePool[this._particleCount];

            this.initParticle(p);

            this._particleCount++;

            return true;
        }



        /*
         * Initializes the particle based on the current settings
         * of the particle system
         */
        private initParticle(particle:Particle) {
            particle.texture = this.settings.texture;            
            particle.textureAdditive = this.settings.textureAdditive;


            var posVar = {
                x: this.settings.posVar.x * utils.math.frandom(-1,1),
                y: this.settings.posVar.y * utils.math.frandom(-1, 1)
            };
            if (this._posTransform) {
                posVar = this._posTransform.call(this, posVar, particle);
            }


            particle.pos.x = this.settings.pos.x + posVar.x;
            particle.pos.y = this.settings.pos.y + posVar.y;

            var angle = this.settings.angle + this.settings.angleVar * utils.math.frandom(-1, 1);
            var speed = this.settings.speed + this.settings.speedVar * utils.math.frandom(-1, 1);

            // it's easier to set speed and angle at this level
            // but once the particle is active and being updated, it's easier
            // to use a vector to indicate speed and angle. So particle.setVelocity
            // converts the angle and speed values to a velocity vector
            particle.setVelocity(angle, speed);

            particle.radialAccel = this.settings.radialAccel + this.settings.radialAccelVar * utils.math.frandom(-1, 1) || 0;
            particle.tangentialAccel = this.settings.tangentialAccel + this.settings.tangentialAccelVar * utils.math.frandom(-1, 1) || 0;

            var life = this.settings.life + this.settings.lifeVar * utils.math.frandom(-1, 1) || 0;
            particle.life = Math.max(0, life);

            particle.scale = utils.math.isNumber(this.settings.startScale) ? this.settings.startScale : 1;
            particle.deltaScale = utils.math.isNumber(this.settings.endScale) ? (this.settings.endScale - this.settings.startScale) : 0;
            particle.deltaScale /= particle.life;

            particle.radius = utils.math.isNumber(this.settings.radius) ? this.settings.radius + (this.settings.radiusVar || 0) * utils.math.frandom(-1, 1) : 0;


            if (this.settings.startColor) {
                var startColor = [
                    this.settings.startColor[0] + this.settings.startColorVar[0] * utils.math.frandom(-1, 1), this.settings.startColor[1] + this.settings.startColorVar[1] * utils.math.frandom(-1, 1), this.settings.startColor[2] + this.settings.startColorVar[2] * utils.math.frandom(-1, 1), this.settings.startColor[3] + this.settings.startColorVar[3] * utils.math.frandom(-1, 1)];

                
                var endColor = startColor;
                if (this.settings.endColor) {
                    endColor = [
                        this.settings.endColor[0] + this.settings.endColorVar[0] * utils.math.frandom(-1, 1), this.settings.endColor[1] + this.settings.endColorVar[1] * utils.math.frandom(-1, 1), this.settings.endColor[2] + this.settings.endColorVar[2] * utils.math.frandom(-1, 1), this.settings.endColor[3] + this.settings.endColorVar[3] * utils.math.frandom(-1, 1)];
                }

                particle.color = startColor;
                particle.deltaColor = [(endColor[0] - startColor[0]) / particle.life, (endColor[1] - startColor[1]) / particle.life, (endColor[2] - startColor[2]) / particle.life, (endColor[3] - startColor[3]) / particle.life];

                for (var c = 0; c < 3; c++) {
                    particle.startColor[c] = ~~particle.startColor[c];
                    particle.endColor[c] = ~~particle.endColor[c];
                    particle.deltaColor[c] = ~~particle.deltaColor[c];
                }
            }
        }


        private updateParticle(p:Particle, delta, i) {
            var inEdge = (!this.border) ||
                (p.pos.x >= this.settings.pos.x - this.border.left && p.pos.y >= this.settings.pos.y - this.border.top && p.pos.x <= this.settings.pos.x + this.border.right && p.pos.y <= this.settings.pos.y + this.border.bottom);


            if (!inEdge) {
                
                p.life = 0;        
            }

            if (p.life > 0) {

                p.radial.x = 0;
                p.radial.y = 0;
                p.forces.x = 0;
                p.forces.y = 0;


                // dont apply radial forces until moved away from the emitter
                if ((p.pos.x !== this.settings.pos.x || p.pos.y !== this.settings.pos.y) && (p.radialAccel || p.tangentialAccel)) {
                    p.radial.x = p.pos.x - this.settings.pos.x;
                    p.radial.y = p.pos.y - this.settings.pos.y;

                    utils.math.normalize(p.radial);
                }

                p.tangential.x = p.radial.x;
                p.tangential.y = p.radial.y;

                p.radial.x *= p.radialAccel;
                p.radial.y *= p.radialAccel;

                var newy = p.tangential.x;
                p.tangential.x = - p.tangential.y;
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
                if (this._xEquation) ax = this.aFactor.x * this._xEquation(p.life * this.xFactor.x * Math.PI);
                if (this._yEquation) ay = this.aFactor.y * this._yEquation(p.life * this.xFactor.y * Math.PI);
                


                p.pos.x += p.vel.x * delta +ax;
                p.pos.y += p.vel.y * delta +ay;

                p.life -= delta;

                p.scale += p.deltaScale * delta;

                if (p.color) {
                    if (this.settings.colorList.length>0) {
                        p.color[0] = this.settings.colorList[p.colorIdx][0];
                        p.color[1] = this.settings.colorList[p.colorIdx][1];
                        p.color[2] = this.settings.colorList[p.colorIdx][2];
                        p.color[3] = this.settings.colorList[p.colorIdx][3];

                        p.colorIdx++;
                        if (p.colorIdx >= this.settings.colorList.length) p.colorIdx = 0;
                    }
                    else {
                        p.color[0] += p.deltaColor[0] * delta;
                        p.color[1] += p.deltaColor[1] * delta;
                        p.color[2] += p.deltaColor[2] * delta;
                        p.color[3] += p.deltaColor[3] * delta;
                    }
                }


                ++this._particleIndex;
            } else {
                p.color[3] = 0;


                // the particle has died, time to return it to the particle pool
                // take the particle at the current index
                var temp = this._particlePool[i];

                // and move it to the end of the active particles, keeping all alive particles pushed
                // up to the front of the pool
                this._particlePool[i] = this._particlePool[this._particleCount - 1];
                this._particlePool[this._particleCount - 1] = temp;

                // decrease the count to indicate that one less particle in the pool is active.
                --this._particleCount;


            }
        }

        public kill() {
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

        }
        public update(delta) {
            
            this._elapsed += delta;
            this.active = this._elapsed < this.duration;

            if (!this.active) {
                return;
            }

            if (this.emissionRate) {
                // emit new particles based on how much time has passed and the emission rate
                var rate = 1.0 / this.emissionRate;
                this._emitCounter += delta;
                if (!this.allOrNone) {
                    while (!this._isFull() && this._emitCounter > rate) {
                        this.createParticle();
                        this._emitCounter -= rate;
                    };
                }
                else if (this._particleCount == 0 && this._curCycle < this.cycles) {
                    while (!this._isFull()) {
                        this.createParticle();
                        
                    };
                    this._curCycle++;
                }
            }

            this._particleIndex = 0;

            while (this._particleIndex < this._particleCount) {
                var p = this._particlePool[this._particleIndex];
                this.updateParticle(p, delta, this._particleIndex);
            }
        }






    };




}


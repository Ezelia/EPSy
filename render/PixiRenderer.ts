/// <reference path="../lib/pixi.d.ts" />

module EPSY {



    export class PixiRenderer {
        private defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACz0lEQVR42t2XP0hbURTGnfp/KK3QFiylCG11aRYpBQWFDiJCg266BNQtdnBQyOASQjp1KS4KGVw6iXMWEUdHUShkCBhSQpaQkJg/Jmm/H3xLEdtaWvLawMfJvfec79x77jnnvdfX96/9MpnM9VwudzOfz98qFAq3kYyZ/6tOi8XinVKpdLdSqfRXq9UHwsNarfYIyZh51tH7Y5s5Pj6+BqHI7+OsXq8/aTQag8LzZrM5JAwjGTPPOnroY4f9bzvPZrM3OBEnFPFTOXohvGy1WiPC6/Pz81FhDMmYedbRQx877OG5snPutFwu3zs7OxvQyZ6JPGSnE8KkMN1ut98KYSRjz094MyHssIcHviud3M4fE15OJuJxOZoSZoU5ISIsCIuWEc+zPoW+IzIED3y/FAnujLCxczt/JbI3Pum8sCQsCyudTmdVWEMy9vyS9cLYYe9NDMD705wgcbg7h33Ezmd8wqidrgtxISm8t4x7ns1ErT/jTYzABy/8Pyw1spcE4g4d9rDJ3ok8JiSED8KGsClsWW54nvUY+rYL+zpC8MJ/aYmyO0qILCaRfOfzPnnMJ/0opIRPwk63291FepzyetKbiNp+Cj544b80CtwRdUwpkc1OqCWHPWHybTtNS+5LHlimPb9tvYSvg5yYhQ9e+PFzWfj7aSa++0ln9bLvlvCm7GRP8lDySDhBerzn9ZT1152Yc/A5Fwbxc+EaqFPaKR3N9T7tO1xxgm04zJz0UPis/6fCFyRjbyJtPfTjro4IfPDCj58LfYEHCllKydDZ3GQWHP6kE23H4T6y05Jk1fLUkdh3TmzabtV9gmY1Cj9+8PfdBniqOQGHaa/O/kXXOaW25fAeOOycvPpVP6THJ86JXVcHdmtuVlTDGPz4wV+wItDzHOh5FfS8DwSiE/b8WdDzp2Eg3gd6/kYUiHfCQLwVB+K7IBBfRoH5Nvyvf98A3rZr7fen7G8AAAAASUVORK5CYII=';
        private buffer = [];

        private _sortFn = function (a, b) {return (a.__z || 0) - (b.__z || 0) };
        constructor(public context) {
            
        }
        /*
         * renders a particle using the particle's texture. The texture is typically a white
         * image and so need to use a secondary buffer to "tint" this image based on the 
         * particle's color.
         */
        private updateParticleSprite(emitter:Emitter, particle) {
            if (particle.life <= 0 && particle.sprite) {

                particle.sprite.visible = false;
                return;
            }

            if (!particle.sprite || particle.recycled) {
                

                var texture = PIXI.Texture.fromImage(particle.texture || this.defaultTexture);

                if (particle.recycled && particle.sprite) {
                    (<PIXI.Sprite>particle.sprite).texture = texture;
                }
                else {
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
                //this.context.addChild(particle.graphics);
            }


            particle.sprite.visible = particle.life > 0;
            particle.sprite.width = particle.radius * particle.scale;
            particle.sprite.height = particle.radius * particle.scale;

            //particle.sprite.scale.x = particle.scale || 1;
            //particle.sprite.scale.y = particle.scale || 1;



            particle.sprite.position.x = particle.pos.x;
            particle.sprite.position.y = particle.pos.y;
            if (particle.textureAdditive) {
                particle.sprite.blendMode = PIXI.blendModes.ADD;
            }
            else {
                particle.sprite.blendMode = PIXI.blendModes.NORMAL;
            }
            //particle.sprite.texture.tintCache = undefined;

            particle.sprite.tint = ~~particle.color[2] + 256 * ~~particle.color[1] + 65536 * ~~particle.color[0];
            particle.sprite.alpha = particle.color[3];


        }




        public render(emitter:Emitter) {
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

                var particle:any;
                while (particle = emitter.recyclable.pop()) {
                    particle.life = 0;
                    if (particle.sprite) {
                        //this.context.removeChild(particle.sprite);
                        particle.sprite.visible = false;
                        if (particle.sprite.__parentParticle) particle.sprite.__parentParticle.inserted = false;

                        //particle.sprite = null;
                    }
                }
            }
            
        }

        public hideAllParticles(emitter: Emitter) {
            for (var i = 0; i < emitter.particles.length; i++) {
                var particle = emitter.particles[i];
                particle.life = 0;
            }
        }


        public sort() {
            this.context.children.sort(this._sortFn);
        }
        public reset() {
            var removed = 0;
                do {
                    var sprite = this.buffer.pop();
                    if (!sprite) continue;
                    for (var i = 0; i < this.context.children.length; i++) {
                        var emitterContext: PIXI.DisplayObjectContainer = this.context.children[i];
                        if (!emitterContext) continue;

                        try {
                        emitterContext.removeChild(sprite);
                        
                        removed++;
                            continue;
                        } catch (ex) { }

                    }



                    if (sprite.__parentParticle) {
                        sprite.__parentParticle.inserted = false;
                        sprite.__parentParticle.life = 0;
                    }

                } while (this.buffer.length > 0);
            console.log('reset particles = ', removed);

        }

    }
}


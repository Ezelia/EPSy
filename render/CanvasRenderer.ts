
module EPSY {
    
    var bufferCache = {};

    function colorArrayToString(array: any, overrideAlpha?) {
        var r = array[0] | 0;
        var g = array[1] | 0;
        var b = array[2] | 0;
        var a = overrideAlpha || array[3];

        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }
    /*
     * Utility method to create a canvas the same size as the passed in texture (which is
     * an Image element). Used for _renderParticleTexture
     */
    function getBuffer(particle) {

        var img = particle.img;
        if (!img) {
            img = new Image();
            particle.ready = false;
            img.onload = function () {
                particle.ready = true;
            }
            img.src = particle.texture;
            particle.img = img;
        }

        if (!particle.ready) return undefined;


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


    export class CanvasRenderer {
        private defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACz0lEQVR42t2XP0hbURTGnfp/KK3QFiylCG11aRYpBQWFDiJCg266BNQtdnBQyOASQjp1KS4KGVw6iXMWEUdHUShkCBhSQpaQkJg/Jmm/H3xLEdtaWvLawMfJvfec79x77jnnvdfX96/9MpnM9VwudzOfz98qFAq3kYyZ/6tOi8XinVKpdLdSqfRXq9UHwsNarfYIyZh51tH7Y5s5Pj6+BqHI7+OsXq8/aTQag8LzZrM5JAwjGTPPOnroY4f9bzvPZrM3OBEnFPFTOXohvGy1WiPC6/Pz81FhDMmYedbRQx877OG5snPutFwu3zs7OxvQyZ6JPGSnE8KkMN1ut98KYSRjz094MyHssIcHviud3M4fE15OJuJxOZoSZoU5ISIsCIuWEc+zPoW+IzIED3y/FAnujLCxczt/JbI3Pum8sCQsCyudTmdVWEMy9vyS9cLYYe9NDMD705wgcbg7h33Ezmd8wqidrgtxISm8t4x7ns1ErT/jTYzABy/8Pyw1spcE4g4d9rDJ3ok8JiSED8KGsClsWW54nvUY+rYL+zpC8MJ/aYmyO0qILCaRfOfzPnnMJ/0opIRPwk63291FepzyetKbiNp+Cj544b80CtwRdUwpkc1OqCWHPWHybTtNS+5LHlimPb9tvYSvg5yYhQ9e+PFzWfj7aSa++0ln9bLvlvCm7GRP8lDySDhBerzn9ZT1152Yc/A5Fwbxc+EaqFPaKR3N9T7tO1xxgm04zJz0UPis/6fCFyRjbyJtPfTjro4IfPDCj58LfYEHCllKydDZ3GQWHP6kE23H4T6y05Jk1fLUkdh3TmzabtV9gmY1Cj9+8PfdBniqOQGHaa/O/kXXOaW25fAeOOycvPpVP6THJ86JXVcHdmtuVlTDGPz4wV+wItDzHOh5FfS8DwSiE/b8WdDzp2Eg3gd6/kYUiHfCQLwVB+K7IBBfRoH5Nvyvf98A3rZr7fen7G8AAAAASUVORK5CYII=';


        constructor(public context) {

        }


        /*
         * renders a particle using the particle's texture. The texture is typically a white
         * image and so need to use a secondary buffer to "tint" this image based on the 
         * particle's color.
         */
        private renderParticle(particle) {
            if (!particle.texture) particle.texture = this.defaultTexture;

            particle.buffer = particle.buffer || getBuffer(particle);

            if (!particle.buffer) return;

            var bufferContext = particle.buffer.getContext('2d');

            // figure out what size to draw the texture at, based on the particle's
            // current scale
            var w = (particle.img.width * particle.scale) | 0;
            var h = (particle.img.height * particle.scale) | 0;

            // figure out the x and y locations to render at, to center the texture in the buffer
            var x = particle.pos.x - w / 2;
            var y = particle.pos.y - h / 2;

            bufferContext.clearRect(0, 0, particle.buffer.width, particle.buffer.height);
            bufferContext.globalAlpha = particle.color[3];
            bufferContext.drawImage(particle.img, 0, 0);

            // now use source-atop to "tint" the white texture, here we want the particle's pure color,
            // not including alpha. As we already used the particle's alpha to render the texture above
            bufferContext.globalCompositeOperation = "source-atop";
            bufferContext.fillStyle = colorArrayToString(particle.color, 1);
            bufferContext.fillRect(0, 0, particle.buffer.width, particle.buffer.height);

            // reset the buffer's context for the next time we draw the particle
            bufferContext.globalCompositeOperation = "source-over";
            bufferContext.globalAlpha = 1;


            if (particle.textureAdditive) {
                this.context.globalCompositeOperation = 'lighter';
            } else {
                this.context.globalCompositeOperation = 'source-over';
            }

            // finally, take the rendered and tinted texture and draw it into the main canvas, at the
            // particle's location
            this.context.drawImage(particle.buffer, 0, 0, particle.buffer.width, particle.buffer.height, x, y, w, h);
        }

        public render(emitter:EPSY.Emitter) {
            var particles = emitter.particles
            for (var i = 0; i < particles.length; ++i) {
                var p = particles[i];
                if (p.life > 0 && p.color) {

                    this.renderParticle(p);
                }
            }
            this.context.globalCompositeOperation = 'source-over';
        }

        public reset() {
            return;
        }
    }
}


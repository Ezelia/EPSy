Phaser.Plugin.EPSY = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
    
    

    //this.hasUpdate = true;
    //this.hasRender = true;


    this.emitters = [];

    this.defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACz0lEQVR42t2XP0hbURTGnfp/KK3QFiylCG11aRYpBQWFDiJCg266BNQtdnBQyOASQjp1KS4KGVw6iXMWEUdHUShkCBhSQpaQkJg/Jmm/H3xLEdtaWvLawMfJvfec79x77jnnvdfX96/9MpnM9VwudzOfz98qFAq3kYyZ/6tOi8XinVKpdLdSqfRXq9UHwsNarfYIyZh51tH7Y5s5Pj6+BqHI7+OsXq8/aTQag8LzZrM5JAwjGTPPOnroY4f9bzvPZrM3OBEnFPFTOXohvGy1WiPC6/Pz81FhDMmYedbRQx877OG5snPutFwu3zs7OxvQyZ6JPGSnE8KkMN1ut98KYSRjz094MyHssIcHviud3M4fE15OJuJxOZoSZoU5ISIsCIuWEc+zPoW+IzIED3y/FAnujLCxczt/JbI3Pum8sCQsCyudTmdVWEMy9vyS9cLYYe9NDMD705wgcbg7h33Ezmd8wqidrgtxISm8t4x7ns1ErT/jTYzABy/8Pyw1spcE4g4d9rDJ3ok8JiSED8KGsClsWW54nvUY+rYL+zpC8MJ/aYmyO0qILCaRfOfzPnnMJ/0opIRPwk63291FepzyetKbiNp+Cj544b80CtwRdUwpkc1OqCWHPWHybTtNS+5LHlimPb9tvYSvg5yYhQ9e+PFzWfj7aSa++0ln9bLvlvCm7GRP8lDySDhBerzn9ZT1152Yc/A5Fwbxc+EaqFPaKR3N9T7tO1xxgm04zJz0UPis/6fCFyRjbyJtPfTjro4IfPDCj58LfYEHCllKydDZ3GQWHP6kE23H4T6y05Jk1fLUkdh3TmzabtV9gmY1Cj9+8PfdBniqOQGHaa/O/kXXOaW25fAeOOycvPpVP6THJ86JXVcHdmtuVlTDGPz4wV+wItDzHOh5FfS8DwSiE/b8WdDzp2Eg3gd6/kYUiHfCQLwVB+K7IBBfRoH5Nvyvf98A3rZr7fen7G8AAAAASUVORK5CYII=';
    //this.buffer = [];



    //this.loader = new Phaser.Loader(game);


    this._sortFn = function (a, b) { return (a.__z || 0) - (b.__z || 0) };


    var _this = this;



    this._onResume = function (event) {
        //var timestamp = Date.now();
        for (var i = 0; i < _this.emitters.length; i++) {
            //_this.emitters[i].lastTimestamp = timestamp;
            _this.emitters[i].lastTimestamp = Date.now();
        }
    }

    game.onResume.add(this._onResume, this);


    this.game.epsy = this;
};

Phaser.Plugin.EPSY.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.EPSY.prototype.constructor = Phaser.Plugin.EPSY;
Phaser.Plugin.EPSY.VERSION = '0.5.1';




var updateParticle = function (emitter, particle) {
    if (!particle.sprite) {

        // PIXI.Sprite.fromImage and PIXI.Texture.fromImage methods were
        // removed from Phaser 2.5.x.
        if (PIXI.Sprite.fromImage) {
            particle.sprite = PIXI.Sprite.fromImage(particle.texture || this.defaultTexture);
        }
        else {
            PIXI.TextureCache = [];
            PIXI.BaseTextureCache = [];
            PIXI.Sprite.fromImage = function(imageId, crossorigin, scaleMode)
            {
                var texture = PIXI.Texture.fromImage(imageId, crossorigin, scaleMode);
                return new PIXI.Sprite(texture);
            };
            PIXI.Texture.fromImage = function(imageUrl, crossorigin, scaleMode)
            {
                var texture = PIXI.TextureCache[imageUrl];
                if(!texture)
                {
                    texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
                    PIXI.TextureCache[imageUrl] = texture;
                }
                return texture;
            };
            PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode)
            {
                var baseTexture = PIXI.BaseTextureCache[imageUrl];

                if(crossorigin === undefined && imageUrl.indexOf('data:') === -1) crossorigin = true;

                if(!baseTexture)
                {
                    // new Image() breaks tex loading in some versions of Chrome.
                    // See https://code.google.com/p/chromium/issues/detail?id=238071
                    var image = new Image();

                    if (crossorigin)
                    {
                        image.crossOrigin = '';
                    }

                    image.src = imageUrl;
                    baseTexture = new PIXI.BaseTexture(image, scaleMode);
                    baseTexture.imageUrl = imageUrl;
                    PIXI.BaseTextureCache[imageUrl] = baseTexture;

                    // if there is an @2x at the end of the url we are going to assume its a highres image
                    if( imageUrl.indexOf(PIXI.RETINA_PREFIX + '.') !== -1)
                    {
                        baseTexture.resolution = 2;
                    }
                }

                return baseTexture;
            };
            particle.sprite = PIXI.Sprite.fromImage(particle.texture || this.defaultTexture);
        }

        particle.sprite.__parentParticle = particle;


        particle.sprite.anchor.x = 0.5;
        particle.sprite.anchor.y = 0.5;

        particle.sprite.tail = 0;

        particle.ready = true;
    }



    if (!particle.inserted) {
        particle.inserted = true;
        emitter.buffer.push(particle.sprite);
        emitter.container.addChild(particle.sprite);
        //this.context.addChild(particle.graphics);
    }



    particle.sprite.width = particle.radius * particle.scale;
    particle.sprite.height = particle.radius * particle.scale;


    particle.sprite.position.x = particle.pos.x;
    particle.sprite.position.y = particle.pos.y;
    if (particle.textureAdditive) {
        particle.sprite.blendMode = PIXI.blendModes.ADD;
    }
    else {
        particle.sprite.blendMode = PIXI.blendModes.NORMAL;
    }

    particle.sprite.tint = ~~particle.color[2] + 256 * ~~particle.color[1] + 65536 * ~~particle.color[0];
    particle.sprite.alpha = particle.color[3];

}



/**
 * we need a phaser-compatible object that hold the emitter particles
 */
Phaser.Plugin.EPSY.Emitter = function (particleSystem, emitter) {
    PIXI.DisplayObjectContainer.call(this);
    this.particleSystem = particleSystem;
    this.emitter = emitter;
}
Phaser.Plugin.EPSY.Emitter.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Phaser.Plugin.EPSY.Emitter.prototype.constructor = Phaser.Plugin.EPSY.Emitter;


Phaser.Plugin.EPSY.Emitter.prototype.preUpdate = function () { };
Phaser.Plugin.EPSY.Emitter.prototype.postUpdate = function () { };
Phaser.Plugin.EPSY.Emitter.prototype.destroy = function () { };
Phaser.Plugin.EPSY.Emitter.prototype.update = function () {
    var timestamp = Date.now();
    var delta = timestamp - (this.__ez_parent.lastTimestamp || timestamp);

    this.__ez_parent.lastTimestamp = timestamp;
    delta /= 1000;


    var emitter = this.emitter;
    emitter.update(delta);
    for (var i = 0; i < emitter.particles.length; ++i) {
        var p = emitter.particles[i];
        if (p.life > 0 && p.color) {
            updateParticle.call(this.particleSystem, emitter, p);
        }

    }
};

Phaser.Plugin.EPSY.Emitter.prototype.reset = function () {
    var buffer = this.emitter.buffer;
    var container = this.emitter.container;

    do {
        var sprite = buffer.pop();
        if (!sprite) continue;
        container.removeChild(sprite);

        if (sprite.__parentParticle) sprite.__parentParticle.inserted = false;

    } while (buffer.length > 0);
}



Phaser.Plugin.EPSY.prototype.createEmitter = function (config, x, y) {
    x = x || 0;
    y = y || 0;
    var emitter = new EPSY.Emitter(config);

    emitter.buffer = [];
    //force particle system pos to 0,0 so we can position it with phaser positions.x/y
    emitter.settings.pos.x = 0;
    emitter.settings.pos.y = 0;


    this.emitters.push(emitter);
    emitter.container = new Phaser.Plugin.EPSY.Emitter(this, emitter);
    emitter.container.position.x = x;
    emitter.container.position.y = y;

    emitter.zIndex = config.zIndex;

    emitter.container.__ez_parent = emitter;
    emitter.lastTimestamp = Date.now();

    return emitter.container;
}

Phaser.Plugin.EPSY.prototype.loadSystem = function (config, x, y) {

    x = x || 0;
    y = y || 0;

    var systemGroup = game.add.group();
    var origin = { x: 0, y: 0 };

    var parseddata;

    if (typeof config == 'string') {
        parseddata = JSON.parse(_data);
    }
    else {
        if (typeof config == 'object' && !(config instanceof Array)) parseddata = [config];
        else parseddata = config;
    }


    for (var i = 0; i < parseddata.length; i++) {
        var config = parseddata[i];
        var emitter = this.createEmitter(config, config.pos.x, config.pos.y);
        systemGroup.add(emitter);
    }
    systemGroup.position.x = x;
    systemGroup.position.y = y;
    systemGroup.children.sort(this._sortFn);

    return systemGroup;
}
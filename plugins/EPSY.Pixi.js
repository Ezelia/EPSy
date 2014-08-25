PIXI.EPSY = function () {
    PIXI.DisplayObjectContainer.call(this);


    //this.container = new PIXI.EPSYContainer(this);

    this._sortFn = function (a, b) { return (a.__z || 0) - (b.__z || 0) };

    this.lastTimestamp = Date.now();
    this.emitters = [];

    this.particleRenderer = new EPSY.PixiRenderer(this);
}
PIXI.EPSY.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PIXI.EPSY.prototype.constructor = PIXI.EPSY;

PIXI.EPSY.prototype.updateTransform = function () {
    var timestamp = new Date().getTime();
    var delta = timestamp - (this.lastTimestamp || timestamp);
    this.lastTimestamp = timestamp;
    delta /= 1000;

    for (var i = 0; i < this.emitters.length; i++) {
        var emitter = this.emitters[i];
        if (!emitter) continue;

        emitter.update(delta);
        this.particleRenderer.render(emitter);
    }


    PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
};

PIXI.EPSY.prototype.createEmitter = function (config, x, y) {

    var emitter = new EPSY.Emitter(config);
    if (x != undefined) emitter.settings.pos.x = x;
    if (y != undefined) emitter.settings.pos.y = y;

    emitter.restart();

    this.emitters.push(emitter);

    emitter.container = new PIXI.DisplayObjectContainer();
    this.addChild(emitter.container);

    emitter.zIndex = config.zIndex;

    return emitter;
}

PIXI.EPSY.prototype.loadSystem = function (config, x, y) {
    x = x || 0;
    y = y || 0;

    var parseddata;

    if (typeof config == 'string') {
        parseddata = JSON.parse(config);
    }
    else {
        if (typeof config == 'object' && !(config instanceof Array)) parseddata = [config];
        else parseddata = config;
    }

    for (var i = 0; i < parseddata.length; i++) {
        var config = parseddata[i];
        config.pos.x += x;
        config.pos.y += y;

        this.createEmitter(config);
    }

    this.children.sort(this._sortFn);
}
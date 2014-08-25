EPSY.CanvasHelper = function (context) {
    this.lastTimestamp = Date.now();
    this.emitters = [];

    this.canvasRenderer = new EPSY.CanvasRenderer(context);
}



EPSY.CanvasHelper.prototype.draw = function () {
    var timestamp = new Date().getTime();
    var delta = timestamp - (this.lastTimestamp || timestamp);
    this.lastTimestamp = timestamp;
    delta /= 1000;

    for (var i = 0; i < this.emitters.length; i++) {
        var emitter = this.emitters[i];
        if (!emitter) continue;

        emitter.update(delta);
        this.canvasRenderer.render(emitter);
    }
}

EPSY.CanvasHelper.prototype.createEmitter = function (config, x, y) {

    var emitter = new EPSY.Emitter(config);
    if (x != undefined) emitter.settings.pos.x = x;
    if (y != undefined) emitter.settings.pos.y = y;

    emitter.restart();

    this.emitters.push(emitter);
    return emitter;
}

EPSY.CanvasHelper.prototype.loadSystem = function (config, x, y) {
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

}
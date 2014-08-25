module EPSY.utils.obj {



    export function clone(obj, props) {
        var clone = {};
        this.extend(clone, obj);
        return clone;
    }
    export function extend(obj, config) {
        for (var prop in config) {
            if (config.hasOwnProperty(prop)) {
                obj[prop] = config[prop];
            }
        }
    }

    export function recursiveExtend(obj, config, exceptions) {
        exceptions = exceptions || [];
        for (var prop in config) {
            if (config.hasOwnProperty(prop)) {
                if (exceptions.indexOf(prop) > - 1) {
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
    export function recursiveExtendInclusive(obj, config, whitelist:any[]) {
        if (!whitelist || !whitelist.length || whitelist.length <= 0) return;

        for (var prop in config) {
            if (whitelist.indexOf(prop) >= 0) {

                if (typeof config[prop] === 'object') {
                    if (!obj[prop]) obj[prop] = {};
                    this.recursiveExtend(obj[prop], config[prop]);
                } else {
                    obj[prop] = config[prop];
                }
                
            }
        }
    }

 


}


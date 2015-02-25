/// <reference path="../lib/pixi.d.ts" />
declare module EPSY.utils.math {
    function toRad(deg: any): number;
    function isNumber(i: any): boolean;
    function isInteger(num: any): boolean;
    function frandom(min: any, max: any): any;
    function irandom(min: any, max: any): number;
    function normalize(vector: any): void;
}
declare module EPSY.utils.obj {
    function clone(obj: any, props: any): {};
    function extend(obj: any, config: any): void;
    function recursiveExtend(obj: any, config: any, exceptions: any): void;
    function recursiveExtendInclusive(obj: any, config: any, whitelist: any[]): void;
}
declare module EPSY {
    var EmitterParams: string[];
    class Emitter {
        public id: string;
        public container: any;
        public settings: EmitterEntity;
        private time;
        public _baseSystem: any;
        public _totalParticles: number;
        public emissionRate: number;
        public allOrNone: boolean;
        public aFactor: {
            x: number;
            y: number;
        };
        public xFactor: {
            x: number;
            y: number;
        };
        private _xEquation;
        private _yEquation;
        private _xEqName;
        private _yEqName;
        private _posTransform;
        public active: boolean;
        public duration: number;
        public cycles: number;
        private _particlePool;
        private _particleCount;
        private _particleIndex;
        private _elapsed;
        private _curCycle;
        private _emitCounter;
        public border: {
            top: number;
            left: number;
            bottom: number;
            right: number;
        };
        public recyclable: any[];
        constructor(system: any);
        public zIndex : number;
        public xEquation : string;
        public yEquation : string;
        public posTransform : any;
        public particles : Particle[];
        public totalParticles : number;
        public load(config: any): void;
        public save(): any;
        public restart(): void;
        public reset(): void;
        private _isFull();
        private createParticle();
        private initParticle(particle);
        private updateParticle(p, delta, i);
        public kill(): void;
        public update(delta: any): void;
    }
}
declare module EPSY {
    class EmitterEntity {
        public pos: {
            x: number;
            y: number;
        };
        public posVar: {
            x: number;
            y: number;
        };
        public speed: number;
        public speedVar: number;
        public angle: number;
        public angleVar: number;
        public life: number;
        public lifeVar: number;
        public radius: number;
        public radiusVar: number;
        public texture: string;
        public textureAdditive: boolean;
        public startScale: number;
        public startScaleVar: number;
        public endScale: number;
        public endScaleVar: number;
        public startColor: number[];
        public startColorVar: number[];
        public endColor: number[];
        public endColorVar: number[];
        public colorList: any[];
        public gravity: {
            x: number;
            y: number;
        };
        public radialAccel: number;
        public radialAccelVar: number;
        public tangentialAccel: number;
        public tangentialAccelVar: number;
    }
}
declare module EPSY {
    class Particle extends EmitterEntity {
        public scale: number;
        public deltaScale: number;
        public deltaColor: any[];
        public lastpos: {
            x: number;
            y: number;
        };
        public vel: {
            x: number;
            y: number;
        };
        public color: any[];
        public forces: {
            x: number;
            y: number;
        };
        public radial: {
            x: number;
            y: number;
        };
        public tangential: {
            x: number;
            y: number;
        };
        public colorIdx: number;
        public recycled: boolean;
        constructor();
        public setVelocity(angle: any, speed: any): void;
    }
}
declare module EPSY {
    class CanvasRenderer {
        public context: any;
        private defaultTexture;
        constructor(context: any);
        private renderParticle(particle);
        public render(emitter: Emitter): void;
        public reset(): void;
    }
}
declare module EPSY {
    class PixiRenderer {
        public context: any;
        private defaultTexture;
        private buffer;
        private _sortFn;
        constructor(context: any);
        private updateParticleSprite(emitter, particle);
        public render(emitter: Emitter): void;
        public hideAllParticles(emitter: Emitter): void;
        public sort(): void;
        public reset(): void;
    }
}

module EPSY {

    /*
    */
    export class EmitterEntity {

        public pos = { x: 0, y: 0 };
        public posVar = { x: 0, y: 0 };

        public speed = 0;
        public speedVar = 0;

        public angle = 0;
        public angleVar = 0;

        public life = 0;
        public lifeVar = 0;

        public radius = 0;
        public radiusVar = 0;

        public texture: string;

        public textureAdditive = false;

        public startScale = 0;
        public startScaleVar = 0;
        public endScale = 0;
        public endScaleVar = 0;

        public startColor = [0,0,0,0];
        public startColorVar = [0,0,0,0];
        public endColor=[0,0,0,0];
        public endColorVar = [0, 0, 0, 0];


        public colorList = [];

        public gravity = { x: 0, y: 0 };

        public radialAccel = 0;
        public radialAccelVar = 0;
        public tangentialAccel = 0;
        public tangentialAccelVar = 0;

    }
}



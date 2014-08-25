module EPSY {
    export class Particle extends EmitterEntity {

        public scale: number;
        public deltaScale: number;
        public deltaColor: any[];

        public lastpos = { x: -1, y: -1 };        
        public vel = { x: 0, y: 0 };
        public color: any[];

        public forces = { x: 0, y: 0 };
        public radial = { x: 0, y: 0 };
        public tangential = { x: 0, y: 0 };

        public colorIdx = 0;

        public recycled = false;

        constructor() {
            super();
            this.setVelocity(0, 0);
        }


        setVelocity(angle, speed) {
            this.vel.x = Math.cos(utils.math.toRad(angle)) * speed;
            this.vel.y = -Math.sin(utils.math.toRad(angle)) * speed;
        }
    }
}



module EPSY.utils.math {
    export function toRad(deg) {
        return Math.PI * deg / 180;
    }

    export function isNumber(i) {
        return typeof i === 'number';
    }

    export function isInteger(num) {
        return num === (num | 0);
    }


    export function frandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    export function irandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    /*
     * Given a vector of any length, returns a vector
     * pointing in the same direction but with a magnitude of 1
     */
    export function normalize(vector) {
        var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

        vector.x /= length;
        vector.y /= length;
    }
}


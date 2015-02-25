EPSy
=========

EPSy (Ezelia Particles Syetem) is a particle system mainly designed for [Phaser.io](https://github.com/photonstorm/phaser) and [Pixi.js](https://github.com/GoodBoyDigital/pixi.js/), 
but can also be used standalone with an integrated Canvas renderer.

Use the [online editor](http://labs.ezelia.com/epsy/) to generate awesome particles then export and use the data with EPSY !

EPSy is inspired from [Matt Greer](http://www.mattgreer.org/) excellent tutorial about particles systems.

Usage
======
First you'll need to reference EPSY.js or EPSY.min.js script in your html file

```
<script src="js/EPSY.min.js"></script>
```

then reference one of the plugins, depending on your library

### Pixi plugin
reference the Pixi plugin

```
<script src="js/EPSY.Pixi.js"></script>
```

```
        stage = new PIXI.Stage(0x000000);
        renderer = PIXI.autoDetectRenderer(800, 600);
        document.getElementById('canvasContainer').appendChild(renderer.view);

        //Creating EPSy emitter instance
        var epsy = new PIXI.EPSY();

        //creating a particle system from a given configuration
        epsy.loadSystem(config, 400, 400);


        stage.addChild(epsy);

	
```


### Phaser plugin
reference the Phaser plugin

```
<script src="js/EPSY.Phaser.js"></script>
```

```
        var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameContainer', { preload: preload, create: create, update: update, render: render });
        function create() {
            // ... your game creation code ...

            //Registering EPSy plugin
            var epsy = game.plugins.add(Phaser.Plugin.EPSY);           
            
            //creating a particle system from a given configuration
            var particleSystem1 = epsy.loadSystem(config, 200, 200);


            // you can let Phaser add the particle system to world group or choose to add it to a specific group
            var myGroup = game.add.group();

            myGroup.add(particleSystem1);
            
        }
```


### Standalone Canvas Renderer plugin
reference the CanvasHelper plugin

```
<script src="js/EPSY.CanvasHelper.js"></script>
```

```
        var context = canvas.getContext('2d');
        
		//creating canvas helper instance
        var canvasHelper = new EPSY.CanvasHelper(context);
        
		//creating a particle system from a given configuration
        canvasHelper.loadSystem(config, 400, 400);
        
```

then in your drawing loop call

```
canvasHelper.draw();
```


Particle System Configuration 
=============================
You can use the online editor to generate configurations : http://labs.ezelia.com/epsy/

or you can write them manually.


EPSy configuration can be an object or an array of objects containing each the following configuration

### id: string
you can use this to identify your emitter

### pos : {x:number, y:number}

### border : {top: number, left: number, bottom: number, right: number}

### posVar : {x:number, y:number}


### gravity : {x:number, y:number}

### speed : number

### speedVar : number

### radialAccel :number
### radialAccelVar :number
### tangentialAccel : number
### tangentialAccelVar : number


### angle : number

### angleVar : number
                
### life : number
Particles life in seconds

### lifeVar : number
Particles life variance


### radius : number
Particles start radius (will be modified whith the scale parameter)

### radiusVar : number                

### startScale : number

### startScaleVar: number

### endScale: number

### endScaleVar: number

                
### textureAdditive: boolean

### texture : string
a path to an image or URL data

### startColor: [r,g,b,a]
### startColorVar: [r,g,b,a]
### endColor: [r,g,b,a]
### endColorVar: [r,g,b,a]

               
### totalParticles: number
### emissionRate: number

                
### duration: number or Infininy
emitter life duration in seconds

                
### zIndex: number
in case of an array of emitters, this will determine the Z order



Examples
========

### Flame emitter configuration example

```
var config = {
    totalParticles: 150,
    emissionRate: 80,
    pos: {
        x: 150,
        y: 250
    },
    posVar: {
        y: 0,
        x: 10
    },
    gravity: {
        x: - 0,
        y: - 200
    },
    texture: "img/particle.png",
    xEquation: '',
    yEquation: '',
    angle: 90,
    angleVar: 360,
    speed: 15,
    speedVar: 5,
    life: 2,
    lifeVar: 1,
    radialAccel: 0,
    radialAccelVar: 0,
    tangentialAccel: 0,
    tangentialAccelVar: 0,
    textureEnabled: true,
    textureAdditive: true,
    radius: 30,
    radiusVar: 5,
    startScale: 2,
    endScale: 1,
    startColor: [178, 102, 51, 1],
    startColorVar: [0, 0, 51, 0.1],
    endColor: [0, 0, 0, 1],
    active: true,
    duration: Infinity
}
```


### Flame with smoke configuration example 
this one uses an array of two emitters
```
var config = [
    {
        "pos": {
            "x": 3,
            "y": -5
        },
        "posVar": {
            "x": 10,
            "y": 0
        },
        "speed": 15,
        "speedVar": 5,
        "angle": 90,
        "angleVar": 360,
        "life": 2,
        "lifeVar": 1,
        "radius": 30,
        "radiusVar": 5,
        "textureAdditive": true,
        "startScale": 2,
        "startScaleVar": 0,
        "endScale": 1,
        "endScaleVar": 0,
        "startColor": [
            178,
            102,
            51,
            1
        ],
        "startColorVar": [
            0,
            0,
            51,
            0.1
        ],
        "endColor": [
            0,
            0,
            0,
            1
        ],
        "endColorVar": [
            0,
            0,
            0,
            0
        ],
        "gravity": {
            "x": 0,
            "y": -200
        },
        "radialAccel": 0,
        "radialAccelVar": 0,
        "tangentialAccel": 0,
        "tangentialAccelVar": 0,
        "texture": "img/particle.png",
        "totalParticles": 50,
        "emissionRate": 20,
        "textureEnabled": true,
        "active": true,
        "duration": null,
        "id": "emitter1",
        "border": {
            "top": 57.80186188689731,
            "left": 200,
            "bottom": 200,
            "right": 200
        },
        "zIndex": 1
    },
    {
        "pos": {
            "x": 1,
            "y": -32
        },
        "posVar": {
            "x": 5,
            "y": 0
        },
        "speed": 15,
        "speedVar": 5,
        "angle": 90,
        "angleVar": 20,
        "life": 2,
        "lifeVar": 0.5,
        "radius": 20,
        "radiusVar": 5,
        "textureAdditive": false,
        "startScale": 2,
        "startScaleVar": 0,
        "endScale": 4,
        "endScaleVar": 0,
        "startColor": [
            144,
            144,
            144,
            1
        ],
        "startColorVar": [
            0,
            0,
            0,
            0
        ],
        "endColor": [
            187,
            187,
            187,
            0.2
        ],
        "endColorVar": [
            0,
            0,
            0,
            0
        ],
        "colorList": [],
        "gravity": {
            "x": 0,
            "y": -50
        },
        "radialAccel": 0,
        "radialAccelVar": 0,
        "tangentialAccel": 0,
        "tangentialAccelVar": 0,
        "texture": "img/particle.png",
        "totalParticles": 20,
        "emissionRate": 20,

        "textureEnabled": true,
        "active": true,
        "duration": null,
        "id": "emitter2",
        "border": {
            "top": 200,
            "left": 200,
            "bottom": 200,
            "right": 200
        },
        "zIndex": 0
    }
]

```
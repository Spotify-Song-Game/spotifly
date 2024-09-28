//CONSTANTS
const NUM_BARS = 30; //the number of bars you should see on screen
const bar_width = 810/NUM_BARS; // width of each bar
const MIN_Y = 600; //minimum y level before game resets cube (BROKEN)
const MAX_SPEED = 5; //speed cap (BROKEN)
const ORIGIN = {x: 400, y: 200} //where to teleport cube when out of bounds (BROKEN)
const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 800;

// makes life easier so we don't have to call from matter class all the time
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var engine = Engine.create(); //instantiates the engine object which runs the physics engine

var render = Render.create({ //instantiates a render object which actually displays the page
    element: document.body, //sets the element attribute to render within the document body
    engine: engine, //sets the engine attribute of render to the recently instantiated engine object above
    options: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        wireframes: false
    }
});

// creating a square that should represent the player
var playerBox = Bodies.rectangle(400, 200, 55, 55, {
    render: {
        fillStyle: 'cyan'
    }
}); 

var enemyBoxes = [] //empty array for adding enemy boxes
for(var i=0; i<5; i++){
    var enemyBox = Bodies.rectangle(i*200+10, 400, 55, 55, {
        render: {
            fillStyle: 'red'
        }
    });
    enemyBox.restitution = 1.5//sets bounce/elasticity to more than 1 so it bounces a lot
    enemyBoxes.push(enemyBox); //adds enemyBox to enemyboxes array 
}
engine.gravity = {x: 0, y: 1, scale: 0.0005}
playerBox.restitution = 0;

var ground = [];
var barHeights = Array(NUM_BARS).fill(400);
for (let i = 0; i < NUM_BARS; i++) {
    ground.push(Bodies.rectangle(bar_width/2 + bar_width * i, 610, bar_width, barHeights[i], { isStatic: true }));
}

var walls = [];
walls.push(Bodies.rectangle(-80,200, 80, 10000, {isStatic: true}))
walls.push(Bodies.rectangle(840,200, 80, 10000, {isStatic: true}))

// add all of the bodies to the world
Composite.add(engine.world, playerBox);
Composite.add(engine.world, ground);
Composite.add(engine.world, walls);
//Composite.add(engine.world, Bodies.rectangle(300, -10, 1000, 10, {isStatic: true}))
// Composite.add(engine.world, enemyBoxes);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();
var audio = new Audio(); 

audio.id = "audio_player";
audio.src = "mp3/505.mp3";
audio.controls = true; // not going to exist in the final, but for now it provides a button to start the music which starts the bars
audio.loop = false; // loop or don't loop
audio.autoplay = false; // maybe true later down the line? Automatically starts the music. We probably link the start of the music to a start button though.
window.addEventListener( // This is pretty useless at the end for our project, but we will need SOME event listener for when the game starts, that will then start song + bars
    "load",
    function() {
        document.getElementById("audio").appendChild(audio);

        document.getElementById("audio_player").onplay = function() {
            if (typeof(context) === "undefined") {
                context = new AudioContext(); // Make an audio context, basically a graph with nodes, used in analysis
                analyser = context.createAnalyser(); // Actually make the analyser which will then give us frequencyBinCount - used for visualizer
                source = context.createMediaElementSource(audio); // Necessary js bs, source for media, used to connect audio - analyser

                source.connect(analyser); // Connect the audio to the analyser
                analyser.connect(context.destination); // connect the analyser
            }
            
            animateBars();
        };
    },
    false
);


class inputHandler {
	constructor(){
		this.keys = [];
		window.addEventListener('keydown', e => { //<!-- ****  JavaScript Feature submission **** -->
			if ((e.key === 'ArrowLeft' ||
				e.key === 'ArrowRight' ||
				e.key === ' '  //space check
				) && this.keys.indexOf(e.key) === -1){
				this.keys.push(e.key);
				}
			//console.log(e.key, this.keys);
		});

		window.addEventListener('keyup', e => {
			if ((e.key === 'ArrowLeft' ||
				e.key === 'ArrowRight' ||
				e.key === ' ' && e.repeat === false //space check
				)){
				this.keys.splice(this.keys.indexOf(e.key), 1);
				}
			console.log(e.key, this.keys);
		});
	}
}

let input = new inputHandler();

function animateBars(){
    
    //requests function call on next frame
    window.RequestAnimationFrame =
        window.requestAnimationFrame(animateBars) ||
        window.msRequestAnimationFrame(animateBars) ||
        window.mozRequestAnimationFrame(animateBars) ||
        window.webkitRequestAnimationFrame(animateBars);

    
    fbc_array = new Uint8Array(analyser.frequencyBinCount); // Read about it yourself https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/frequencyBinCount

    analyser.getByteFrequencyData(fbc_array); // This is the only thing I don't yet understand, but it's the most important part
    //https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData

    Composite.remove(engine.world, ground);

    for (let i = 0; i < NUM_BARS; i++) {
        barHeights[i] = -(fbc_array[i] / 2);
        if (barHeights[i] > -10){
            barHeights[i] = -10
        }
        ground[i]=Bodies.rectangle(bar_width/2 + bar_width*i, 610, bar_width, barHeights[i]*4, {isStatic: true});
    }

        //alert("dawdj");
    Composite.add(engine.world, ground);

    //player constraints

    /*
    if(playerBox.position.y > MIN_Y){ //this is broken idk why
        Matter.Body.setPosition(ORIGIN);
    }
    
    if(playerBox.speed > 3){ //idk if this works
        var unitVector = playerBox.velocity / playerBox.speed;
        Matter.Body.setVelocity(playerBox, unitVector * 3);
    }
    */


    var force = 0.01;
    if(input.keys.includes('ArrowLeft')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: -force, y: 0 });
    }
    if(input.keys.includes('ArrowRight')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: force, y: 0 });
    }
    if(input.keys.includes('ArrowUp')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: 0, y: -force });
    }
    if(input.keys.includes('ArrowDown')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: 0, y: force });
    }

}

// run the engine
Runner.run(runner, engine);

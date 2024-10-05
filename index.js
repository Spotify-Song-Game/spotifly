//
//CONSTANTS
//
const Engine = Matter.Engine, // makes life easier so we don't have to call from matter class all the time
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Body = Matter.Body;

const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 600;

const NUM_BARS = 60; //the number of bars you should see on screen
const bar_width = SCREEN_WIDTH/NUM_BARS; // width of each bar

const PLAYER_SIZE = 25;
const PLAYER_MASS = 50;

const ENEMY_SIZE = 25;
const ENEMY_MASS = 50;
const MAX_ENEMIES = 5; //max number of enemies on screen


const MIN_Y = 600; //minimum y level before game resets cube (BROKEN)
const MAX_SPEED = 10; //speed cap (BROKEN)
const ORIGIN = {x: 400, y: 200} //where to teleport cube when out of bounds (BROKEN)

//
//VARIABLES
//
var numEnemies = 0;
var points = 0;
var gameRunning = false;

//
//ENGINE SHENANIGANS
//
var engine = Engine.create(); //instantiates the engine object which runs the physics engine
var render = Render.create({ //instantiates a render object which actually displays the page
    element: document.body, //sets the element attribute to render within the document body
    engine: engine, //sets the engine attribute of render to the recently instantiated engine object above
    options: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        wireframes: false,
        background: '#000000'
    }
});
engine.gravity = {x: 0, y: 1, scale: 0.001}

//
//PLAYER AND ENEMY SHENANIGANS
//

//PLAYER
// creating a square that should represent the player
var playerBox = Bodies.rectangle(400, 200, PLAYER_SIZE, PLAYER_SIZE, {
    render: {
        fillStyle: 'cyan'
    }
}); 
Matter.Body.setInertia(playerBox, Infinity); //stop rotation
playerBox.restitution = 0; //bounciness = NO
Matter.Body.setMass(playerBox,PLAYER_MASS);

//ENEMY
var enemyBoxes = [] //empty array for adding enemy boxes

for(var i=0; i<5; i++){
    var enemyBox = Bodies.rectangle(i*200+10, 400, ENEMY_SIZE, ENEMY_SIZE, {
        render: {
            fillStyle: 'red'
        }
    });
    enemyBox.restitution = 1.3//sets bounce/elasticity to more than 1 so it bounces a lot
    enemyBoxes.push(enemyBox); //adds enemyBox to enemyboxes array 
    Matter.Body.setMass(enemyBox,PLAYER_MASS);
}

//
//BAR INSTANTIATION
//
var bars = [];
var barHeights = Array(NUM_BARS).fill(200); //value in fill is default bar height
//sets default bar heights
for (let i = 0; i < NUM_BARS; i++) {
    bars.push(Bodies.rectangle(bar_width/4 + bar_width * i, 600, bar_width, barHeights[i], { isStatic: true }));
}

//
//BORDER SHENANIGANS
//
var borderBarWidth = 80
var borders = [];
borders.push(Bodies.rectangle(-borderBarWidth/2, 0, borderBarWidth, 10000, {isStatic: true}))
borders.push(Bodies.rectangle(SCREEN_WIDTH + borderBarWidth/2,0, borderBarWidth, 10000, {isStatic: true}))

//
//ADD BODIES
//
Composite.add(engine.world, playerBox);
Composite.add(engine.world, bars);
Composite.add(engine.world, borders);
Composite.add(engine.world, enemyBoxes);

// run the renderer
Render.run(render);
// create runner
var runner = Runner.create();
var audio = new Audio(); 

createAudioPlayer();
class inputHandler {
    constructor(){
        this.keys = [];
		window.addEventListener('keydown', e => { //<!-- ****  JavaScript Feature submission **** -->
			if ((e.key === 'ArrowLeft' ||
				e.key === 'ArrowRight' ||
				e.key === 'ArrowUp' ||
                e.key === 'ArrowDown' ||
                e.key === 'w' ||
                e.key === 'a' ||
                e.key === 's' ||
                e.key === 'd'
				) && this.keys.indexOf(e.key) === -1){
				    this.keys.push(e.key);
				}
		});
		window.addEventListener('keyup', e => {
			if ((e.key === 'ArrowLeft' ||
				e.key === 'ArrowRight' ||
				e.key === 'ArrowUp' ||
                e.key === 'ArrowDown' ||
                e.key === 'w' ||
                e.key === 'a' ||
                e.key === 's' ||
                e.key === 'd'
				)){
				    this.keys.splice(this.keys.indexOf(e.key), 1);
				}
		});
	}
}
let input = new inputHandler();

var count=0;

Events.on(engine, 'beforeUpdate', limitMaxSpeed);

function frameUpdate(){
    count++;
    //requests function call on next frame
    window.RequestAnimationFrame =
        window.requestAnimationFrame(frameUpdate) ||
        window.msRequestAnimationFrame(frameUpdate) ||
        window.mozRequestAnimationFrame(frameUpdate) ||
        window.webkitRequestAnimationFrame(frameUpdate);

    if(count==12){
        setBarsToMusic();
        count=0;
    }        
    inputReader();
}
// run the engine
Runner.run(runner, engine);

//
//
//FUNCTIONS AND CLASSES
//
//

function createAudioPlayer(){
    audio.id = "audio_player";
    audio.src = "mp3/beautiful.mp3";
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
                frameUpdate();
            };
        },
        false
    );
}
function inputReader(){
    var force = 0.05;
    if(input.keys.includes('ArrowLeft') || input.keys.includes('a')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: -force, y: 0 });
    }
    if(input.keys.includes('ArrowRight') || input.keys.includes('d')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: force, y: 0 });
    }
    if(input.keys.includes('ArrowUp') || input.keys.includes('w')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: 0, y: -force });
    }
    if(input.keys.includes('ArrowDown') || input.keys.includes('s')) {
        Matter.Body.applyForce(playerBox, playerBox.position, { x: 0, y: force });
    }
}
function setBarsToMusic(){
    fbc_array = new Uint8Array(analyser.frequencyBinCount); // Read about it yourself https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/frequencyBinCount
    analyser.getByteFrequencyData(fbc_array); // This is the only thing I don't yet understand, but it's the most important part
    //https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData

    Composite.remove(engine.world, bars); //removes old bars

    for (let i = 0; i < NUM_BARS; i++) { //loops across ground 
        barHeights[i] = -(fbc_array[i] / 2);
        if (barHeights[i] > -10){
            barHeights[i] = -10
        }
        //adjust height of bars
        var singleBar = Bodies.rectangle(
            x = bar_width/2 + bar_width*i, 
            y = 610, 
            width = bar_width, 
            height = barHeights[i]*5, 
            options = {
                isStatic: true,
                restitution: 2
                },
            render = {
                fillStyle: 'white',
            }); 
        bars[i]=singleBar;
    }
        //alert("dawdj");

    Composite.add(engine.world, bars);
}
function limitMaxSpeed(){
    let maxSpeed = MAX_SPEED;
    if (playerBox.velocity.x > maxSpeed) {
        Body.setVelocity(playerBox, { x: maxSpeed, y: playerBox.velocity.y });
    }

    if (playerBox.velocity.x < -maxSpeed) {
        Body.setVelocity(playerBox, { x: -maxSpeed, y: playerBox.velocity.y });
    }

    if (playerBox.velocity.y > maxSpeed) {
        Body.setVelocity(playerBox, { x: playerBox.velocity.x, y: maxSpeed });
    }

    if (playerBox.velocity.y < -maxSpeed) {
        Body.setVelocity(playerBox, { x: -playerBox.velocity.x, y: -maxSpeed });
    }
}
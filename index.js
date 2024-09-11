//CONSTANTS
const NUM_BARS = 30; //the number of bars you should see on screen
const bar_width = 810/NUM_BARS; // width of each bar
const MIN_Y = 600; //minimum y level before game resets cube (BROKEN)
const MAX_SPEED = 5; //speed cap (BROKEN)
const ORIGIN = {x: 400, y: 200} //where to teleport cube when out of bounds (BROKEN)

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var engine = Engine.create();
var render = Render.create({
    element: document.body,
    engine: engine
});


var playerBox = Bodies.rectangle(400, 200, 55, 55);
var enemyBoxes = []
for(var i=0; i<5; i++){
    var tempBox = Bodies.rectangle(i*200+10, 400, 55, 55)
    tempBox.restitution = 1.5
    enemyBoxes.push(tempBox);
}
engine.gravity = {x: 0, y: 1, scale: 0.0005}
playerBox.restitution = 1.5;



var ground = [];
var barHeights = Array(NUM_BARS).fill(400);
for (let i = 0; i < NUM_BARS; i++) {
    ground.push(Bodies.rectangle(bar_width/2 + bar_width * i, 610, bar_width, barHeights[i], { isStatic: true }));
}

var walls = [];
walls.push(Bodies.rectangle(-80,200, 80, 800, {isStatic: true}))
walls.push(Bodies.rectangle(840,200, 80, 800, {isStatic: true}))


// add all of the bodies to the world
Composite.add(engine.world, playerBox);
Composite.add(engine.world, ground);
Composite.add(engine.world, walls);
Composite.add(engine.world, enemyBoxes);


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
            
            myFunction();
        };
    },
    false
);

function myFunction(){
    
    //requests function call on next frame
    window.RequestAnimationFrame =
        window.requestAnimationFrame(myFunction) ||
        window.msRequestAnimationFrame(myFunction) ||
        window.mozRequestAnimationFrame(myFunction) ||
        window.webkitRequestAnimationFrame(myFunction);

    
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
}

// run the engine
Runner.run(runner, engine);


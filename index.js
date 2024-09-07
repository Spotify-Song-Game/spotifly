// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});

// create two boxes and a ground
var boxA = Bodies.rectangle(0, 0, 80, 80);
var boxB = Bodies.rectangle(400, 200, 80, 80);

var bar_width = 81;
var ground = [];
var barHeights = Array(10).fill(500);
for (let i = 0; i < 10; i++) {
    ground.push(Bodies.rectangle(bar_width/2 + bar_width * i, 610, bar_width, barHeights[i], { isStatic: true }));
}

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB]);
Composite.add(engine.world, ground);


// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();


var audio = new Audio(); 

audio.id = "audio_player";
audio.src = "mp3/test.mp3";
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
    window.RequestAnimationFrame =
        window.requestAnimationFrame(myFunction) ||
        window.msRequestAnimationFrame(myFunction) ||
        window.mozRequestAnimationFrame(myFunction) ||
        window.webkitRequestAnimationFrame(myFunction);

    fbc_array = new Uint8Array(analyser.frequencyBinCount); // Read about it yourself https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/frequencyBinCount

    analyser.getByteFrequencyData(fbc_array); // This is the only thing I don't yet understand, but it's the most important part

    Composite.remove(engine.world, ground);
    for (let i = 0; i < 10; i++) {
        barHeights[i] = -(fbc_array[i] / 2);
        if (barHeights[i] > -3){
            barHeights[i] = -3
        }
        ground[i]=Bodies.rectangle(bar_width/2 + bar_width*i, 610, bar_width, barHeights[i]*10, {isStatic: true});
    }

        //alert("dawdj");
    Composite.add(engine.world, ground);

}

// run the engine
Runner.run(runner, engine);


var canvas, //we don't actually need canvas or anything that draws (ie, ctx and canvas stuff)
// Because we are using matter.js to render, so we don't need to render ourselves using js.
    ctx,
    source,
    context,
    analyser,
    fbc_array,
    bar_count,
    bar_pos,
    bar_width,
    bar_height;

var audio = new Audio(); // We need to make an audio so we can actually analyze it using js's analyzer

audio.id = "audio_player"; // this just gives it a reference so we can change it later
audio.src = "mp3/test.mp3"; // obvious, the source of the audio, I don't know if it has to be mp3, but for now it is.
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
                canvas = document.getElementById("canvas");
                ctx = canvas.getContext("2d");
                source = context.createMediaElementSource(audio); // Necessary js bs, source for media, used to connect audio - analyser

                canvas.width = window.innerWidth * 0.80;
                canvas.height = window.innerHeight * 0.60;

                source.connect(analyser); // Connect the audio to the analyser
                analyser.connect(context.destination); // connect the analyser
            }
            
            FrameLooper();
        };
    },
    false
);

function FrameLooper() { // This is the bar animation. Most of it is obsolete
    window.RequestAnimationFrame =
        window.requestAnimationFrame(FrameLooper) ||
        window.msRequestAnimationFrame(FrameLooper) ||
        window.mozRequestAnimationFrame(FrameLooper) ||
        window.webkitRequestAnimationFrame(FrameLooper);

    fbc_array = new Uint8Array(analyser.frequencyBinCount); // Read about it yourself https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/frequencyBinCount
    bar_count = window.innerWidth / 50;

    analyser.getByteFrequencyData(fbc_array); // This is the only thing I don't yet understand, but it's the most important part

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    //console.log("otooo")
    for (var i = 0; i < bar_count; i++) { // animating the bars, only useful part is seeing what is done with fbc_array, which stores the values used to move the bars
        bar_pos = i * 30;
        bar_width = 30;
        bar_height = -(fbc_array[i] / 2); // Move the bars according to fbc_array

        ctx.fillRect(bar_pos, canvas.height, bar_width, bar_height);
    }
}
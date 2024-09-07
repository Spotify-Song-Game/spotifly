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

var bar_width = 81
var ground = []

for (let i = 0; i < 10; i++) {
    ground.push(Bodies.rectangle(bar_width/2 + bar_width * i, 610, bar_width, Math.random() * 500, { isStatic: true }));
}

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB]);
Composite.add(engine.world, ground);


// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);
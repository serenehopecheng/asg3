// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                     // Use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);            // Use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);     // Use texture0
    } else {
      gl_FragColor = vec4(1.2, 1.2, 1.2, 1);           // Error, put reddish
    }
  }
`;

// var FSHADER_SOURCE = `
//   precision mediump float;
//   varying vec2 v_UV;
//   uniform vec4 u_FragColor;
//   uniform sampler2D u_Sampler0;
//   void main() {
//     gl_FragColor = u_FragColor;
// \  }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_Sampler0;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

   // Get the storage location of u_GlobalRotateMatrix
   u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
   if (!u_GlobalRotateMatrix) {
     console.log('Failed to get the storage location of u_GlobalRotateMatrix');
     return;
   }
 
   // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
    }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_globalAngle = 5

let g_rightArm = 5;
let g_rightForearm = -10;
let g_leftArm = 5;
let g_leftForearm = -10;
let g_leftLeg = 5;
let g_leftCalf = -10;
let g_rightLeg = 5;
let g_rightCalf = -10;
let g_animation = false;
let g_neck = 2;
let g_head = -2;
let g_rightEar = 1;
let g_leftEar = 1;

let g_rotX = 0;   
let g_rotY = 0;  

let g_dragging = false;
let g_lastX = 0, g_lastY = 0;

let g_poking = false;
let g_pokeStart = 0;
const POKE_LENGTH = 2.0;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // mouse press
  canvas.onmousedown = (e) => {
    g_dragging = true;
    g_lastX = e.clientX;
    g_lastY = e.clientY;

    if (e.shiftKey) {
      g_poking = true;
      g_pokeStart = g_seconds;
    }
  };

  canvas.onmouseup   =
  canvas.onmouseleave = () => { g_dragging = false;};

  canvas.onmousemove = (e) => {
    if (!g_dragging) return;
    const dx = e.clientX - g_lastX;
    const dy = e.clientY - g_lastY;
    g_rotY += dx * 0.5;  
    g_rotX += dy * 0.5;   
    g_lastX = e.clientX;
    g_lastY = e.clientY;
    renderAllShapes(); 
  };

  // buttons
  // document.getElementById('onButton').onclick = () => {
  //   g_animation = true;
  // };

  // camera angle
  document.getElementById('angleSlide').addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderAllShapes();
  });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  
  addActionsForHtmlUI();

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  renderAllShapes();
  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  requestAnimationFrame(tick);

}

var g_startTime = performance.now() / 1000.0;
var g_seconds   = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);
  
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;   // x coordinate of a mouse pointer
  var y = ev.clientY;   // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

var g_pace = 3;
let parts = [];
let g_exploding   = false;
let g_fragments   = [];
let g_explodeStart = 0;
const EXPLODE_LEN = 1.5;    

// ChatGPT helped write this function
function startExplosion() {
  if (parts.length === 0) {
    drawGiraffe();
  };
  // if (parts.length === 0) return;
  g_exploding = true;
  g_rightArm = g_leftArm = g_rightLeg = g_leftLeg = 0; g_rightForearm = g_leftForearm = g_rightCalf = g_leftCalf = 0;
  g_explodeStart = g_seconds;
  g_fragments = [];if (parts.length === 0) return;

  parts.forEach(p => {
    const frag = new Cube();
    frag.color  = [...p.color];
    frag.matrix = new Matrix4(p.matrix);   

    g_fragments.push({
      cube: frag,
      vx: (Math.random() - 0.5) * 6,
      vy:  4 + Math.random() * 3,
      vz: (Math.random() - 0.5) * 6,
      spinX: Math.random()*360,
      spinY: Math.random()*360,
      spinZ: Math.random()*360,
    });
  });
}

function updateAnimationAngles() {

  if (g_exploding) {
    const t = g_seconds - g_explodeStart;
  
    g_fragments.forEach(f => {
      const m = new Matrix4(f.cube.matrix);
      m.translate(f.vx * t,
                  f.vy * t - 4.9 * t * t,   // gravity
                  f.vz * t);
      m.rotate(f.spinX * t, 1,0,0);
      m.rotate(f.spinY * t, 0,1,0);
      m.rotate(f.spinZ * t, 0,0,1);
      f.cube.matrix = m;
    });
  
    if (t > EXPLODE_LEN) { g_exploding = false; g_fragments.length = 0; }
        
    return;   // skip normal limb animation
  }

  if (g_poking) {
    const t = g_seconds - g_pokeStart;
    if      (t < 0.7)  g_globalAngle =  90 * (t / 0.7);
    else if (t < 1.3)  g_globalAngle =  90;
    else if (t < POKE_LENGTH) g_globalAngle =  90 * (1 - (t - 1.3) / 0.7);
    else {
      g_poking = false; 
      startExplosion(); 
      g_neckRoll = 0;
      return;
    }
    g_pace = 5;
  
    g_neckRoll = 12*Math.sin(8 * g_seconds);
    g_rightArm = (30*Math.sin(g_pace * g_seconds));
    g_leftArm = (-30*Math.sin(g_pace *g_seconds));

    g_rightForearm = Math.max(-10, (10*Math.sin(g_pace *g_seconds)));
    g_leftForearm = Math.max(-10, (-10*Math.sin(g_pace *g_seconds)));

    g_rightLeg = (30*Math.sin(1.0 * g_pace * g_seconds));
    g_leftLeg = (-30*Math.sin(1.0 * g_pace *g_seconds));

    g_rightCalf = Math.max(-10, (10*Math.sin(g_pace *g_seconds)));
    g_leftCalf = Math.max(-10, (-10*Math.sin(g_pace *g_seconds)));
  }
  if (!g_animation) return;

  const armSin = Math.sin(g_pace * g_seconds);
  const legSin = Math.sin(1.005 * g_pace * g_seconds);

  // recompute leg angles
  g_rightLeg =  15 * legSin;
  g_leftLeg  = -15 * legSin;

  // recompute calf bends (only forward)
  g_rightCalf = Math.max(-8,  15 * armSin);
  g_leftCalf  = Math.max(-8, -15 * armSin);

  // RIGHT ARM: lock at –30° until right leg ≥ 0, then follow sine
  if (!(g_rightLeg >= 14 && g_rightArm < -20)) {
    g_rightArm     =  22 * armSin;
    g_rightForearm =  Math.max(-8, 15 * armSin);
    g_rightEar = 2*Math.sin(g_pace * g_seconds);

  }

  // LEFT ARM: lock at –30° until left leg ≥ 0, then follow sine
  if (!(g_leftArm >= 14 && g_leftArm < -20)) {
    g_leftArm      = -22 * armSin;
    g_leftForearm  = Math.max(-8, -15 * armSin);
  }
  else{
    g_leftEar = 3*Math.sin(g_pace * g_seconds);
  }

  g_neck = 2*Math.sin(g_pace * g_seconds);
  
  g_head = 6*Math.sin(g_pace * g_seconds);
  // g_rightEar = 2*Math.sin(g_pace * g_seconds);
  g_leftEar = 4*Math.sin(g_pace * g_seconds);

}
const giraffeSpots = [
  // initial three
  { x: 0.10, y: 0.20, z: 0.10 },
  { x: 0.70, y: 0.30, z: 0.20 },
  { x: 0.40, y: 0.50, z: 0.05 },

  // additional spots
  { x: 0.25, y: 0.15, z: 0.12 },
  { x: 0.55, y: 0.18, z: 0.08 },
];

const spotColor = [139/255, 69/255, 19/255, 1.0]; 

let big = 0;

let facesM = [
  { t:[ 0,  0,  0.5], r:[   0,1,0,   0] },  // front
  { t:[ 0,  0, -0.5], r:[   0,1,0, 180] },  // back
  { t:[ 0.5,0,  0 ], r:[   0,1,0,  90] },  // right
  { t:[-0.5,0,  0 ], r:[   0,1,0, -90] },  // left
  { t:[ 0,  0.5,0 ], r:[   1,0,0, -90] },  // top
  { t:[ 0, -0.5,0 ], r:[   1,0,0,  90] },  // bottom
  { t:[ 0,  0.25,  0.5], r:[   0,1,0,   0] },  // front
  { t:[ 0,  0.25, -0.5], r:[   0,1,0, 180] },  // back
  { t:[ 0.5,0.25,  0 ], r:[   0,1,0,  90] },  // right
  { t:[ 0.25,0.25,  0 ], r:[   0,1,0,  90] },  // right
  { t:[ -0.5,0.25,  0 ], r:[   0,1,0,  -90] },  // left
];
let facesL = [
  { t:[ 0,  0,  0.5], r:[   0,1,0,   0] },  // front
  { t:[ 0,  0, -0.5], r:[   0,1,0, 180] },  // back
  { t:[ 0.5,0,  0 ], r:[   0,1,0,  90] },  // right
  { t:[-0.5,0,  0 ], r:[   0,1,0, -90] },  // left
  { t:[ 0,  0.5,0 ], r:[   1,0,0, -90] },  // top
  { t:[ 0, -0.5,0 ], r:[   1,0,0,  90] },  // bottom
];

// asked ChatGPT for help with this function
function drawSpots(frame){
  if(big == 1){
    faces = facesL;
  } else {
    faces = facesM;
  }
  faces.forEach(face => {
    giraffeSpots.forEach(spot => {
      let m = new Matrix4(frame);

      m.translate(0.5, 0.5, 0.5);

      m.translate(...face.t);
      if (face.r[3] !== 0) {
        m.rotate(face.r[3], face.r[0], face.r[1], face.r[2]);
      }

      m.translate(
        (spot.x - 0.5),   // X across the face
        (spot.y - 0.5),   // Y up/down the face
        0.01              // tiny bump so it’s above the surface
      );

      if(big == 2){
        m.scale(0.14, 0.14, 0.001);
      } else if (big == 0) {
        m.scale(0.1, 0.05, 0.001);
      } else {
        m.scale(0.15, 0.075, 0.001);
      }

      // e) Draw the spot
      drawCube(m, spotColor);
    });
  });
}

function renderScene() {
  // Global rotation matrix (based on slider value)
  let globalRotMat = new Matrix4()
    .scale(0.5, 0.5, 0.5)    
    .translate(0, -0.5, 0)
    .rotate(g_globalAngle, 0, 1, 0)   
    .rotate(g_rotY, 0, 1, 0)   
    .rotate(g_rotX, 1, 0, 0);
    // .rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear both color and depth buffers
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  if (g_exploding) {
    g_fragments.forEach(f => f.cube.render());
    return;
  }

  let cube = new Cube();
  cube.color = [1.0, 0.0, 0.0, 1.0];
  cube.textureNum = 0; // This should show a UV debug gradient
  cube.render();

  // drawGiraffe();
  // var body = new Prism();
  // body.color = [237/255, 207/255, 143/255, 1.0];
  // body.render();

}

let g_neckRoll = 0;

function drawGiraffe(){

  parts = [];
  
  // Draw the body cube
  var body = new Cube();
  body.color = [237/255, 207/255, 143/255, 1.0];
  body.matrix.rotate(10, 1, 0, 0); 
  body.matrix.translate(-0.25, -0, 0);
  body.matrix.scale(.75, 0.5, 0.75);
  body.render();

  big = 2;
  drawSpots(new Matrix4(body.matrix));

  var neck = new Cube();
  neck.color = [237/255*0.98, 207/255*0.98, 143/255*0.98, 1.0];
  neck.matrix = new Matrix4(body.matrix);
  // neck.matrix.translate(0, -0.25, -0.155);
  neck.matrix.rotate(g_neckRoll, 1, 0, 0.1); 
  neck.matrix.translate(0, -0.25, -0.085);
  neck.matrix.rotate(g_neck, 1, 0, 0); 
  neck.matrix.translate(0.25, 0.95, 0.001);
  neck.matrix.scale(0.5, 2, 0.25);
  neck.render();


  big = 0;
  drawSpots(new Matrix4(neck.matrix))

  var head = new Cube();
  head.color = [237/255, 207/255, 143/255, 1.0];
  head.matrix = new Matrix4(neck.matrix);
  head.matrix.translate(0, -0.65, 0.25);
  head.matrix.rotate(g_head, 1, 0, 0); 
  head.matrix.translate(0, 1.5, -0.75);
  head.matrix.scale(1.001, 0.25, 1.75);
  head.render();

  var rightEar = new Prism();
  rightEar.color = [237/255*0.98, 207/255*0.98, 143/255*0.98, 1.0];
  rightEar.matrix = new Matrix4(head.matrix);
  // rightEar.matrix.translate(0, -0.25, 0);
  rightEar.matrix.rotate(g_rightEar, 0, 1, 0); 
  rightEar.matrix.translate(0, 1, 0.75);
  rightEar.matrix.scale(0.25, 0.5, 0.25);
  rightEar.render();

  
  var leftEar = new Prism();
  leftEar.color = [237/255*0.98, 207/255*0.98, 143/255*0.98, 1.0];
  leftEar.matrix = new Matrix4(head.matrix);
  leftEar.matrix.rotate(g_leftEar, 0, 1, 0); 
  leftEar.matrix.translate(0.725, 1, 0.75);
  leftEar.matrix.scale(0.25, 0.5, 0.25);
  leftEar.render();


  var rightArm = new Cube();
  rightArm.color = [237/255, 207/255*0.98, 143/255*0.98, 1.0];
  rightArm.matrix = new Matrix4(body.matrix);
  rightArm.matrix.translate(0, -0.1, -0.05);
  rightArm.matrix.rotate(g_rightArm, 1, 0, 0);
  rightArm.matrix.translate(0.0001, 0 - (.5), 0);
  rightArm.matrix.scale(.25, .75, 0.25);
  rightArm.render();
  big = 1;
  drawSpots(new Matrix4(rightArm.matrix))

  var rightArmFingers = new Cube();
  rightArmFingers.color = [237/255, 207/255, 143/255, 1.0];
  rightArmFingers.matrix = new Matrix4(rightArm.matrix);
  rightArmFingers.matrix.translate(0, 0.15, 0.05);
  rightArmFingers.matrix.rotate(g_rightForearm, 1, 0, 0); 
  rightArmFingers.matrix.translate(-0.001, -(1.75), 0);
  rightArmFingers.matrix.scale(1, 1.75, 1);
  rightArmFingers.render();
  drawSpots(new Matrix4(rightArmFingers.matrix))


  var leftArm = new Cube();
  leftArm.color = [237/255, 207/255, 143/255, 1.0];
  leftArm.matrix = new Matrix4(body.matrix);
  leftArm.matrix.translate(0, -0.1, -0.05);
  leftArm.matrix.rotate(g_leftArm, 1, 0, 0);
  leftArm.matrix.translate(0.7499, 0 - (.5), 0);
  leftArm.matrix.scale(.25, 0.75, 0.25);
  leftArm.render();
  drawSpots(new Matrix4(leftArm.matrix))

  
  var leftArmFingers = new Cube();
  leftArmFingers.color = [237/255, 207/255, 143/255, 1.0];
  leftArmFingers.matrix = new Matrix4(leftArm.matrix);
  leftArmFingers.matrix.translate(0, 0.15, 0.05);
  leftArmFingers.matrix.rotate(g_leftForearm, 1, 0, 0); 
  leftArmFingers.matrix.translate(0.001, -(1.75), 0);
  leftArmFingers.matrix.scale(1, 1.75, 1);
  leftArmFingers.render();
  drawSpots(new Matrix4(leftArmFingers.matrix))

  var rightLeg = new Cube();
  rightLeg.color = [237/255*0.98, 207/255*0.98, 143/255*0.98, 1.0];
  rightLeg.matrix = new Matrix4(body.matrix);
  rightLeg.matrix.translate(0, 0.05, -0.05);
  rightLeg.matrix.rotate(g_rightLeg, 1, 0, 0); 
  rightLeg.matrix.translate(0.001, 0 - (.5), 0.75);
  rightLeg.matrix.scale(.25, 0.70, 0.25);
  rightLeg.render();
  drawSpots(new Matrix4(rightLeg.matrix))
  
  var rightLegFingers = new Cube();
  rightLegFingers.color = [237/255, 207/255, 143/255, 1.0];
  rightLegFingers.matrix = new Matrix4(rightLeg.matrix);
  rightLegFingers.matrix.translate(0, 0.15, 0.01);
  rightLegFingers.matrix.rotate(g_rightCalf, 1, 0, 0); 
  rightLegFingers.matrix.translate(-0.001, -(1.75), 0);
  rightLegFingers.matrix.scale(1, 1.75, 1);
  rightLegFingers.render();
  drawSpots(new Matrix4(rightLegFingers.matrix))
  
  var leftLeg = new Cube();
  leftLeg.color = [237/255*0.98, 207/255*0.98, 143/255*0.98, 1.0];
  leftLeg.matrix = new Matrix4(body.matrix);
  leftLeg.matrix.translate(0, 0.05, -0.05);
  leftLeg.matrix.rotate(g_leftLeg, 1, 0, 0); 
  leftLeg.matrix.translate(0.749, 0 - (.5), 0.75);
  leftLeg.matrix.scale(.25, 0.70, 0.25);
  leftLeg.render();  
  drawSpots(new Matrix4(leftLeg.matrix))
  
  var leftLegFingers = new Cube();
  leftLegFingers.color = [237/255, 207/255, 143/255, 1.0];
  leftLegFingers.matrix = new Matrix4(leftLeg.matrix);
  leftLegFingers.matrix.translate(0, 0.15, 0.01);
  leftLegFingers.matrix.rotate(g_leftCalf, 1, 0, 0); 
  leftLegFingers.matrix.translate(0.001, -(1.75), 0);
  leftLegFingers.matrix.scale(1, 1.75, 1);
  leftLegFingers.render();
  drawSpots(new Matrix4(leftLegFingers.matrix));
  parts.push(body, neck, head, leftArm, rightArm,
    leftLeg, rightLeg);   
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  renderScene();

  // drawTriangle3D(
  //   [ -1.0, 0.0, 0.0,   -0.5, -1.0, 0.0,   0.0, 0.0, 0.0 ]
  // );

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  // sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElem = document.getElementById(htmlID);
  if (!htmlElem) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElem.innerHTML = text;
}

function initTextures() {
  var image = new Image(); // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image.onload = function() {
    sendImageToTEXTURE0(image);
  };

  // Tell the browser to load an image
  image.src = 'sky.jpg';

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE0);             // Enable texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);    // Bind the texture object

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler uniform
  gl.uniform1i(u_Sampler0, 0);
}

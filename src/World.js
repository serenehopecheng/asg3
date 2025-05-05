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
  
  renderAllShapes();
  requestAnimationFrame(tick);
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


  let cube = new Cube();
  cube.color = [1.0, 0.0, 0.0, 1.0];
  cube.textureNum = 0; // This should show a UV debug gradient
  cube.render();

  // drawGiraffe();
  // var body = new Prism();
  // body.color = [237/255, 207/255, 143/255, 1.0];
  // body.render();

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

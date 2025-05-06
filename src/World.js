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
  gl_Position = u_ProjectionMatrix
              * u_ViewMatrix
              * u_GlobalRotateMatrix
              * u_ModelMatrix
              * a_Position;
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
  uniform float u_texColorWeight;

  void main() {
    vec4 baseColor = u_FragColor;
    vec4 texColor = texture2D(u_Sampler0, v_UV);
    vec4 blendedColor = mix(baseColor, texColor, u_texColorWeight);

    if (u_whichTexture == -2) {
      gl_FragColor = baseColor;                     // Use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);            // Use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texColor;     // Use texture0
    } else if (u_whichTexture == -3) {
      gl_FragColor = blendedColor;            // Use UV debug color
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
let u_texColorWeight;
let camera;

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
    // console.log("u_whichTexture is", u_whichTexture);
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
    }

    u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
    if (!u_texColorWeight) {
      console.log('Failed to get the storage location of u_texColorWeight');
      return;
    }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}


let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_globalAngle = 5

let g_rotX = 0;   
let g_rotY = 0;  

let g_dragging = false;
let g_lastX = 0, g_lastY = 0;

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

  document.onkeydown = keydown;

  initTextures();

  camera = new Camera();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  renderAllShapes();
  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_eye = [0, 0, 3];
var g_at = [0.0, 0.0, -100];
var g_up = [0, 1, 0];

function keydown(ev) {
  switch (ev.key) {
    case 'w':
    case 'W':
      camera.moveForward();
      break;
    case 's':
    case 'S':
      camera.moveBackwards();
      break;
    case 'a':
    case 'A':
      camera.moveLeft();
      break;
    case 'd':
    case 'D':
      camera.moveRight();
      break;
    case 'q':
    case 'Q':
      camera.panLeft();
      break;
    case 'e':
    case 'E':
      camera.panRight();
      break;
  }

  renderAllShapes();
}

function renderScene() {
  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  // viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  // viewMat.setLookAt(
  //   g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
  //   g_camera.at.x, g_camera.at.y, g_camera.at.z,
  //   g_camera.up.x, g_camera.up.y, g_camera.up.z); 
  // viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0); // (eye, at, up)
  viewMat.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
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


  // let cube = new Cube();
  // cube.color = [1.0, 0.0, 0.0, 1.0];
  // cube.textureNum = -3; 
  // cube.matrix.setTranslate(0, 0, 3);
  // cube.render();

  let ground = new Cube();
  ground.color = [1, 0, 0, 1.0]; 
  ground.textureNum = -2;
  ground.matrix.translate(0, -0.75, 0.0);
  ground.matrix.scale(10, 0, 10);
  ground.matrix.translate(-0.5, 0, -0.5);
  ground.render();

  var sky = new Cube();
  sky.textureNum = -1;
  sky.color = [0, 0, 1, 1.0]; 
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  drawMap();

}

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      //console.log(x, y);
      if (x == 0 || x == 31 || y == 0 || y == 31) {
        var body = new Cube();
        body.color = [0.36, 0.25, 0.20, 1.0];
        body.matrix.translate(0, -0.75, 0);
        body.matrix.scale(0.3, 0.3, 0.3);
        body.matrix.translate(x - 16, 0, y - 16);
        body.render();
      }
    }
  }
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

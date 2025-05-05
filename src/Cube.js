class Cube {
    constructor() {
      this.type = 'cube';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 0.1, 0.1, 1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
      this.textureNum = -1;
    }
  
    render() {
      console.log("textureNum:", this.textureNum);
      drawCube(this.matrix, this.color, this.textureNum);
    }
    
  }

  function drawCube(matrix, color, texture) {
    console.log("texture:", texture);
    // Set transformation matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    // pass texture
    gl.uniform1i(u_whichTexture, texture);
  
    // Set fragment color
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  
    // FRONT face
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    drawTriangle3DUV( [0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0] );
    drawTriangle3DUV( [0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1] );
  
    // BACK face
    drawTriangle3DUV([1,0,1,  0,0,1,  0,1,1], [1,0, 0,0, 0,1]);
    drawTriangle3DUV([1,0,1,  0,1,1,  1,1,1], [1,0, 0,1, 1,1]);

    // RIGHT face
    drawTriangle3DUV([1,0,0,  1,0,1,  1,1,1], [0,0, 1,0, 1,1]);
    drawTriangle3DUV([1,0,0,  1,1,1,  1,1,0], [0,0, 1,1, 0,1]);

    // LEFT face
    drawTriangle3DUV([0,0,1,  0,0,0,  0,1,0], [1,0, 0,0, 0,1]);
    drawTriangle3DUV([0,0,1,  0,1,0,  0,1,1], [1,0, 0,1, 1,1]);

    // BOTTOM face
    drawTriangle3DUV([0,0,1,  1,0,1,  1,0,0], [0,1, 1,1, 1,0]);
    drawTriangle3DUV([0,0,1,  1,0,0,  0,0,0], [0,1, 1,0, 0,0]);

    // TOP face
    drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1]);
  }
  
  
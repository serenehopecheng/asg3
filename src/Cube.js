class Cube {
  constructor() {
    this.type = 'cube';
    // this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 0.1, 0.1, 1.0];
    // this.size = 5.0;
    // this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }

  render() {
    // var xy = this.position;
    var rgba = this.color;
    // var size = this.size;

    gl.uniform1f(u_texColorWeight, 0.5); 
    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // FRONT face
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
  
}
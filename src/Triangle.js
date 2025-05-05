class Triangle {
    constructor(vertices = null) {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.vertices = vertices; // store custom triangle coordinates

    }

    render() {
      if (this.vertices) {
        gl.uniform4f(u_FragColor, ...this.color);
        gl.uniform1f(u_Size, this.size);
        drawTriangle(this.vertices);
      }
      else { 
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // var xy = g_shapesList[i].position;
        // var rgba = g_shapesList[i].color;
        // var size = g_shapesList[i].size;
        gl.disableVertexAttribArray(a_Position);

        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size);

        // Draw
        // gl.drawArrays(gl.POINTS, 0, 1);
        var d = this.size/200;
        drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
      }
    }
}
  
  function drawTriangle(vertices) {
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
    // return n;
  }
  
  function drawTriangle3D(vertices) {
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
    // return n;
  }

  function drawTriangle3DUV(vertices, uv) {
    var n = 3; // The number of vertices
  
    // ---------
    // Create a buffer object for positions
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    // ---------
    // Create a buffer object for UV
    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  
    // Assign the buffer object to a_UV variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_UV variable
    gl.enableVertexAttribArray(a_UV);
  
    // ---------
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
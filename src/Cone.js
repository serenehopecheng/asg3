class Cone {
    constructor() {
      this.type = 'cone';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 0.1, 0.1, 1.0];
      this.size = 5.0;
      this.segments = 10;
      this.matrix = new Matrix4();
    }
  
    render() {
      drawCone(this.matrix, this.color);
    }
    
  }

  function drawCone(matrix, color) {
    // Set transformation matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  
    // Set fragment color
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  
    // FRONT face
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    // drawTriangle3D([0, 0, 0,  1, 0, 0,  1, 1, 0]);

    var circle = new Circle();
    var d = this.size / 200.0; // delta
    let angleStep = 360 / this.segments;
    var xy = matrix.elements;
    for (var angle = 0; angle < 360; angle += angleStep) {
        let centerPt = [xy[0], xy[1]];
        let angle1 = angle;
        let angle2 = angle + angleStep;

        let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
        let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];

        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);

        // drawTriangle3D([0, 0, 1, 1, 0, pt1[0], pt1[1], pt2[0], pt2[1]]);
            // drawTriangle3D([0, 0, 0,  1, 1, 0,  0, 1, 0]);
        // drawTriangle3D([xy[0], xy[1], 0, pt1[0], pt1[1], 0, pt2[0], pt2[1], 1]);


    }
}
  
  
// class Cone {
//     constructor() {
//       this.type = 'cone';
//       this.position = [0.0, 0.0, 0.0];
//       this.color = [1.0, 1.0, 1.0, 1.0];
//       this.size = 15.0;
//       this.segments = 10;
//     }
  
//     render() {
//       var xy = this.position;
//       var rgba = this.color;
//       var size = this.size;
  
//       // Pass the color of a point to u_FragColor variable
//       gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
//       // Draw
//       var d = this.size / 200.0; // delta
//       let angleStep = 360 / this.segments;
//       for (var angle = 0; angle < 360; angle += angleStep) {
//         let centerPt = [xy[0], xy[1]];
//         let angle1 = angle;
//         let angle2 = angle + angleStep;
  
//         let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
//         let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
  
//         let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
//         let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
  
//         drawTriangle3D([0, 0, 0,  1, 0, 0,  1, 1, 0]);
//             // drawTriangle3D([0, 0, 0,  1, 1, 0,  0, 1, 0]);

//     }
//     }
//   }
  
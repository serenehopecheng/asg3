class Prism {
    constructor() {
      this.type = 'triangularPrism';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 0.2, 0.2, 1.0];
      this.size = 1.0;
      this.matrix = new Matrix4();
    }
  
    render() {
      var [px, py, pz] = this.position;
  
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      let baseColor = this.color;
      // map from ChatGPT
      let dimColor = baseColor.map((v, i) => i < 3 ? v * 0.9 : v);
  
      gl.uniform4f(u_FragColor, ...baseColor);
      // formula from ChatGPT
      drawTriangle3D([
        px, py, pz,
        px + this.size, py, pz,
        px + this.size / 2, py + this.size, pz
      ]);
  
      gl.uniform4f(u_FragColor, ...dimColor);
      drawTriangle3D([
        px, py, pz + this.size,
        px + this.size, py, pz + this.size,
        px + this.size / 2, py + this.size, pz + this.size
      ]);
  
      gl.uniform4f(u_FragColor, ...baseColor);
      drawTriangle3D([
        px, py, pz,
        px + this.size, py, pz,
        px + this.size, py, pz + this.size
      ]);
      drawTriangle3D([
        px, py, pz,
        px + this.size, py, pz + this.size,
        px, py, pz + this.size
      ]);
  
      gl.uniform4f(u_FragColor, ...dimColor);
      drawTriangle3D([
        px, py, pz,
        px + this.size / 2, py + this.size, pz,
        px + this.size / 2, py + this.size, pz + this.size
      ]);
      drawTriangle3D([
        px, py, pz,
        px + this.size / 2, py + this.size, pz + this.size,
        px, py, pz + this.size
      ]);
  
      gl.uniform4f(u_FragColor, ...dimColor);
      drawTriangle3D([
        px + this.size, py, pz,
        px + this.size / 2, py + this.size, pz,
        px + this.size / 2, py + this.size, pz + this.size
      ]);
      drawTriangle3D([
        px + this.size, py, pz,
        px + this.size / 2, py + this.size, pz + this.size,
        px + this.size, py, pz + this.size
      ]);
    }
  }
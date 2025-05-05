class Sphere {
  constructor() {
    this.type = 'Sphere';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 20.0;
    this.segments = 13; // Increase for smoother sphere
  }

  render() {
    var [cx, cy, cz] = this.position;
    var rgba = this.color;
    var radius = this.size / 200.0;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    let latSegments = this.segments;
    let longSegments = this.segments;

    for (let lat = 0; lat <= latSegments; lat++) {
      let theta1 = (lat * Math.PI / latSegments) - (Math.PI / 2);
      let theta2 = ((lat + 1) * Math.PI / latSegments) - (Math.PI / 2);

      for (let long = 0; long <= longSegments; long++) {
        let phi1 = long * 2 * Math.PI / longSegments;
        let phi2 = (long + 1) * 2 * Math.PI / longSegments;

        let vertices = [
          cx + radius * Math.cos(theta1) * Math.cos(phi1), cy + radius * Math.sin(theta1), cz + radius * Math.cos(theta1) * Math.sin(phi1),
          cx + radius * Math.cos(theta2) * Math.cos(phi1), cy + radius * Math.sin(theta2), cz + radius * Math.cos(theta2) * Math.sin(phi1),
          cx + radius * Math.cos(theta2) * Math.cos(phi2), cy + radius * Math.sin(theta2), cz + radius * Math.cos(theta2) * Math.sin(phi2),

          cx + radius * Math.cos(theta1) * Math.cos(phi1), cy + radius * Math.sin(theta1), cz + radius * Math.cos(theta1) * Math.sin(phi1),
          cx + radius * Math.cos(theta2) * Math.cos(phi2), cy + radius * Math.sin(theta2), cz + radius * Math.cos(theta2) * Math.sin(phi2),
          cx + radius * Math.cos(theta1) * Math.cos(phi2), cy + radius * Math.sin(theta1), cz + radius * Math.cos(theta1) * Math.sin(phi2)
        ];

        drawTriangle3D(vertices.slice(0, 9));
        drawTriangle3D(vertices.slice(9));
      }
    }
  }
}

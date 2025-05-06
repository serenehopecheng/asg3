class Camera {
    constructor(){
        this.fov = 60;
        this.eye = new Vector3([0,0,0]);
        this.at  = new Vector3([0,0,-1]);
        this.up  = new Vector3([0,1,0]);
        this.viewMatrix = new Matrix4();
  
        this.viewMatrix.setLookAt(
          this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
          this.at.elements[0], this.at.elements[1], this.at.elements[2],
          this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
  
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(
          this.fov,
          canvas.width / canvas.height,
          0.1,
          1000
        );
    }
  
    scaleVector(vec, scalar) {
      return new Vector3([
        vec.elements[0] * scalar,
        vec.elements[1] * scalar,
        vec.elements[2] * scalar
      ]);
    }
  
    crossProduct(a, b) {
      return new Vector3([
        a.elements[1] * b.elements[2] - a.elements[2] * b.elements[1],
        a.elements[2] * b.elements[0] - a.elements[0] * b.elements[2],
        a.elements[0] * b.elements[1] - a.elements[1] * b.elements[0]
      ]);
    }
  
    addVectors(a, b) {
      return new Vector3([
        a.elements[0] + b.elements[0],
        a.elements[1] + b.elements[1],
        a.elements[2] + b.elements[2]
      ]);
    }
  
    // had ChatGPT help me with this function
    moveForward(speed = 0.2) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      f.normalize();
      f = this.scaleVector(f, speed);
      this.eye = this.addVectors(this.eye, f);
      this.at = this.addVectors(this.at, f);
    }
  
    moveBackwards(speed = 0.2) {
      let b = new Vector3([
        this.eye.elements[0] - this.at.elements[0],
        this.eye.elements[1] - this.at.elements[1],
        this.eye.elements[2] - this.at.elements[2]
      ]);
      b.normalize();
      b = this.scaleVector(b, speed);
      this.eye = this.addVectors(this.eye, b);
      this.at = this.addVectors(this.at, b);
    }
  
    moveLeft(speed = 0.2) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      f.normalize();
      let s = this.crossProduct(this.up, f);
      s.normalize();
      s = this.scaleVector(s, speed);
      this.eye = this.addVectors(this.eye, s);
      this.at = this.addVectors(this.at, s);
    }
  
    moveRight(speed = 0.2) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      f.normalize();
      let s = this.crossProduct(f, this.up);
      s.normalize();
      s = this.scaleVector(s, speed);
      this.eye = this.addVectors(this.eye, s);
      this.at = this.addVectors(this.at, s);
    }
  
    panLeft(alpha = 2) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      let f_prime = rotationMatrix.multiplyVector3(f);
      this.at = this.addVectors(this.eye, f_prime);
    }
  
    panRight(alpha = 2) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      let f_prime = rotationMatrix.multiplyVector3(f);
      this.at = this.addVectors(this.eye, f_prime);
    }

    forward() {
        var f = this.at.subtract(this.eye);
        f = f.divide(f.length());
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
      }
    
    back() {
        var f = this.eye.subtract(this.at);
        f = f.divide(f.length());
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
    }

    left() {
        var f = this.eye.subtract(this.at);
        f = f.divide(f.length());
        var s = f.cross(this.up);
        s = s.divide(s.length());
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }

    right() {
        let f = this.at.subtract(this.eye);
        f = f.divide(f.length());
        let s = f.cross(this.up);
        s = s.divide(s.length());
        this.at = this.at.subtract(s);
        this.eye = this.eye.subtract(s);
    }
  }
  
  
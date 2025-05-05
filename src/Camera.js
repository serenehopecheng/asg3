class Camera{
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


      moveForward(speed = 0.2) {
        let f = new Vector3([
          this.at.elements[0] - this.eye.elements[0],
          this.at.elements[1] - this.eye.elements[1],
          this.at.elements[2] - this.eye.elements[2]
        ]);
        f.normalize();
        f = f.scale(speed);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
      }
    
      moveBackwards(speed = 0.2) {
        let b = new Vector3([
          this.eye.elements[0] - this.at.elements[0],
          this.eye.elements[1] - this.at.elements[1],
          this.eye.elements[2] - this.at.elements[2]
        ]);
        b.normalize();
        b = b.scale(speed);
        this.eye = this.eye.add(b);
        this.at = this.at.add(b);
      }
    
      moveLeft(speed = 0.2) {
        let f = new Vector3([
          this.at.elements[0] - this.eye.elements[0],
          this.at.elements[1] - this.eye.elements[1],
          this.at.elements[2] - this.eye.elements[2]
        ]);
        f.normalize();
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s = s.scale(speed);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
      }
    
      moveRight(speed = 0.2) {
        let f = new Vector3([
          this.at.elements[0] - this.eye.elements[0],
          this.at.elements[1] - this.eye.elements[1],
          this.at.elements[2] - this.eye.elements[2]
        ]);
        f.normalize();
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s = s.scale(speed);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
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
        this.at = this.eye.add(f_prime);
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
        this.at = this.eye.add(f_prime);
      }
}  
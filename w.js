W = {
  render: (scene, gl, aspectratio, vs, fs, program, i, vertices, uv, modelMatrix) => {


    // Vertex shader
    vs = gl.createShader(35633);
    gl.shaderSource(vs, `#version 300 es\nprecision highp float;in vec4 p;in vec4 c;uniform mat4 M;uniform mat4 m;out vec4 vc;out vec3 vp;void main(){gl_Position=M*p;vp=vec3(m*p);vc=c;}`);
    gl.compileShader(vs);

    // Fragment shader
    fs = gl.createShader(35632);
    gl.shaderSource(fs, `#version 300 es\nprecision highp float;uniform vec3 c;uniform vec3 d;uniform vec3 a;in vec3 vp;in vec4 vc;out vec4 C;void main(){float nDotL=max(dot(d,-normalize(cross(dFdx(vp),dFdy(vp)))),0.);C=vec4(c*vc.rgb*nDotL+a*vc.rgb,1.);}`);
    gl.compileShader(fs);

    // Program
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set the clear color and enable the depth test
    gl.clearColor(...scene.clear.col, 1);
    gl.enable(2929);

    // Set the diffuse light color and direction
    gl.uniform3f(gl.getUniformLocation(program, 'c'), ...scene.diffuseLight.col);
    gl.uniform3f(gl.getUniformLocation(program, 'd'), ...scene.diffuseLight.pos);

    // Set the ambient light color
    gl.uniform3f(gl.getUniformLocation(program, 'a'), ...scene.ambientLight.col);
    
    // Clear
    gl.clear(16640);

    // Render each object
    for(i of scene.objects){
      
      // Initialize a cube
      [vertices, uv] = (window?.[i.model] || cube)();
    
      // Special case for plane: render a thin cube
      if(i.model == "plane"){
        i.size[2] = 0;
      }
      
      // Set position buffer
      buffer(gl, vertices, program, 'p', 3, 5126);
      
      // Set the model matrix
      modelMatrix = new DOMMatrix().translate(...i.pos).rotate(...i.rot).scale(...i.size);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'm'), 0, modelMatrix.toFloat32Array());
      
      // Set the model's color
      gl.vertexAttrib3f(gl.getAttribLocation(program, 'c'), ...i.col);

      // Set the cube's mvp matrix (camera x model)
      // Camera matrix (fov: 30deg, near: 0.1, far: 100)
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'M'), 0, (new DOMMatrix([
      1.8 / aspectratio, 0, 0, 0,  0, 1.8, 0, 0,  0, 0, -1.001, -1,  0, 0, -.2, 0
      ]).translate(...scene.camera.pos).rotate(...scene.camera.rot)).multiply(modelMatrix).toFloat32Array());

      // Render
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
    }
  }
}

// Bind a data buffer to an attribute, fill it with data and enable it
buffer = (gl, data, program, attribute, size, type,a) => {
  gl.bindBuffer(34962, gl.createBuffer());
  gl.bufferData(34962, data, 35044);
  gl.vertexAttribPointer(a=gl.getAttribLocation(program, attribute), size, type, 0, 0, 0);
  gl.enableVertexAttribArray(a);
}


// Declare a cube (2x2x2)
// Returns [vertices (Float32Array), uvs (Uint32Array)] 
//
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |   x | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

cube = () => [

  new Float32Array([
    1, 1, 1,  -1, 1, 1,  -1,-1, 1, // front
    1, 1, 1,  -1,-1, 1,   1,-1, 1,
    1, 1,-1,   1, 1, 1,   1,-1, 1, // right
    1, 1,-1,   1,-1, 1,   1,-1,-1,
    1, 1,-1,  -1, 1,-1,  -1, 1, 1, // up
    1, 1,-1,  -1, 1, 1,   1, 1, 1,
   -1, 1, 1,  -1, 1,-1,  -1,-1,-1, // left
   -1, 1, 1,  -1,-1,-1,  -1,-1, 1,
   -1, 1,-1,   1, 1,-1,   1,-1,-1, // back
   -1, 1,-1,   1,-1,-1,  -1,-1,-1,
    1,-1, 1,  -1,-1, 1,  -1,-1,-1, // down
    1,-1, 1,  -1,-1,-1,   1,-1,-1
  ]),
  
  new Float32Array([
    1, 1,   0, 1,   0, 0, // front
    1, 1,   0, 0,   1, 0,            
    1, 1,   0, 1,   0, 0, // right
    1, 1,   0, 0,   1, 0, 
    1, 1,   0, 1,   0, 0, // up
    1, 1,   0, 0,   1, 0,
    1, 1,   0, 1,   0, 0, // left
    1, 1,   0, 0,   1, 0,
    1, 1,   0, 1,   0, 0, // back
    1, 1,   0, 0,   1, 0,
    1, 1,   0, 1,   0, 0, // down
    1, 1,   0, 0,   1, 0
  ])
];

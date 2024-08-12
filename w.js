W = {
  render: (scene, gl, aspectratio) => {
    
    // Vertex shader
    var vshader = `
    attribute vec4 position; 
    attribute vec4 color;
    attribute vec4 normal;
    uniform mat4 mvp;
    uniform mat4 model;            // model matrix
    uniform mat4 inverseTranspose; // inversed transposed model matrix
    varying vec4 v_color;
    varying vec3 v_normal;
    varying vec3 v_position;
    void main() {

      // Apply the model matrix and the camera matrix to the vertex position
      gl_Position = mvp * position;
      
      // Set varying position for the fragment shader
      v_position = vec3(model * position);
      
      // Recompute the face normal
      v_normal = normalize(vec3(inverseTranspose * normal));
      
      // Set the color
      v_color = color;
    }`;

    // Fragment shader
    var fshader = `
    precision mediump float;
    uniform vec3 lightColor;
    uniform vec3 lightPosition;
    uniform vec3 ambientLight;
    varying vec3 v_normal;
    varying vec3 v_position;
    varying vec4 v_color;
    void main() {

      // Compute direction between the light and the current point
      vec3 lightDirection = normalize(lightPosition - v_position);
      
      // Compute angle between the normal and that direction
      float nDotL = max(dot(lightDirection, v_normal), 0.0);
      
      // Compute diffuse light proportional to this angle
      vec3 diffuse = lightColor * v_color.rgb * nDotL;
      
      // Compute ambient light
      vec3 ambient = ambientLight * v_color.rgb;
      
      // Compute total light (diffuse + ambient)
      gl_FragColor = vec4(diffuse + ambient, 1.0);
    }`;
      
    // Compile program
    var program = compile(gl, vshader, fshader);

    // Initialize a cube
    var vertices, normals, indices;
    [vertices, normals, indices] = cube();

    // Count vertices
    var n = indices.length;

    // Set position, normal buffers
    buffer(gl, vertices, program, 'position', 3, gl.FLOAT);
    buffer(gl, normals, program, 'normal', 3, gl.FLOAT);

    // Set indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Set the clear color and enable the depth test
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    // Set the camera
    var cameraMatrix = perspective({fov: 30, ratio: aspectratio, near: 1, far: 100});
    cameraMatrix.translateSelf(...scene.camera.pos).rotateSelf(...scene.camera.rot);
    var camera = gl.getUniformLocation(program, 'camera');
    gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());

    // Set the point light color and direction
    var lightColor = gl.getUniformLocation(program, 'lightColor');
    gl.uniform3f(lightColor, ...scene.pointLight.col);
    var lightPosition = gl.getUniformLocation(program, 'lightPosition');
    gl.uniform3f(lightPosition, ...scene.pointLight.pos);

    // Set the ambient light color
    var ambientLight = gl.getUniformLocation(program, 'ambientLight');
    gl.uniform3f(ambientLight, ...scene.ambientLight.col);
    
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render each object
    for(var i of scene.objects){
      
      if(i.model == "plane"){
        i.size[2] = .01;
      }
      
      // Set the model matrix
      var modelMatrix = new DOMMatrix();
      modelMatrix.translateSelf(...i.pos).rotateSelf(...i.rot).scaleSelf(...i.size);
      var model = gl.getUniformLocation(program, 'model');
      gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());
      
      // Set the model's color
      var color = gl.getAttribLocation(program, 'color');
      gl.vertexAttrib3f(color, ...i.col);

      // Set the cube's mvp matrix (camera x model)
      var mvpMatrix = (new DOMMatrix(modelMatrix)).preMultiplySelf(cameraMatrix);
      var mvp = gl.getUniformLocation(program, 'mvp');
      gl.uniformMatrix4fv(mvp, false, mvpMatrix.toFloat32Array());

      // Set the inverse transpose of the model matrix
      var inverseTransposeMatrix = transpose((new DOMMatrix(modelMatrix)).invertSelf());
      var inverseTranspose = gl.getUniformLocation(program, 'inverseTranspose');
      gl.uniformMatrix4fv(inverseTranspose, false, inverseTransposeMatrix.toFloat32Array());

      // Render
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
    }

  }
}


// Transpose a DOMMatrix
transpose = m => {
  return new DOMMatrix([
    m.m11, m.m21, m.m31, m.m41,
    m.m12, m.m22, m.m32, m.m42,
    m.m13, m.m23, m.m33, m.m43,
    m.m14, m.m24, m.m34, m.m44,
  ]);
};

perspective = options => {
  var fov = options.fov || 85;
  fov = fov * Math.PI / 180;       // fov in radians
  var aspect = options.ratio || 1; // canvas.width / canvas.height
  var near = options.near || 0.01; // can't be 0
  var far = options.far || 100;
  var f = 1 / Math.tan(fov);
  var nf = 1 / (near - far);
  return new DOMMatrix([
    f / aspect, 0, 0, 0, 
    0, f, 0, 0, 
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * near * far) * nf, 0
  ]);
}

// Compile a WebGL program from a vertex shader and a fragment shader
compile = (gl, vshader, fshader) => {
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vshader);
  gl.compileShader(vs);
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fshader);
  gl.compileShader(fs);
  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);
  console.log('vertex shader:', gl.getShaderInfoLog(vs) || 'OK');
  console.log('fragment shader:', gl.getShaderInfoLog(fs) || 'OK');
  console.log('program:', gl.getProgramInfoLog(program) || 'OK');
  return program;
}

// Bind a data buffer to an attribute, fill it with data and enable it
buffer = (gl, data, program, attribute, size, type) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  var a = gl.getAttribLocation(program, attribute);
  gl.vertexAttribPointer(a, size, type, false, 0, 0);
  gl.enableVertexAttribArray(a);
}


// Declare a cube (2x2x2)
// Returns [vertices (Float32Array), normals (Float32Array), indices (Uint16Array)] 
//
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |   x | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

cube = () => {

  var vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // back
  ]);

  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // back
  ]);

  var indices = new Uint16Array([
    0, 1, 2,   0, 2, 3,  // front
    4, 5, 6,   4, 6, 7,  // right
    8, 9, 10,  8, 10,11, // up
    12,13,14,  12,14,15, // left
    16,17,18,  16,18,19, // down
    20,21,22,  20,22,23  // back
  ]);
  
  return [vertices, normals, indices];
};


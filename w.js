W = {
  render: (scene, gl, aspectratio, vs, fs, program, i, vertices, uv, modelMatrix, texture, a) => {


    // Vertex shader
    gl.shaderSource(vs = gl.createShader(35633), `#version 300 es\nprecision lowp float;in vec4 c,p,u;uniform mat4 M,m;out vec4 C,P,U;void main(){gl_Position=M*p;P=m*p;C=c;U=u;}`);
    gl.compileShader(vs);
    //console.log('vertex shader:', gl.getShaderInfoLog(vs) || 'OK');

    // Fragment shader
    gl.shaderSource(fs = gl.createShader(35632), `#version 300 es\nprecision lowp float;uniform vec3 c,d,a;in vec4 C,P,U;out vec4 o;uniform sampler2D s;void main(){float n=max(dot(d,-normalize(cross(dFdx(P.xyz),dFdy(P.xyz)))),0.);o=mix(texture(s,U.xy),vec4(c*C.rgb*n+a*C.rgb,1.),C.a);}`);
    gl.compileShader(fs);
    //console.log('vertex shader:', gl.getShaderInfoLog(fs) || 'OK');

    // Program
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set the clear color and enable the depth test
    gl.clearColor(...scene.b.c, 1);
    gl.enable(2929);

    // Set the diffuse light color and direction
    gl.uniform3f(gl.getUniformLocation(program, 'c'), ...scene.d.c);
    gl.uniform3f(gl.getUniformLocation(program, 'd'), ...scene.d.p);

    // Set the ambient light color
    gl.uniform3f(gl.getUniformLocation(program, 'a'), ...scene.a.c);
    
    // Clear
    gl.clear(16640);

    // Render each object
    for(i of scene.o){
      
      // Default blending method for transparent objects
      gl.blendFunc(770 /* SRC_ALPHA */, 771 /* ONE_MINUS_SRC_ALPHA */);
      
      // Enable texture 0
      gl.activeTexture(33984 /* TEXTURE0 */);
      
      // Initialize the model (cube by default)
      [vertices, uv] = (window[i.m] || cube)();

      // Alpha-blending
      gl.enable(3042 /* BLEND */);

      // Set position buffer
      gl.bindBuffer(34962, gl.createBuffer());
      gl.bufferData(34962, new Float32Array(vertices), 35044);
      gl.vertexAttribPointer(a=gl.getAttribLocation(program, 'p'), 3, 5126, 0, 0, 0);
      gl.enableVertexAttribArray(a);
      
      // Set uv buffer
      gl.bindBuffer(34962, gl.createBuffer());
      gl.bufferData(34962, new Float32Array(uv), 35044);
      gl.vertexAttribPointer(a=gl.getAttribLocation(program, 'u'), 2, 5126, 0, 0, 0);
      gl.enableVertexAttribArray(a);
      
      // Set the model matrix
      modelMatrix = new DOMMatrix().translate(...(i.p||[0,0,0])).rotate(...(i.r||[0,0,0])).scale(...(i.s||[1,1,1]));
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'm'), 0, modelMatrix.toFloat32Array());
      
      // Set the model's color
      if (i.c) {
        gl.vertexAttrib3f(gl.getAttribLocation(program, 'c'), ...i.c);
      }
      
      // or texture
      else {
        gl.vertexAttrib4f(gl.getAttribLocation(program, 'c'), 0,0,0,0);
        if(i.t){
          texture = gl.createTexture();
          gl.pixelStorei(37441 /* UNPACK_PREMULTIPLY_ALPHA_WEBGL */, 1);
          gl.bindTexture(3553 /* TEXTURE_2D */, texture);
          gl.pixelStorei(37440 /* UNPACK_FLIP_Y_WEBGL */, 1);
          gl.texImage2D(3553 /* TEXTURE_2D */, 0, 6408 /* RGBA */, 6408 /* RGBA */, 5121 /* UNSIGNED_BYTE */, i.t);
          gl.generateMipmap(3553 /* TEXTURE_2D */);
          gl.bindTexture(3553 /* TEXTURE_2D */, texture);
          gl.uniform1i(gl.getUniformLocation(program, 's'), 0);
        }
      }

      // Set the cube's mvp matrix (camera x model)
      // Camera matrix (fov: 30deg, near: 0.1, far: 100)
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'M'), 0, (new DOMMatrix([
      1.8 / aspectratio, 0, 0, 0,  0, 1.8, 0, 0,  0, 0, -1.001, -1,  0, 0, -.2, 0
      ]).rotate(...scene.c.r)).translate(...scene.c.p).multiply(modelMatrix).toFloat32Array());

      // Render
      // (Special case for plane: render the front face of a cube)
      gl.drawArrays(4, 0, i.m == "plane" ? 6 : vertices.length / 3);
    }
  }
}

// Declare a cube (2x2x2)
// Returns [vertices, uvs)] 
//
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |   x | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

cube = () => [

  [
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
  ],
  
  [
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
  ]
];

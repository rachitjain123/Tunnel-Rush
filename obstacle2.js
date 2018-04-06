var num_val2 = -150
var flag2=4;
var vv2=0;
var saved_val=0;
var flag_rotate3=0
function initBuffers_obstacle2(gl) {

  // Create a buffer for the cube's vertex positions.

  // console.log("faf");
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
     0.45,  1.34, -0.45,
    -0.45,  1.34, -0.45,
    -0.45,  1.34,  0.45,
     0.45,  1.34,  0.45,

    // Back face
     0.45, -1.34,  0.45,
    -0.45, -1.34,  0.45,
    -0.45, -1.34, -0.45,
     0.45, -1.34, -0.45,

    // Top face
     0.45,  1.34,  0.45,
    -0.45,  1.34,  0.45,
    -0.45, -1.34,  0.45,
     0.45, -1.34,  0.45,

    // Bottom face
     0.45, -1.34, -0.45,
    -0.45, -1.34, -0.45,
    -0.45,  1.34, -0.45,
     0.45,  1.34, -0.45,

    // 15 face
    -0.45,  1.34,  0.45,
    -0.45,  1.34, -0.45,
    -0.45, -1.34, -0.45,
    -0.45, -1.34,  0.45,

    // Left face
     0.45,  1.34, -0.45,
     0.45,  1.34,  0.45,
     0.45, -1.34,  0.45,
     0.45, -1.34, -0.45,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  const faceColors = [
    [128/255,  0.0,  0.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [255/255,  165/255,  0/255,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [128/255,  0.0,  0.0,  1.0],    // Left face: purple
  ];


  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

function drawScene_obstacle2(gl, programInfo, buffers, deltaTime,now,score,lives,cubeRotation,cubeRotation2) 
{
    // console.log("Dasdas");

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear,zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.8, num_val2+now*20]);  // amount to translate

  // var x1 = -0.0;
  // var y1 = 0.8;
  var z2 = num_val2+now*20;
  // console.log(z1);
  // console.log(cubeRotation);
  // console.log(flag2);
  // console.log(vv2);
  var vv3=vv2;
  if(vv3<0)
    vv3*=-1;
  vv3=vv3%3;

  // console.log(vv3+cubeRotation);
  // if(Math.abs(z1)<=1 && Math.abs(cubeRotation)<=0.45 && flag2_rotate==0)
  // {
    // flag2--;
    // lives=lives-1;
    // exit();
  // }
  // if(Math.abs(z2)<=1 && Math.abs(cubeRotation2)<=0.15 && flag_rotate3==0)
  // {
  //   // console.log("Dada");
  //   flag2--;
  // }
  // console.log(z2);
  if(Math.abs(z2)<=1 && Math.abs(vv3+cubeRotation)<=0.95 )
  {
    // console.log("Dada");
    flag2--;
  }
  if(flag2==0)
  {
    lives--;
    flag2=4;
  }
  if(lives==0)
  {
    alert("YOU LOST, Click OK to play the game again!");
    document.location.reload();
  }
  if(z2>=0)
  {
    vv2=0;
    var ff=parseInt(score/500);
    num_val2-=93+ff*5;
  }
    // console.log("hey");
  // console.log(to_translate);
  // init_obstacle+=to_translate;
  var n1=parseInt(score/1000);
  // console.log(n1);
  if(n1%2==0)
    flag_rotate3=0;
  else
    flag_rotate3=1;
  // console.log(flag_rotate3);
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              vv2*1+cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  // frotate_obs+=vv2+cubeRotation;
  // frotate_obs=frotate_obs%6;
  // if(Math.abs(frotate_obs-frotate_tunnel)<=1)
  //   console.log("hey");
  vv2=vv2+0.02;
  // console.log(vv2+cubeRotation);

  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             20+// amount to rotate in radians
  //             [0, 1, 0]);       // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  // cubeRotation += deltaTime;
  return lives;
}

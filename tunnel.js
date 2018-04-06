var cubeRotation = 0;
var cubeRotation2 = 0;
var flag = 0;
var to_greyscale = 0;
// var level=0;
var flag_rotate=0;
var far_pt=0;
var flag_periodic = 0;
var flagvariable = 0;
var finalvar = 0;


// var ctx;
var speedy=0;
main();
// var Mousetrap = require('mousetrap');
//
// Start here
//
// var ctx;
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    width, height, border, srcFormat, srcType,
    pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
     } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
     }
   };
   image.src = url;

   return texture;
 }

 function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function changespeed()
{
  // console.log(far_pt);
  if(finalvar==0)
  {
    far_pt=0;
    speedy=0;
    flagvariable=0;
  }
  else
  {
    if(flagvariable==1 && Math.abs(far_pt-0.8)<=0.0001)
    {
      // console.log("dada");
      finalvar=0;
    }
    if(flagvariable==0)
      speedy+=0.02;
    if(far_pt<=-0.3||flagvariable==1)
    {
      flagvariable=1;
      speedy-=0.02;
    }
  }
}
function main() 
{
  flag=4;
  // console.log("bala");
  var score=0;
  var lives=3;
  const canvas = document.querySelector('#glcanvas');
  var textCanvas = document.getElementById("text");
  ctx = textCanvas.getContext("2d");
  // var ctx = canvas.getContext("2d");

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;


  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Apply lighting effect
    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0, -1.5, 10));
    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
  `;

  // Fragment shader program

  const fsSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying highp vec2 vTextureCoord;

  varying highp vec3 vLighting;
  uniform sampler2D uSampler;

  uniform lowp float shadows;
  uniform lowp float highlights;

  const mediump vec3 luminanceWeighting = vec3(0.3, 0.3, 0.3);


  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    mediump float luminance = dot(texelColor.rgb, luminanceWeighting);

    //(shadows+1.0) changed to just shadows:
    mediump float shadow = clamp((pow(luminance, 1.0/shadows) + (-0.76)*pow(luminance, 2.0/shadows)) - luminance, 0.0, 1.0);
    mediump float highlight = clamp((1.0 - (pow(1.0-luminance, 1.0/(2.0-highlights)) + (-0.8)*pow(1.0-luminance, 2.0/(2.0-highlights)))) - luminance, -1.0, 0.0);
    lowp vec3 result = vec3(0.0, 0.0, 0.0) + ((luminance + shadow + highlight) - 0.0) * ((texelColor.rgb - vec3(0.0, 0.0, 0.0))/(luminance - 0.0));

    // blend toward white if highlights is more than 1
    mediump float contrastedLuminance = ((luminance - 0.5) * 1.5) + 0.5;
    mediump float whiteInterp = contrastedLuminance*contrastedLuminance*contrastedLuminance;
    mediump float whiteTarget = clamp(highlights, 1.0, 2.0) - 1.0;
    result = mix(result, vec3(1.0), whiteInterp*whiteTarget);

    // blend toward black if shadows is less than 1
    mediump float invContrastedLuminance = 1.0 - contrastedLuminance;
    mediump float blackInterp = invContrastedLuminance*invContrastedLuminance*invContrastedLuminance;
    mediump float blackTarget = 1.0 - clamp(shadows, 0.0, 1.0);
    result = mix(result, vec3(0.0), blackInterp*blackTarget);


    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    // gl_FragColor = vec4(result.rgb * vLighting, texelColor.a);
  }
  `;


  const periodic_fsSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying highp vec2 vTextureCoord;

  varying highp vec3 vLighting;
  uniform sampler2D uSampler;

  uniform lowp float shadows;
  uniform lowp float highlights;

  const mediump vec3 luminanceWeighting = vec3(0.3, 0.3, 0.3);


  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    mediump float luminance = dot(texelColor.rgb, luminanceWeighting);

    //(shadows+1.0) changed to just shadows:
    mediump float shadow = clamp((pow(luminance, 1.0/shadows) + (-0.76)*pow(luminance, 2.0/shadows)) - luminance, 0.0, 1.0);
    mediump float highlight = clamp((1.0 - (pow(1.0-luminance, 1.0/(2.0-highlights)) + (-0.8)*pow(1.0-luminance, 2.0/(2.0-highlights)))) - luminance, -1.0, 0.0);
    lowp vec3 result = vec3(0.0, 0.0, 0.0) + ((luminance + shadow + highlight) - 0.0) * ((texelColor.rgb - vec3(0.0, 0.0, 0.0))/(luminance - 0.0));

    // blend toward white if highlights is more than 1
    mediump float contrastedLuminance = ((luminance - 0.5) * 1.5) + 0.5;
    mediump float whiteInterp = contrastedLuminance*contrastedLuminance*contrastedLuminance;
    mediump float whiteTarget = clamp(highlights, 1.0, 2.0) - 1.0;
    result = mix(result, vec3(1.0), whiteInterp*whiteTarget);

    // blend toward black if shadows is less than 1
    mediump float invContrastedLuminance = 1.0 - contrastedLuminance;
    mediump float blackInterp = invContrastedLuminance*invContrastedLuminance*invContrastedLuminance;
    mediump float blackTarget = 1.0 - clamp(shadows, 0.0, 1.0);
    result = mix(result, vec3(0.0), blackInterp*blackTarget);


    // gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    gl_FragColor = vec4(result.rgb * vLighting, texelColor.a);
  }
  `;

  const fsSource_greyScale = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;
  uniform sampler2D uSampler;
  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    float gray = (texelColor.r * 0.299 + texelColor.g * 0.587 + texelColor.b * 0.144);
    vec3 grayscale = vec3(gray);


    gl_FragColor = vec4(gray * vLighting, texelColor.a);
  }
  `;

  const vsSource1 = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
  `;

  const fsSource1 = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgram_greyscale = initShaderProgram(gl, vsSource, fsSource_greyScale);
  const shaderProgram_periodic = initShaderProgram(gl, vsSource, periodic_fsSource);

  const shaderProgram2 = initShaderProgram(gl, vsSource1, fsSource1);
  // const shaderprogram = initshaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };


  const programInfo_periodic = {
    program: shaderProgram_periodic,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram_periodic, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram_periodic, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram_periodic, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram_periodic, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram_periodic, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram_periodic, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram_periodic, 'uSampler'),
    },
  };

  const programInfo_greyScale = {
    program: shaderProgram_greyscale,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram_greyscale, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram_greyscale, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram_greyscale, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram_greyscale, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram_greyscale, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram_greyscale, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram_greyscale, 'uSampler'),
    },
  };


  const programInfo1 = {
    program: shaderProgram2,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram2, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram2, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram2, 'uModelViewMatrix'),
    },
  };
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers_tunnel = initBuffers_tunnel(gl);
  const buffers_obstacle = initBuffers_obstacle(gl);
  const buffers_obstacle2 = initBuffers_obstacle2(gl);
  const texture = loadTexture(gl, 'cubetexture.png');


  var then = 0;
  var score = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    changespeed();
    if(to_greyscale==0)
    {

      if(flag_periodic==0)
        score=drawScene_tunnel(gl, programInfo_periodic, buffers_tunnel, deltaTime,now,score,lives,texture);
      else
        score=drawScene_tunnel(gl, programInfo, buffers_tunnel, deltaTime,now,score,lives,texture);
    }

    else
      score=drawScene_tunnel(gl, programInfo_greyScale, buffers_tunnel, deltaTime,now,score,lives,texture);

    lives=drawScene_obstacle(gl, programInfo1, buffers_obstacle, deltaTime,now,score,lives);

    // var n11=score%
    lives=drawScene_obstacle2(gl, programInfo1, buffers_obstacle2, deltaTime,now,score,lives,cubeRotation,cubeRotation2);



    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
// var x=0;
var init_obstacle=-10;
var extraRotation = 0;
var to_translate = 0;
var num_val=-100;

Mousetrap.bind('d', function () {
 cubeRotation-=0.05;
 cubeRotation2-=0.05;
 if(cubeRotation>=3)
  cubeRotation-=3;
if(cubeRotation<=-3)
  cubeRotation+=3;
})

Mousetrap.bind('a', function () 
{
 cubeRotation+=0.05;
 cubeRotation2+=0.05;
 if(cubeRotation>=3)
  cubeRotation-=3;
if(cubeRotation<=-3)
  cubeRotation+=3;
})
Mousetrap.bind('w', function ()
{
  to_greyscale = 1 - to_greyscale;
})
Mousetrap.bind('j', function ()
{
  finalvar=1;
})
function initBuffers_tunnel(gl) 
{
  // Create a buffer for the cube's vertex positions.
  const positionBuffer = gl.createBuffer();
  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  var positions = [];
  var pos=0,i=0,k,n=8,j=0;
  var ag = 0;
  while(i<n)
  {
    k=0;
    while(k<2)
    {
      var x1=Math.cos(ag);
      var x2=Math.sin(ag);
      positions[pos]= 2*x1;
      pos+=1;

      positions[pos]= 2*x2;
      pos+=1;

      positions[pos]= -2.0;
      pos+=1;

      positions[pos]= 2*x1;
      pos+=1;

      positions[pos]= 2*x2;
      pos+=1;

      positions[pos]=-6.0;
      pos+=1;

      ag += (2*3.14159)/n;
      k++;
    }
    ag-=(2*3.14159)/n;
    i++;
  }
  var len=positions.length;
  while(j<200)
  {
    i=0;
    while(i<len)
    {
      positions.push(positions[i]);
      positions.push(positions[i+1]);
      positions.push(positions[i+2]-4*(j+1));
      i+=3;
    }
    j++;
  }

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),
    gl.STATIC_DRAW);

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);




  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    ];

    for(var i=1;i<=200;i++)
    {
      for(var j=1;j<=64;j++)
      {
        textureCoordinates.push(textureCoordinates[j-1]);
      }
    }   
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),gl.STATIC_DRAW);



    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);


    var xx=[];
    xx[0]=5.656850496748460;
    xx[1]=2.343141997766190;

    xx[2]=2.343149503244498;
    xx[3]=5.656847387874637;

    xx[4]=-2.343134492283756;
    xx[5]= 5.65685360561233;

    xx[6]=-5.656844278990856;
    xx[7]=2.34315700871868;

    xx[8]=-5.65685671446623;
    xx[9]=-2.343126986797201;

    xx[10]=-2.34316451418874;
    xx[11]=-5.656841170097116;

    xx[12]= 2.343119481306521;
    xx[13]=-5.656859823310183;

    xx[14]=5.656838061193419;
    xx[15]=-2.343172019654669;

    const vertexNormals = [

    xx[0],xx[1],0,
    xx[0],xx[1],0,
    xx[0],xx[1],0,
    xx[0],xx[1],0,


    xx[2],xx[3],0,
    xx[2],xx[3],0,
    xx[2],xx[3],0,
    xx[2],xx[3],0,

    xx[4],xx[5],0,
    xx[4],xx[5],0,
    xx[4],xx[5],0,
    xx[4],xx[5],0,

    xx[6],xx[7],0,
    xx[6],xx[7],0,
    xx[6],xx[7],0,
    xx[6],xx[7],0,

    xx[8],xx[9],0,
    xx[8],xx[9],0,
    xx[8],xx[9],0,
    xx[8],xx[9],0,

    xx[10],xx[11],0,
    xx[10],xx[11],0,
    xx[10],xx[11],0,
    xx[10],xx[11],0,

    xx[12],xx[13],0,
    xx[12],xx[13],0,
    xx[12],xx[13],0,
    xx[12],xx[13],0,

    xx[14],xx[15],0,
    xx[14],xx[15],0,
    xx[14],xx[15],0,
    xx[14],xx[15],0,
    ];

    var vn=[];

    var i=1;
    while(i<=200)
    {
      vn=vn.concat(vertexNormals);
      i++;
    }


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vn),
      gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  // faceColors = [
  //   [1.0,  0.0,  0.0,  1.0],    // red
  //   [0.0,  1.0,  0.0,  1.0],    // green
  //   [1.0,  0.0,  0.0,  1.0],    // red
  //   [1.0,  1.0,  0.0,  1.0],    // yellow
  //   [1.0,  0.0,  1.0,  1.0],    // purple
  //   [0.0,  0.0,  0.0,  1.0],    // black
  //   [1.0,  1.0,  1.0,  1.0],    // green
  //   [0.0,  0.0,  1.0,  1.0],    // blue
  // ];

  // Convert the array of colors into a table for all the vertices.
  // var j1, x1, i1;
  // for (i1 = faceColors.length - 1; i1 > 0; i1--) {
  //     j1 = Math.floor(Math.random() * (i1 + 1));
  //     x1 = faceColors[i1];
  //     faceColors[i1] = faceColors[j1];
  //     faceColors[j1] = x1;
  // }
  // var colors = [];

  // for (var j = 0; j < faceColors.length; ++j) {
  //   const c = faceColors[j];

  //   // Repeat each color four times for the four vertices of the face
  //   colors = colors.concat(c, c, c, c);
  // }

  // const colorBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // // Build the element array buffer; this specifies the indices
  // // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      1,  2,  3,    // front
    4,  5,  6,      5,  6,  7,    // back
    8,  9,  10,     9,  10, 11,   // top
    12, 13, 14,     13, 14, 15,   // bottom
    16, 17, 18,     17, 18, 19,   // right
    20, 21, 22,     21, 22, 23,   // left
    24, 25, 26,     25, 26, 27,   // left
    28, 29, 30,     29, 30, 31,   // left
    ];
    for(var i=1;i<=200;i++)
    {
      for(var j=1;j<=48;j++)
      {
        indices.push(i*32+indices[j-1]);
      }
    }
  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    normal: normalBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}
function initBuffers_obstacle(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    0.15,  1.34, -0.15,
    -0.15,  1.34, -0.15,
    -0.15,  1.34,  0.15,
    0.15,  1.34,  0.15,

    // Back face
    0.15, -1.34,  0.15,
    -0.15, -1.34,  0.15,
    -0.15, -1.34, -0.15,
    0.15, -1.34, -0.15,

    // Top face
    0.15,  1.34,  0.15,
    -0.15,  1.34,  0.15,
    -0.15, -1.34,  0.15,
    0.15, -1.34,  0.15,

    // Bottom face
    0.15, -1.34, -0.15,
    -0.15, -1.34, -0.15,
    -0.15,  1.34, -0.15,
    0.15,  1.34, -0.15,

    // 15 face
    -0.15,  1.34,  0.15,
    -0.15,  1.34, -0.15,
    -0.15, -1.34, -0.15,
    -0.15, -1.34,  0.15,

    // Left face
    0.15,  1.34, -0.15,
    0.15,  1.34,  0.15,
    0.15, -1.34,  0.15,
    0.15, -1.34, -0.15,
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

var frotate_tunnel=0;
var jj=0.0; 

function drawScene_tunnel(gl, programInfo, buffers, deltaTime,now,score,lives,texture) 
{
  // console.log(score);
  if(score%100==0)
  {
    flag_periodic=1-flag_periodic;
  }
  // console.log(flag_periodic);

  // score=parseInt(score);
  // drawScore(score,lives);
   // console.log(score);
    // var sc=20;
        // if(lives!=3)
      // lives+=2;
      ctx.font = "22px Arial";
      ctx.fillStyle = "#0095DD";
      var level =parseInt(score/500);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillText("Score:" + score  + "  Lives:" + lives + " Level:" + level, 29, 40);
      score++;
      if(score%1000==0)
        flag_rotate=1-flag_rotate;
    // if(score%500==0)
      // level++;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 90 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear,zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var i;
  extraRotation+=90*Math.PI/180;
  // tunnelrotation += i/50 *(45*Math.PI/180;)
  var modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
    mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.8-speedy, jj]);  // amount to translate
    far_pt=0.8-speedy;

    // to_translate=j+x;
    // jj=jj-2.0;

    mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation+extraRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
    frotate_tunnel+=cubeRotation+extraRotation;
    frotate_tunnel=frotate_tunnel%6;
    // to_rotate = cubeRotation + extraRotation;
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             tunnelrotation,// amount to rotate in radians
  //             [0, 1, 0]);       // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute


  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
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

  // // Tell WebGL how to pull out the colors from the color buffer
  // // into the vertexColor attribute.
  //   {
  //     const numComponents = 4;
  //     const type = gl.FLOAT;
  //     const normalize = false;
  //     const stride = 0;
  //     const offset = 0;
  //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  //     gl.vertexAttribPointer(
  //         programInfo.attribLocations.vertexColor,
  //         numComponents,
  //         type,
  //         normalize,
  //         stride,
  //         offset);
  //     gl.enableVertexAttribArray(
  //         programInfo.attribLocations.vertexColor);
  //   }


    // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.


  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.textureCoord);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexNormal);
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

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
      // Specify the texture to map onto the faces.

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);
  {
    const vertexCount = 48*200;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

    // Update the rotation for the next draw
    jj+=deltaTime*10;
    // cubeRotation += deltaTime;
    return score;

  }
  var vv=0;
  var frotate_obs=0;
  function drawScene_obstacle(gl, programInfo, buffers, deltaTime,now,score,lives) 
  {
    // score=12;
    // var sc=20;
    // ctx.font = "22px Arial";
    // ctx.fillStyle = "#0095DD";
    // ctx.fillText("Score: " + score  + "      Lives:  " + lives, 29, 40);
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  // gl.clearDepth(1.0);                 // Clear everything
  // gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  // gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

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
                 [-0.0, 0.8, num_val+now*20]);  // amount to translate


  // var x1 = -0.0;
  // var y1 = 0.8;
  var z1 = num_val+now*20;
  // console.log(z1);
  // console.log(cubeRotation);
  // console.log(flag);
  // console.log(flag_rotate);
  // console.log(vv*flag_rotate+cubeRotation2);
  if(Math.abs(z1)<=1 && Math.abs(cubeRotation)<=0.15 && flag_rotate==0)
  {
    flag--;
    // lives=lives-1;
    // exit();
  }
  else if(Math.abs(z1)<=1 && Math.abs(cubeRotation2+vv*flag_rotate)<=0.25 && flag_rotate==1)
  {
    console.log("Dada");
    flag--;
  }
  if(flag==0)
  {
    lives--;
    flag=4;
  }
  if(lives==0)
  {
    alert("YOU LOST, Click OK to play the game again!");
    document.location.reload();
  }
  if(z1>=0)
  {
    vv=0;
    var ff=parseInt(score/500);
    num_val-=70 + ff*5;
  }
    // console.log("hey");
  // console.log(to_translate);
  // init_obstacle+=to_translate;
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              flag_rotate*vv+cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  // frotate_obs+=vv+cubeRotation;
  // frotate_obs=frotate_obs%6;
  // if(Math.abs(frotate_obs-frotate_tunnel)<=1)
  //   console.log("hey");
  vv=vv+0.01;
  // console.log(vv+cubeRotation);

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

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}


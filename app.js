const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
}

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
      gl_PointSize = 1.0;
    }
`;

// Fragment shader program
const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Red color
    }
`;

// Initialize a shader program; this is where all the lighting
// for the vertices and so forth is established.
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Collect all the info needed to use the shader program.
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
};

// Here's where we call the routine that builds all the
// objects we'll be drawing.
const buffers = initBuffers(gl);

function initBuffers(gl) {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.
    const positions = [
      // Add initial vertex positions if necessary
    ];

    // Pass the list of positions into WebGL to build the shape. 
    // We do this by creating a Float32Array from the JavaScript array, 
    // then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

let squares = []; // Array to store square data

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the scene
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    squares.forEach(square => {
        // Set square vertices
        const halfSize = 1.5 / canvas.width;
        const squareVertices = [
            square.x - halfSize, square.y + halfSize, // Top-left
            square.x + halfSize, square.y + halfSize, // Top-right
            square.x + halfSize, square.y - halfSize, // Bottom-right
            square.x - halfSize, square.y - halfSize, // Bottom-left
        ];

        // Update the position buffer with the new vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices), gl.DYNAMIC_DRAW);

        // Update the fragment shader with the square's color
        const fsSource = `
            void main() {
                gl_FragColor = vec4(${square.color[0]}, ${square.color[1]}, ${square.color[2]}, 1.0);
            }
        `;
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        gl.attachShader(programInfo.program, fragmentShader);
        gl.linkProgram(programInfo.program);
        gl.useProgram(programInfo.program);

        // Draw the square
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    });
}

// Update the scene repeatedly
function render() {
    drawScene(gl, programInfo, buffers);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

// Add a click event listener to the canvas
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to WebGL coordinates and add to buffer
    addPixel(x, y);
});

function addPixel(x, y) {
    // Convert screen coordinates (x, y) to WebGL coordinates
    const xWebGL = (x / canvas.width) * 2 - 1;
    const yWebGL = (y / canvas.height) * -2 + 1;

    // Size of the square (3x3)
    const size = 3;
    const halfSize = size / 2;

    // Calculate vertices for the 3x3 square
    const squareVertices = [
        xWebGL - halfSize, yWebGL + halfSize, // Top-left
        xWebGL + halfSize, yWebGL + halfSize, // Top-right
        xWebGL + halfSize, yWebGL - halfSize, // Bottom-right
        xWebGL - halfSize, yWebGL - halfSize, // Bottom-left
    ];

    // Update the position buffer with the new vertices
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices), gl.DYNAMIC_DRAW);

    const color = [Math.random(), Math.random(), Math.random()];

    // Add square data to the global array
    squares.push({x: xWebGL, y: yWebGL, color: color});

    drawScene()


    // Update the fragment shader to use this random color
    // const fsSource = `
    //     void main() {
    //         gl_FragColor = vec4(${r}, ${g}, ${b}, 1.0);  // Random color
    //     }
    // `;
    //
    // // Recompile the fragment shader with the new color
    // const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    // gl.attachShader(programInfo.program, fragmentShader);
    // gl.linkProgram(programInfo.program);
    // gl.useProgram(programInfo.program);
    //
    // // Draw the square
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// Initialize and compile shaders
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

// Create a shader of the given type, upload the source and compile it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


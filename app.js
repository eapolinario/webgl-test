function getAbsoluteCanvasPosition(canvas, x, y) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: x + rect.left + window.scrollX,
        y: y + rect.top + window.scrollY
    };
}


const queryParams = new URLSearchParams(window.location.search);
const id = queryParams.get('id');

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('webgl-canvas');
    const ctx = canvas.getContext('2d');

    // Function to save the current canvas state to localStorage
    function saveCanvas() {
        const dataURL = canvas.toDataURL();
        localStorage.setItem('sharedCanvas', dataURL);
    }

    // Function to load the canvas state from localStorage
    function loadCanvas() {
        const dataURL = localStorage.getItem('sharedCanvas');
        if (dataURL) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = dataURL;
        }
    }

    // Set up an event listener for changes to the shared canvas data in localStorage
    window.addEventListener('storage', function(event) {
        if (event.key === 'sharedCanvas') {
            loadCanvas();
        }
    });

    // Example drawing on the canvas
    canvas.addEventListener('click', function(event) {
        const x = event.offsetX;
        const y = event.offsetY;
        const abs_pos = getAbsoluteCanvasPosition(canvas, x, y)
        ctx.fillStyle = 'red';
        ctx.fillRect(abs_pos['x'] - 5, abs_pos['y'] - 5, 10, 10); // Draw a 10x10 red square where the canvas is clicked
        saveCanvas(); // Save the canvas state after drawing
    });

    // Initialize the canvas with any existing data
    loadCanvas();
});


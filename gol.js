document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('animation');
    var header = document.getElementById('header');

    var ctx;

    // width and height in cells of game of life
    var width = 80;
    var height = 40;
    // width and height of cells in pixels
    var cellSize = 5;
    var cellBorder = 1;

    // 2D grid of cells
    var grid = [];

    // Redraw a particular cell
    function redraw(x, y) {
        var xPos = x * (cellSize + cellBorder);
        var yPos = y * (cellSize + cellBorder);

        if (grid[x][y]) {
            // Make smooth fade-out
            var col = (yPos / canvas.height) * 255;
            col = Math.round(col);
            ctx.fillStyle = "rgb(" + col + ", " + col + ", " + col + ")";
        } else {
            ctx.fillStyle = "rgb(255, 255, 255)";
        }

        ctx.fillRect(xPos, yPos, cellSize, cellSize);
    }

    // Redraw all cells
    function redrawAll() {
        for (x = 0; x < width; x ++) {
            for (y = 0; y < height; y ++) {
                redraw(x, y);
            }
        }
    }

    // Proper modulus function (unlike javascript's '%')
    function mod(a, b) {
        return ((a%b)+b)%b;
    }

    // Get number of alive neighbours of a cell
    function numNeighbours(x, y) {
        var num = 0;
        var xs = mod(x-1, width), ys = mod(y-1, height);
        var xp = mod(x+1, width), yp = mod(y+1, height);
        if (grid[xs][y]) num++;
        if (grid[xp][y]) num++;
        if (grid[x][ys]) num++;
        if (grid[x][yp]) num++;
        if (grid[xs][ys]) num++;
        if (grid[xp][ys]) num++;
        if (grid[xs][yp]) num++;
        if (grid[xp][yp]) num++;
        return num;
    }

    // Perform a single simulation step
    function step() {
        // if canvas has changed size, redraw everything
        if (canvas.width !== header.offsetWidth ||
                canvas.height !== header.offsetHeight) {
            canvas.width = header.offsetWidth;
            canvas.height = header.offsetHeight;
            redrawAll();
        }

        var births = [];
        var deaths = [];

        for (var x = 0; x < width; x ++) {
            for (var y = 0; y < height; y ++) {
                var num = numNeighbours(x, y);
                if (grid[x][y] && (num < 2 || num > 3)) {
                    // over/undercrowded -> death
                    deaths.push({x: x, y: y});
                } else if (!grid[x][y] && num === 3) {
                    // just right -> birth
                    births.push({x: x, y: y});
                }
            }
        }

        // Change state only AFTER checking number of neighbours at
        // each cell.
        births.forEach(function(birth) {
            grid[birth.x][birth.y] = true;
            redraw(birth.x, birth.y);
        });

        deaths.forEach(function(death) {
            grid[death.x][death.y] = false;
            redraw(death.x, death.y);
        });
    }

    // Get mouse coordinates on the canvas
    function relMouseCoords(event){
        var el = this;
        var clientX, clientY;
        var x = 0;
        var y = 0;

        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            x += el.offsetLeft - el.scrollLeft;
            y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }

        if (event.clientX === undefined) {
            clientX = event.touches[0].clientX;
        } else {
            clientX = event.clientX;
        }

        if (event.clientY === undefined) {
            clientY = event.touches[0].clientY;
        } else {
            clientY = event.clientY;
        }

        x = clientX - x;
        y = clientY - y;

        return {x: x, y: y};
    }
    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

    // create an alive cell wherever mouse moves
    function mouseMove(e) {
        coords = canvas.relMouseCoords(e);
        var cellX = Math.floor(coords.x / (cellSize + cellBorder));
        var cellY = Math.floor(coords.y / (cellSize + cellBorder));

        if (cellX >= 0 && cellX < width && cellY >= 0 && cellY < height) {
            grid[cellX][cellY] = true;
            redraw(cellX, cellY);
        }
    }

    // Only run game of life if canvas is supported on browser
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');

        // Create game of life grid
        var x, y;
        for (x = 0; x < width; x ++) {
            var col = [];
            for (y = 0; y < height; y ++) {
                col.push(Math.random() < 0.15);
            }
            grid.push(col);
        }

        redrawAll();

        // Start running
        setInterval(step, 100);
        header.addEventListener('mousemove', mouseMove, false);
        header.addEventListener('touchmove', mouseMove, false);
    }
}, false);

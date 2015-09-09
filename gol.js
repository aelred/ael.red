document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('animation');
    var header = document.getElementById('header');

    var ctx;
    var width = 170;
    var height = 40;
    var cellSize = 5;
    var cellBorder = 1;
    var grid = [];

    function redraw(x, y) {
        if (grid[x][y]) {
            ctx.fillStyle = "rgb(230, 230, 230)";
        } else {
            ctx.fillStyle = "rgb(255, 255, 255)";
        }
        ctx.fillRect(x * (cellSize + cellBorder),
                y * (cellSize + cellBorder), cellSize, cellSize);
    }

    function redrawAll() {
        for (x = 0; x < width; x ++) {
            for (y = 0; y < height; y ++) {
                redraw(x, y);
            }
        }
    }

    function mod(a, b) {
        return ((a%b)+b)%b;
    }

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

    function step() {
        // make canvas fit header
        var oldWidth = canvas.width, oldHeight = canvas.height;
        canvas.style.width = '100%';

        // if canvas has changed size, redraw everything
        if (oldWidth !== canvas.offsetWidth ||
                oldHeight !== canvas.offsetHeight) {
            canvas.width = canvas.offsetWidth;
            canvas.height = header.offsetHeight;
            redrawAll();
        }

        var births = [];
        var deaths = [];

        for (var x = 0; x < width; x ++) {
            for (var y = 0; y < height; y ++) {
                var num = numNeighbours(x, y);
                if (grid[x][y] && (num < 2 || num > 3)) {
                    deaths.push({x: x, y: y});
                } else if (!grid[x][y] && num === 3) {
                    births.push({x: x, y: y});
                }
            }
        }

        births.forEach(function(birth) {
            grid[birth.x][birth.y] = true;
            redraw(birth.x, birth.y);
        });

        deaths.forEach(function(death) {
            grid[death.x][death.y] = false;
            redraw(death.x, death.y);
        });
    }

    if (canvas.getContext) {
        ctx = canvas.getContext('2d');

        // Create game of life grid
        var x, y;
        for (x = 0; x < width; x ++) {
            var col = [];
            for (y = 0; y < height; y ++) {
                col.push(Math.random() < 0.5);
            }
            grid.push(col);
        }

        redrawAll();

        // Start running
        setInterval(step, 100);
    }
}, false);

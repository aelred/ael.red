document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('animation');
    var surround = canvas.parentNode;
    var useFade = canvas.classList.contains('animation-fade');
    var requestForWork = canvas.classList.contains('request-for-work');

    var ctx;

    // width and height in cells of game of life
    var width = 80;
    var height = 40;
    // width and height of cells in pixels
    var cellSize = 5;
    var cellBorder = 1;

    // 2D grid of cells
    var grid = [];

    // Current mouse coords on grid
    var mouse;

    var _ = false;
    var O = true;

    var spaceship = [
        [_, _, _, _, _, _, _],
        [_, O, _, _, O, _, _],
        [_, _, _, _, _, O, _],
        [_, O, _, _, _, O, _],
        [_, _, O, O, O, O, _],
        [_, _, _, _, _, _, _]
    ]

    var message = [
        [O, O, O, _, O, _, _, _, O, O, O, _, O, O, O, _, O, O, O, _, O, O, O],
        [O, _, O, _, O, _, _, _, O, _, _, _, O, _, O, _, O, _, _, _, O, _, _],
        [O, O, O, _, O, _, _, _, O, O, _, _, O, O, O, _, O, O, O, _, O, O, _],
        [O, _, _, _, O, _, _, _, O, _, _, _, O, _, O, _, _, _, O, _, O, _, _],
        [O, _, _, _, O, O, O, _, O, O, O, _, O, _, O, _, O, O, O, _, O, O, O],
        [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        [_, _, _, _, O, _, O, _, O, O, O, _, O, O, _, _, O, O, O, _, _, _, _],
        [_, _, _, _, O, _, O, _, _, O, _, _, O, _, O, _, O, _, _, _, _, _, _],
        [_, _, _, _, O, O, O, _, _, O, _, _, O, O, _, _, O, O, _, _, _, _, _],
        [_, _, _, _, O, _, O, _, _, O, _, _, O, _, O, _, O, _, _, _, _, _, _],
        [_, _, _, _, O, _, O, _, O, O, O, _, O, _, O, _, O, O, O, _, _, _, _],
        [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        [_, _, O, O, O, _, O, O, O, _, O, _, _, _, O, O, O, _, O, _, O, _, _],
        [_, _, O, _, _, _, O, _, _, _, O, _, _, _, _, O, _, _, O, _, O, _, _],
        [_, _, O, O, _, _, O, O, _, _, O, _, _, _, _, O, _, _, _, O, _, _, _],
        [_, _, O, _, _, _, O, _, _, _, O, _, _, _, _, O, _, _, O, _, O, _, _],
        [_, _, O, _, _, _, O, O, O, _, O, O, O, _, O, O, O, _, O, _, O, _, _]
    ]

    // Location of 'special' cell
    function special() {
        return {x: width - 2, y: 1};
    }

    // Redraw a particular cell
    function redraw(x, y) {
        var xPos = x * (cellSize + cellBorder);
        var yPos = y * (cellSize + cellBorder);

        var specialCell = x === special().x && y === special().y;
        var mouseOver = false;
        if (mouse !== undefined) {
            mouseOver = mouse.x === x && mouse.y === y;
        }

        if (grid[x][y] || (mouseOver && specialCell)) {
            var hue = 0, sat = 0, light = 0;

            // Make smooth fade-out
            var baseLight;
            if (useFade) {
                baseLight = 85;
            } else {
                baseLight = 0;
            }

            light = baseLight + Math.round((yPos / canvas.height) * (100 - baseLight));

            // Special coloured square!
            if (useFade && specialCell) {
                light = mouseOver ? 70 : 80;
                sat = 100;
            }

            ctx.fillStyle = "hsl(" + hue + ", " + sat + "%, " + light + "%)";
        } else {
            ctx.fillStyle = "white";
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

    function readMessage(x, y) {
        var block_width = spaceship[0].length;
        var block_height = spaceship.length;

        var new_x = Math.floor(x / block_width);
        var new_y = Math.floor(y / block_height);

        if (new_y < 0 || new_y >= message.length) {
            return false;
        }

        row = message[new_y];

        if (new_x < 0 || new_x >= row.length) {
            return false;
        }

        return row[new_x] && spaceship[y % block_height][x % block_width];
    }

    // Create a randomly alive new cell
    function newCell(x, y) {
        if (requestForWork) {
            return readMessage(x, y)
        } else {
            return Math.random() < 0.15;
        }
    }

    // Resize grid to match canvas
    function resize() {
        var x, y;

        if (canvas.width !== surround.offsetWidth ||
                canvas.height !== surround.offsetHeight) {
            canvas.width = surround.offsetWidth;
            canvas.height = surround.offsetHeight;

            // Adjust number of cells
            var oldWidth = width, oldHeight = height;
            width = Math.floor(canvas.width / (cellSize + cellBorder));
            height = Math.floor(canvas.height / (cellSize + cellBorder));

            // Add/remove rows of cells if necessary
            if (height < oldHeight) {
                for (x = 0; x < oldWidth; x++) {
                    grid[x].splice(height, oldHeight - height);
                }
            } else if (height > oldHeight) {
                for (x = 0; x < oldWidth; x++) {
                    for (y = oldHeight; y < height; y++) {
                        grid[x].push(newCell(x, y));
                    }
                }
            }

            // Add/remove columns of cells if necessary
            if (width < oldWidth) {
                grid.splice(width, oldWidth - width);
            } else if (width > oldWidth) {
                for (x = oldWidth; x < width; x++) {
                    var col = [];
                    for (y = 0; y < height; y++) {
                        col.push(newCell(x, y));
                    }
                    grid.push(col);
                }
            }

            redrawAll();
        }
    }

    // Perform a single simulation step
    function step() {
        resize();

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

        x = Math.floor((clientX - x) / (cellSize + cellBorder));
        y = Math.floor((clientY - y) / (cellSize + cellBorder));

        return {x: x, y: y};
    }
    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

    // create an alive cell wherever mouse moves
    function mouseMove(e) {
        mouse = canvas.relMouseCoords(e);

        if (mouse.x >= 0 && mouse.x < width &&
                mouse.y >= 0 && mouse.y < height) {
            grid[mouse.x][mouse.y] = true;
            redraw(mouse.x, mouse.y);
        }

        // deal with special cell
        redraw(special().x, special().y);
        if (mouse.x === special().x && mouse.y === special().y) {
            surround.style.cursor = 'pointer';
        } else {
            surround.style.cursor = 'default';
        }
    }

    // For when clicking special cell
    function mouseClick(e) {
        console.log('click');
        mouse = canvas.relMouseCoords(e);

        if (mouse.x === special().x && mouse.y === special().y) {
            window.location = "gol.html";
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
                col.push(newCell(x, y));
            }
            grid.push(col);
        }

        redrawAll();

        // Start running
        setInterval(step, 100);
        surround.addEventListener('mousemove', mouseMove, false);
        surround.addEventListener('touchmove', mouseMove, false);
        surround.addEventListener('click', mouseClick, false);
    }
}, false);

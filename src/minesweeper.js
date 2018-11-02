const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    // ToDo
    // redraw();
}

let images = {};
preLoad();

const sizePerBox = 30;
const columns = Math.floor(canvas.width/sizePerBox);
const rows = Math.floor(canvas.height/sizePerBox);
const offsetX = Math.floor((canvas.width % sizePerBox)/2);
const offsetY = Math.floor((canvas.height % sizePerBox)/2);
const numberOfBombs = Math.floor((columns * rows) / 10);
let leftToUncover = (columns * rows) - numberOfBombs;
let flags = 0;
let running = false;

let currentlyTouchedElement;
let touchStart;

const grid = [];
for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
        grid.push({
            isBomb: false,
            isCovered: true,
            isFlagged: false,
            warning: 0,
            neighbors: getNeighbors(row, column),
            img: images.cover
        });
    }
}

console.log("Grid size: " + grid.length);

for (let i = 0; i < numberOfBombs; i++) {
    let randColumn = Math.floor((Math.random() * columns));
    let randRow = Math.floor((Math.random() * rows));
    let slot = grid[randRow * columns + randColumn];
    if (slot.isBomb) {
        i--;
        continue;
    }
    slot.isBomb = true;
    for (let neighborSlot in slot.neighbors) {
        if (!slot.neighbors.hasOwnProperty(neighborSlot)) continue;
        grid[slot.neighbors[neighborSlot]].warning ++;
    }
}

function render() {
    for (let column = 0; column < columns; column++) {
        for (let row = 0; row < rows; row++) {
            let slot = grid[row * columns + column];
            draw(slot.img, column, row);
        }
    }
}

function draw(img, column, row) {
    ctx.drawImage(img, column * sizePerBox + offsetX, row * sizePerBox + offsetY, sizePerBox, sizePerBox);
}

function update() {
    document.title = "Mines: " + flags + "/" + numberOfBombs;
}

function getNeighbors(row, column) {
    let neighbors = [];
    // left, right, top, bottom
    if (column > 0) {
        neighbors.push(row * columns + column - 1)
    }
    if (row > 0) {
        neighbors.push((row - 1)* columns + column)
    }
    if (column < columns - 1) {
        neighbors.push(row * columns + column + 1)
    }
    if (row < rows - 1) {
        neighbors.push((row + 1)* columns + column)
    }
    // four corners
    if (column > 0 && row > 0) {
        neighbors.push((row - 1) * columns + column - 1)
    }
    if (column > 0 && row < rows - 1) {
        neighbors.push((row + 1)* columns + column - 1)
    }
    if (column < columns - 1 && row > 0) {
        neighbors.push((row - 1) * columns + column + 1)
    }
    if (column < columns - 1 && row < rows - 1) {
        neighbors.push((row + 1) * columns + column + 1)
    }
    return neighbors;
}

function start() {
    running = true;
    render();
    update();
}
window.onload = start;

function uncover(x, y) {
    let slot = grid[y * columns + x];
    if (!slot.isCovered) return;
    if (slot.isFlagged) return;
    if (slot.isBomb) lost();
    else slot.img = images[slot.warning];
    slot.isCovered = false;
    if (leftToUncover === 1) won();
    else leftToUncover --;
    console.log("left: " + leftToUncover);
    draw(slot.img, x, y);
    if (slot.warning === 0) {
        collectSlotsToUncover(x, y);
        uncoverArea();
    }
}

let slotsToUncover = new Set();
function collectSlotsToUncover(x, y) {
    let slot = grid[y * columns + x];
    for (let i in slot.neighbors) {
        if (!slot.neighbors.hasOwnProperty(i)) continue;
        let slotToUncover = slot.neighbors[i];
        if (slotsToUncover.has(slotToUncover)) continue;
        if (grid[slotToUncover].isBomb) continue;
        if (grid[slotToUncover].isFlagged) continue;
        if (!grid[slotToUncover].isCovered) continue;
        slotsToUncover.add(slotToUncover);
        if ((grid[slotToUncover].warning === 0) && !grid[slotToUncover].isFlagged)
            collectSlotsToUncover(slotToUncover % columns, Math.floor(slotToUncover / columns));
    }
}

function uncoverArea() {
    for (let slotNum of slotsToUncover) {
        let slot = grid[slotNum];
        slot.isCovered = false;
        slot.img = images[slot.warning];
        leftToUncover --;
        console.log("left: " + leftToUncover);
        draw(slot.img, slotNum % columns, Math.floor(slotNum / columns))
    }
    if (leftToUncover === 1) won();
    slotsToUncover.clear();
}

function flag(x, y) {
    let slot = grid[y * columns + x];
    if (!slot.isCovered) return;
    if (slot.isFlagged) {
        flags --;
        slot.img = images.cover;
    } else {
        flags ++;
        slot.img = images.flag;
    }
    slot.isFlagged = !slot.isFlagged;
    draw(slot.img, x, y);
    update();
}

function lost() {
    uncoverAll();
    document.title = "You lost!";
    running = false;
}

function won() {
    document.title = "You won!";
    running = false;
}

function uncoverAll() {
    for (let column = 0; column < columns; column++) {
        for (let row = 0; row < rows; row++) {
            let slot = grid[row * columns + column];
            if (slot.isBomb) slot.img = images.mine;
            else slot.img = images[slot.warning];
            draw(slot.img, column, row);
        }
    }
}

function preLoad() {
    const cover = new Image();
    cover.src = "src/assets/cover.png";
    const flagImg = new Image();
    flagImg.src = "src/assets/flag.png";
    const mine = new Image();
    mine.src = "src/assets/mine.png";
    const warning0 = new Image();
    warning0.src = "src/assets/0.png";
    const warning1 = new Image();
    warning1.src = "src/assets/1.png";
    const warning2 = new Image();
    warning2.src = "src/assets/2.png";
    const warning3 = new Image();
    warning3.src = "src/assets/3.png";
    const warning4 = new Image();
    warning4.src = "src/assets/4.png";
    const warning5 = new Image();
    warning5.src = "src/assets/5.png";
    const warning6 = new Image();
    warning6.src = "src/assets/6.png";
    const warning7 = new Image();
    warning7.src = "src/assets/7.png";
    const warning8 = new Image();
    warning8.src = "src/assets/8.png";

    images = {
        cover: cover,
        flag: flagImg,
        mine: mine,
        0: warning0,
        1: warning1,
        2: warning2,
        3: warning3,
        4: warning4,
        5: warning5,
        6: warning6,
        7: warning7,
        8: warning8
    };
}

let manager = new Hammer.Manager(canvas);

let Tap = new Hammer.Tap({
    taps: 1
});

let Press = new Hammer.Press({
    time: 500
});


manager.add(Tap);
manager.add(Press);

manager.get('press').recognizeWith('tap');
manager.get('tap').requireFailure('press');

manager.on('tap press', function(event) {
    console.log(event);

    x = event.center.x + window.pageXOffset;
    y = event.center.y + window.pageYOffset;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    if (!running) return;
    if (event.type === 'tap') uncover(Math.floor(x / sizePerBox), Math.floor(y / sizePerBox));
    if (event.type === 'press') flag(Math.floor(x / sizePerBox), Math.floor(y / sizePerBox));
});




/*
if('ontouchstart' in window) {
    canvas.addEventListener("touchstart", onTouchStart, false);
    canvas.addEventListener("touchmove", onTouchMove, false);
    canvas.addEventListener("touchend", onTouchEnd, false);
}
else canvas.addEventListener("mousedown", onClick, false);


function onClick(event) {
    if (!running) return;

    let x = event.x;
    let y = event.y;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    if (event.button === 0) uncover(Math.floor(x / sizePerBox), Math.floor(y / sizePerBox));
    if (event.button === 2) flag(Math.floor(x / sizePerBox), Math.floor(y / sizePerBox));
}

function onTouchStart(event) {
    //if (event.targetTouches.length === 1) { //one finger touche
        let touch = event.targetTouches[0];

        let x = touch.pageX;
        let y = touch.pageY;

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        currentlyTouchedElement = grid[Math.floor(x / sizePerBox) + Math.floor(y / sizePerBox) * columns];
        touchStart = performance.now();
    //}
}

function onTouchMove(event) {
    //if (event.targetTouches.length === 1) { //one finger touche
        let touch = event.targetTouches[0];

        let x = touch.pageX;
        let y = touch.pageY;

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        if (typeof currentlyTouchedElement == undefined) return;
        if (currentlyTouchedElement !== grid[Math.floor(x / sizePerBox) + Math.floor(y / sizePerBox) * columns]) {
            touchStart = performance.now();
            currentlyTouchedElement = grid[Math.floor(x / sizePerBox) + Math.floor(y / sizePerBox) * columns];
        }
    //}
}

function onTouchEnd(event) {
    //if (event.targetTouches.length === 1) { //one finger touche
        let touch = event.targetTouches[0];

        let x = touch.pageX;
        let y = touch.pageY;

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        if ((performance.now() - touchStart) > 2000) {
            flag(Math.floor(x / sizePerBox), Math.floor(y / sizePerBox));
        } else {
            uncover(Math.floor(x / sizePerBox), Math.floor(y / sizePerBox));
        }
        currentlyTouchedElement = undefined;
    //}
}
*/
"use strict";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const FIELD_WIDTH = 415;
const HEIGHT = 815;
const ALL_WIDTH = 800;

const WIDTH_BLOCKS = 8;
const HEIGHT_BLOCKS = 16;

const BLOCK_SIZE = 45;
const SPACE = 5;

function drawTile(x, y, color) {
    // if (x < 0 || x >= WIDTH_BLOCKS || y < 0 || y >= HEIGHT_BLOCKS) {
    //     return;
    // }
    // はみ出さない実装なので不要
    context.fillStyle = color;
    context.fillRect(
        10 + x * (BLOCK_SIZE + SPACE),
        10 + y * (BLOCK_SIZE + SPACE),
        BLOCK_SIZE, BLOCK_SIZE
    );
}

class Block {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    draw() {
        drawTile(this.x, this.y, this.color);
    }

    isFilled() {
        return true;
    }

    sameColor(x, y) {
        return new Block(x, y, this.color);
    }
}

class BlankBlock {
    constructor() {
    }

    draw() {
    }

    isFilled() {
        return false;
    }
}

class WallBlock {
    constructor() {
    }

    draw() {
        ;
    }

    isFilled() {
        return true;
    }
}

const BLANK = new BlankBlock();
const WALL = new WallBlock();

class Field {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.blocks = [];
        for(let x = 0; x < this.width; x++) {
            this.blocks.push([]);
            for(let y = 0; y < this.height; y++) {
                this.blocks[x].push(BLANK);
            }
        }
    }

    draw() {
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                if (this.blocks[x][y].isFilled()) {
                    this.blocks[x][y].draw();
                }
            }
        }
    }

    getTileAt(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return WALL;
        }
        return this.blocks[x][y];
    }

    setTile(x, y, newTile) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new RangeError();
        }
        this.blocks[x][y] = newTile;
    }

    isClearableAtRow(y) {
        let clearable = true;
        for (let x = 0; x < this.width; x++) {
            if (!this.blocks[x][y].isFilled()) {
                clearable = false;
                break;
            }
        }
        return clearable;
    }

    clear() {
        let drop = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.isClearableAtRow(y)) {
                drop++;
            } else {
                for (let x = 0 ; x < this.width; x++) {
                    if (this.blocks[x][y].isFilled()) {
                        this.blocks[x][y + drop] = this.blocks[x][y].sameColor(x, y + drop);
                    } else {
                        this.blocks[x][y + drop] = BLANK;
                    }
                }
            }
        }
        for (let y = 0; y < drop; y++) {
            for (let x = 0 ; x < this.width; x++) {
                this.blocks[x][y] = BLANK;
            }
        }
    }
}

const SHAPES = [
    {
        blocks: [
            [0, 1, 0, 0,],
            [0, 1, 0, 0,],
            [0, 1, 0, 0,],
            [0, 1, 0, 0,],
        ],
        color: "aqua",
    },
    {
        blocks: [
            [0, 0, 0, 0,],
            [0, 1, 1, 0,],
            [0, 1, 1, 0,],
            [0, 0, 0, 0,],
        ],
        color: "yellow",
    },
    {
        blocks: [
            [0, 1, 0, 0,],
            [0, 1, 0, 0,],
            [0, 1, 1, 0,],
            [0, 0, 0, 0,],
        ],
        color: "blue",
    },
    {
        blocks: [
            [0, 0, 1, 0,],
            [0, 0, 1, 0,],
            [0, 1, 1, 0,],
            [0, 0, 0, 0,],
        ],
        color: "orange",
    },
    {
        blocks: [
            [0, 1, 0, 0,],
            [0, 1, 1, 0,],
            [0, 0, 1, 0,],
            [0, 0, 0, 0,],
        ],
        color: "lime",
    },
    {
        blocks: [
            [0, 0, 1, 0,],
            [0, 1, 1, 0,],
            [0, 1, 0, 0,],
            [0, 0, 0, 0,],
        ],
        color: "red",
    },
    {
        blocks: [
            [0, 0, 1, 0,],
            [0, 1, 1, 0,],
            [0, 0, 1, 0,],
            [0, 0, 0, 0,],
        ],
        color: "purple",
    },
];

class Mino {
    constructor(x, y, shape, rotation) {
        this.x = x;
        this.y = y;
        this.shapeIndex = shape;
        this.shape = SHAPES[this.shapeIndex].blocks;
        this.rotation = rotation;
        this.color = SHAPES[this.shapeIndex].color;
        console.log("new mino : " + SHAPES[this.shapeIndex].color);
    }

    copy() {
        return new Mino(this.x, this.y, this.shapeIndex, this.rotation);
    }

    #forEachBlock(func) {
        for (let xp = 0; xp < this.shape.length; xp++) {
            for (let yp = 0; yp < this.shape[xp].length; yp++) {
                const block = this.shape[xp][yp];
                if (block == 0) {
                    continue;
                }
                let xpTrue = xp - 1.5;
                let ypTrue = yp - 1.5;
                const loopNum = ((this.rotation % 4) + 4) % 4;
                for (let i = 0; i < loopNum; i++) {
                    [xpTrue, ypTrue] = [-ypTrue, xpTrue];
                }
                func(
                    Math.round(this.x + xpTrue + 0.5),
                    Math.round(this.y + ypTrue + 0.5),
                );
            }
        }
    }

    draw() {
        this.#forEachBlock(function (x, y) {
            drawTile(x, y, this.color);
        }.bind(this));
    }

    isHit(field) {
        let res = false;
        this.#forEachBlock(function (x, y) {
            const fieldBlock = field.getTileAt(x, y);
            if (fieldBlock.isFilled()) {
                res = true;
            }
        });
        return res;
    }

    // isHitがfalseの時に呼び出してね
    fix(field) {
        this.#forEachBlock(function (x, y) {
            field.setTile(x, y, new Block(x, y, this.color));
        }.bind(this));
    }
}

function clearScreen() {
    context.fillStyle = "black";
    context.fillRect(0, 0, FIELD_WIDTH, HEIGHT);
    context.fillStyle = "gray";
    context.fillRect(FIELD_WIDTH, 0, ALL_WIDTH, HEIGHT);
}

class PlayScreen {
    constructor(width, height, canvas) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.bindedKeyEventListener = this.keydown.bind(this);
    }

    start() {
        this.frameCount = 0;
        this.field = new Field(this.width, this.height);
        this.mino = this.generateMino();
        document.body.addEventListener("keydown", this.bindedKeyEventListener);
        this.loopId = setInterval(this.loop.bind(this), 20);
        this.draw();
    }

    stop() {
        document.body.removeEventListener("keydown", this.bindedKeyEventListener);
        clearInterval(this.loopId);
    }

    keydown(e) {
        const keyCode = e.code;
        switch (keyCode) {
            case "Space":
                this.rotateMino(1);
                console.log("rotate");
                break;
            case "ArrowRight":
                this.translateMino(1);
                console.log("translateR");
                break;
            case "ArrowLeft":
                this.translateMino(-1);
                console.log("translateL");
                break;
            case "ArrowDown":
                this.dropMino(1);
                console.log("manualDrop");
            default:
                break;
        }
    }

    generateMino() {
        const shape = Math.floor(Math.random() * SHAPES.length);
        return new Mino(3, 1, shape, 0);
    }

    translateMino(vx) {
        const newMino = this.mino.copy();
        newMino.x += vx;
        if (!newMino.isHit(this.field)) {
            this.mino = newMino;
        }
    }

    rotateMino(dRotation) {
        const newMino = this.mino.copy();
        newMino.rotation += dRotation;
        if (!newMino.isHit(this.field)) {
            this.mino = newMino;
        }
    }

    dropMino(vy) {
        const newMino = this.mino.copy();
        newMino.y += vy;
        if (newMino.isHit(this.field)) {
            this.mino.fix(this.field);
            this.field.clear();
            this.mino = this.generateMino();
        } else {
            this.mino = newMino;
        }
    }

    draw() {
        clearScreen();
        this.field.draw();
        this.mino.draw();
    }

    loop() {
        // console.log(`loop (framecount : ${this.frameCount})`);
        this.frameCount++;
        if (this.frameCount >= 50) {
            this.frameCount = 0;
            this.dropMino(1);
        }
        this.draw();
    }
}

function drawTitleScreen() {
    context.font = "20px sans-serif";
    context.fillStyle = "white";
    context.fillText("Press [ Space ] to start.", 50, 400);
}

clearScreen();
drawTitleScreen();

let game = new PlayScreen(WIDTH_BLOCKS, HEIGHT_BLOCKS, canvas);

let playing = false;

function play() {
    if (!playing) {
        game.start();
        console.log("started");
        playing = true;
    }
}

function drawTitleListener(e) {
    if (e.code == "Space") {
        play();
    }
}

function init() {
    clearScreen();
    drawTitleScreen();
    document.body.addEventListener("keydown", drawTitleListener);
}

init();

/* =====================================
   DOODLE JUMP
   Main game using p5.js
   ===================================== */

// Game settings
const GAME_WIDTH = 420;
const GAME_HEIGHT = 600;

const GRAVITY = 0.42;
const JUMP_FORCE = -10.5;

let player;
let platforms = [];

let cameraY = 0;
let score = 0;

let gameState = "start";


/* =====================================
   SETUP
   ===================================== */

function setup() {

    let canvas = createCanvas(
        GAME_WIDTH,
        GAME_HEIGHT
    );

    canvas.parent("game");

    textFont("Arial");

    resetGame();

}


/* =====================================
   RESET GAME
   ===================================== */

function resetGame() {

    platforms = [];

    cameraY = 0;
    score = 0;

    // Starting platform
    let startingPlatform = new Platform(
        155,
        530,
        "normal"
    );

    platforms.push(startingPlatform);

    // Character starts directly on platform
    player = new Player(183, 488);

    // First platforms are placed within jumping range
    let previousX = 155;

    for (let i = 1; i <= 7; i++) {

        let x = constrain(
            previousX + random(-90, 90),
            10,
            GAME_WIDTH - 90
        );

        let y = 530 - i * 85;

        let type = choosePlatformType();

        platforms.push(
            new Platform(x, y, type)
        );

        previousX = x;
    }

}


/* =====================================
   MAIN DRAW LOOP
   ===================================== */

function draw() {

    background(255, 250, 240);

    drawBackground();

    if (gameState === "start") {

        drawStartScreen();

    } else if (gameState === "playing") {

        playGame();

    } else if (gameState === "gameover") {

        drawGameOverScreen();

    }

}


/* =====================================
   GAMEPLAY
   ===================================== */

function playGame() {

    // Update player physics
    player.update();

    // Update every platform
    for (let platform of platforms) {

        platform.update();

    }

    // Check platform collisions
    for (let platform of platforms) {

        player.checkLanding(platform);

    }

    // Update camera
    updateCamera();

    // Draw platforms
    for (let platform of platforms) {

        platform.show(cameraY);

    }

    // Draw character
    player.show(cameraY);

    // Update score
    score = max(
        score,
        floor(-cameraY)
    );

    drawScore();

    // Generate platforms above the player
    generatePlatforms();

    // Remove old and broken platforms
    platforms = platforms.filter(
        platform =>
            !platform.broken &&
            platform.y - cameraY < GAME_HEIGHT + 80
    );

    // Check if player falls below screen
    if (player.y - cameraY > GAME_HEIGHT + 20) {

        gameState = "gameover";

    }

}


/* =====================================
   PLAYER CLASS
   ===================================== */

class Player {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.width = 42;
        this.height = 48;

        this.velocityX = 0;

        // Initial automatic jump
        this.velocityY = JUMP_FORCE;

        this.speed = 5;

        this.previousY = y;

    }


    // Update movement and gravity
    update() {

        this.previousY = this.y;

        this.velocityX = 0;

        // Move left
        if (
            keyIsDown(LEFT_ARROW) ||
            keyIsDown(65)
        ) {

            this.velocityX = -this.speed;

        }

        // Move right
        if (
            keyIsDown(RIGHT_ARROW) ||
            keyIsDown(68)
        ) {

            this.velocityX = this.speed;

        }

        this.x += this.velocityX;

        // Screen wrapping
        if (this.x > GAME_WIDTH) {

            this.x = -this.width;

        }

        if (this.x + this.width < 0) {

            this.x = GAME_WIDTH;

        }

        // Gravity pulls the character down
        this.velocityY += GRAVITY;

        // Update vertical position
        this.y += this.velocityY;

    }


    // Detect landing on platforms
    checkLanding(platform) {

        let previousBottom =
            this.previousY + this.height;

        let currentBottom =
            this.y + this.height;

        let horizontalCollision =
            this.x + this.width > platform.x &&
            this.x < platform.x + platform.width;

        let verticalCollision =
            previousBottom <= platform.y + 2 &&
            currentBottom >= platform.y;

        // Only land when falling
        if (
            this.velocityY > 0 &&
            horizontalCollision &&
            verticalCollision &&
            !platform.broken
        ) {

            // Put character exactly on platform
            this.y = platform.y - this.height;

            // Automatically jump again
            this.velocityY = JUMP_FORCE;

            // Breaking platform disappears
            if (platform.type === "breaking") {

                platform.broken = true;

            }

        }

    }


    // Draw the character
    show(cameraY) {

    let screenY = this.y - cameraY;

    // Small animation while jumping
    let bounce = Math.sin(frameCount * 0.12) * 1.5;

    push();

    // Feet and legs
    stroke(30, 105, 55);
    strokeWeight(3);
    fill(70, 190, 90);

    ellipse(
        this.x + 10,
        screenY + 42 + bounce,
        15,
        12
    );

    ellipse(
        this.x + 32,
        screenY + 42 + bounce,
        15,
        12
    );

    // Toes
    strokeWeight(2);

    line(this.x + 5, screenY + 44 + bounce,
         this.x + 2, screenY + 47 + bounce);

    line(this.x + 11, screenY + 45 + bounce,
         this.x + 10, screenY + 48 + bounce);

    line(this.x + 31, screenY + 45 + bounce,
         this.x + 30, screenY + 48 + bounce);

    line(this.x + 37, screenY + 44 + bounce,
         this.x + 40, screenY + 47 + bounce);


    // Arms
    stroke(30, 105, 55);
    strokeWeight(3);
    fill(80, 200, 100);

    ellipse(
        this.x + 2,
        screenY + 28 + bounce,
        12,
        17
    );

    ellipse(
        this.x + 40,
        screenY + 28 + bounce,
        12,
        17
    );


    // Main frog body
    stroke(30, 105, 55);
    strokeWeight(2);

    fill(75, 195, 95);

    ellipse(
        this.x + 21,
        screenY + 29 + bounce,
        40,
        35
    );


    // Cream belly
    noStroke();
    fill(215, 240, 170);

    ellipse(
        this.x + 21,
        screenY + 34 + bounce,
        23,
        22
    );


    // Two round eye bumps
    stroke(30, 105, 55);
    strokeWeight(2);
    fill(80, 205, 100);

    ellipse(
        this.x + 11,
        screenY + 10 + bounce,
        19,
        20
    );

    ellipse(
        this.x + 31,
        screenY + 10 + bounce,
        19,
        20
    );


    // Big white eyes
    noStroke();
    fill(255);

    ellipse(
        this.x + 12,
        screenY + 10 + bounce,
        13,
        15
    );

    ellipse(
        this.x + 30,
        screenY + 10 + bounce,
        13,
        15
    );


    // Black pupils
    fill(25);

    ellipse(
        this.x + 13,
        screenY + 11 + bounce,
        6,
        8
    );

    ellipse(
        this.x + 31,
        screenY + 11 + bounce,
        6,
        8
    );


    // Eye highlights
    fill(255);

    ellipse(
        this.x + 11,
        screenY + 8 + bounce,
        3,
        3
    );

    ellipse(
        this.x + 29,
        screenY + 8 + bounce,
        3,
        3
    );


    // Cute smiling mouth
    noFill();
    stroke(30, 90, 45);
    strokeWeight(2);

    arc(
        this.x + 21,
        screenY + 27 + bounce,
        15,
        9,
        0,
        PI
    );


    // Small nostrils
    fill(30, 90, 45);
    noStroke();

    ellipse(
        this.x + 17,
        screenY + 21 + bounce,
        2,
        2
    );

    ellipse(
        this.x + 25,
        screenY + 21 + bounce,
        2,
        2
    );


    pop();

}
}


/* =====================================
   PLATFORM CLASS
   ===================================== */

class Platform {

    constructor(x, y, type) {

        this.x = x;
        this.y = y;

        this.width = 75;
        this.height = 13;

        this.type = type;

        this.broken = false;

        // Moving platform properties
        this.speed = random(1, 2);
        this.direction = random() < 0.5 ? 1 : -1;

    }


    // Update moving platforms
    update() {

        if (this.type === "moving") {

            this.x +=
                this.speed * this.direction;

            // Change direction at screen edges
            if (
                this.x <= 0 ||
                this.x + this.width >= GAME_WIDTH
            ) {

                this.direction *= -1;

            }

        }

    }


    // Draw different platform types
    show(cameraY) {

        if (this.broken) {

            return;

        }

        let screenY = this.y - cameraY;

        push();

        strokeWeight(2);

        if (this.type === "normal") {

            fill(70, 190, 100);
            stroke(35, 125, 60);

        }

        else if (this.type === "moving") {

            fill(55, 170, 230);
            stroke(25, 100, 170);

        }

        else if (this.type === "breaking") {

            fill(225, 125, 75);
            stroke(160, 65, 40);

        }

        rect(
            this.x,
            screenY,
            this.width,
            this.height,
            7
        );

        // Extra markings for breaking platforms
        if (this.type === "breaking") {

            stroke(255, 220, 180);

            line(
                this.x + 25,
                screenY + 2,
                this.x + 35,
                screenY + 11
            );

            line(
                this.x + 48,
                screenY + 2,
                this.x + 40,
                screenY + 11
            );

        }

        pop();

    }

}


/* =====================================
   RANDOM PLATFORM GENERATION
   ===================================== */

function choosePlatformType() {

    let chance = random(100);

    if (chance < 65) {

        return "normal";

    }

    else if (chance < 85) {

        return "moving";

    }

    else {

        return "breaking";

    }

}


function generatePlatforms() {

    let highestY = Math.min(
        ...platforms.map(platform => platform.y)
    );

    // Keep generating platforms above the screen
    while (highestY > cameraY - 150) {

        let previousPlatform = platforms.reduce(
            (highest, current) =>
                current.y < highest.y ? current : highest
        );

        highestY -= random(75, 90);

        // Keep horizontal distances reachable
        let newX = constrain(
            previousPlatform.x + random(-90, 90),
            10,
            GAME_WIDTH - 85
        );

        let newType = choosePlatformType();

        platforms.push(
            new Platform(
                newX,
                highestY,
                newType
            )
        );

    }

}


/* =====================================
   CAMERA
   ===================================== */

function updateCamera() {

    // Follow the player when they climb
    if (player.y - cameraY < 220) {

        cameraY = player.y - 220;

    }

}


/* =====================================
   BACKGROUND
   ===================================== */

function drawBackground() {

    // Light background grid
    stroke(235, 228, 215);
    strokeWeight(1);

    for (let x = 20; x < GAME_WIDTH; x += 40) {

        line(x, 0, x, GAME_HEIGHT);

    }

    for (let y = 20; y < GAME_HEIGHT; y += 40) {

        line(0, y, GAME_WIDTH, y);

    }

}


/* =====================================
   SCORE
   ===================================== */

function drawScore() {

    noStroke();

    fill(40);

    textSize(20);

    textAlign(LEFT, TOP);

    text(
        "Score: " + score,
        15,
        15
    );

}


/* =====================================
   START SCREEN
   ===================================== */

function drawStartScreen() {

    fill(40);

    textAlign(CENTER, CENTER);

    textSize(42);

    text(
        "DOODLE JUMP",
        width / 2,
        170
    );

    textSize(18);

    fill(100);

    text(
        "Jump as high as you can!",
        width / 2,
        220
    );

    drawButton(
        "START GAME",
        125,
        310,
        170,
        55
    );

    textSize(14);

    fill(90);

    text(
        "Use arrows or A and D to move",
        width / 2,
        410
    );

}


/* =====================================
   GAME OVER SCREEN
   ===================================== */

function drawGameOverScreen() {

    fill(40);

    textAlign(CENTER, CENTER);

    textSize(42);

    text(
        "GAME OVER",
        width / 2,
        210
    );

    textSize(24);

    fill(80);

    text(
        "Final Score: " + score,
        width / 2,
        275
    );

    drawButton(
        "PLAY AGAIN",
        125,
        340,
        170,
        55
    );

}


/* =====================================
   BUTTON
   ===================================== */

function drawButton(label, x, y, w, h) {

    push();

    fill(70, 180, 105);

    stroke(40, 120, 70);

    strokeWeight(2);

    rect(
        x,
        y,
        w,
        h,
        12
    );

    noStroke();

    fill(255);

    textAlign(CENTER, CENTER);

    textSize(19);

    text(
        label,
        x + w / 2,
        y + h / 2
    );

    pop();

}


/* =====================================
   MOUSE CONTROLS
   ===================================== */

function mousePressed() {

    if (gameState === "start") {

        if (
            mouseX > 125 &&
            mouseX < 295 &&
            mouseY > 310 &&
            mouseY < 365
        ) {

            resetGame();

            gameState = "playing";

        }

    }

    else if (gameState === "gameover") {

        if (
            mouseX > 125 &&
            mouseX < 295 &&
            mouseY > 340 &&
            mouseY < 395
        ) {

            resetGame();

            gameState = "playing";

        }

    }

}


/* =====================================
   KEYBOARD CONTROLS
   ===================================== */

function keyPressed() {

    if (
        gameState === "start" &&
        (keyCode === ENTER || key === " ")
    ) {

        resetGame();

        gameState = "playing";

    }

    else if (
        gameState === "gameover" &&
        (keyCode === ENTER || key === " ")
    ) {

        resetGame();

        gameState = "playing";

    }

}
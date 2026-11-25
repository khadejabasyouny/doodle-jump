// Doodle Jump - Main Game

let player;
let platforms = [];
let cameraY = 0;
let score = 0;

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

// Create the game
function setup() {
    let canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent("game");

    player = new Player(180, 475);

    // Create the first platform directly underneath the player
    platforms.push(new Platform(150, 510));

    for (let i = 0; i < 8; i++) {
        let x = random(20, 320);
        let y = 470 - i * 80;
        platforms.push(new Platform(x, y));
    }
}

// Draw everything
function draw() {
    background(245, 240, 230);

    // Move the player
    player.update();

    // Move the camera upwards
    if (player.y - cameraY < 220) {
        cameraY = player.y - 220;
    }

    // Draw platforms
    for (let platform of platforms) {
        platform.show(cameraY);
        player.landOn(platform);
    }

    // Draw player
    player.show(cameraY);

    // Update score
    score = max(score, floor(-cameraY));
    document.getElementById("score").innerText =
        "Score: " + score;

    // Create new platforms above the screen
    let highestY = min(...platforms.map(p => p.y));

    while (highestY > cameraY - 200) {
        highestY -= random(65, 90);

        let x = random(20, GAME_WIDTH - 90);
        platforms.push(new Platform(x, highestY));
    }

    // Remove platforms below the screen
    platforms = platforms.filter(
        p => p.y - cameraY < GAME_HEIGHT + 50
    );

    // Check if player falls
    if (player.y - cameraY > GAME_HEIGHT) {
        noLoop();
        textAlign(CENTER);
        textSize(32);
        fill(200, 50, 50);
        text("GAME OVER!", width / 2, height / 2);
    }
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 35;
        this.velocityY = -11;
        this.gravity = 0.4;
        this.speed = 5;
        this.previousY = y;
    }

    update() {
        this.previousY = this.y;

        // Keyboard movement
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
            this.x -= this.speed;
        }

        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
            this.x += this.speed;
        }

        // Screen wrapping
        if (this.x > GAME_WIDTH) {
            this.x = -this.size;
        }

        if (this.x < -this.size) {
            this.x = GAME_WIDTH;
        }

        // Gravity and jumping
        this.velocityY += this.gravity;
        this.y += this.velocityY;
    }

    // Check if player lands on a platform
    landOn(platform) {
        let playerBottom = this.y + this.size;

        if (
            this.velocityY > 0 &&
            this.previousY + this.size <= platform.y &&
            playerBottom >= platform.y &&
            this.x + this.size > platform.x &&
            this.x < platform.x + platform.width
        ) {
            this.velocityY = -11;
        }
    }

    show(cameraY) {
        fill(255, 210, 80);
        stroke(50);
        strokeWeight(2);

        ellipse(
            this.x + this.size / 2,
            this.y - cameraY + this.size / 2,
            this.size,
            this.size
        );

        // Eyes
        fill(30);
        noStroke();
        ellipse(this.x + 12, this.y - cameraY + 13, 4, 4);
        ellipse(this.x + 24, this.y - cameraY + 13, 4, 4);

        // Smile
        noFill();
        stroke(30);
        arc(
            this.x + 18,
            this.y - cameraY + 19,
            12,
            9,
            0,
            PI
        );
    }
}

// Platform class
class Platform {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 12;
    }

    show(cameraY) {
        fill(255, 190, 40);
        stroke(30);
        strokeWeight(3);

        rect(
            this.x,
            this.y - cameraY,
            this.width,
            this.height,
            8
        );
    }
}
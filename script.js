const gridSpace = 30;

let fallingPiece;
let gridPieces = [];
let lineFades = [];
let particles = [];
let splashEffects = [];

let currentScore = 0;
let highScore = 0;
let currentLevel = 1;
let linesCleared = 0;

let ticks = 0;
let updateEvery = 15;
let updateEveryCurrent = 15;
let fallSpeed = gridSpace * 0.5;
let pauseGame = false;
let gameOver = false;

let showRestartModal = false;
let modalButton1Hover = false;
let modalButton2Hover = false;

const gameEdgeLeft = 150;
const gameEdgeRight = 450;

const colors = [
    '#9b59b6',
    '#e74c3c',
    '#2ecc71',
    '#e67e22',
    '#3498db',
    '#f1c40f',
    '#1abc9c',
];

function setup() {
    createCanvas(600, 540);
    fallingPiece = new PlayPiece();
    fallingPiece.resetPiece();
    textFont('Ubuntu');
    
    // Load high score
    const savedHighScore = localStorage.getItem('tetrisHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
    }
}

function draw() {
    const colorDark = '#0d0d0d';
    const colorLight = '#304550';
    const colorBackground = '#e1eeb0';

    background(colorBackground);

    updateParticles();
    updateSplashEffects();

    drawGradientRect(gameEdgeRight, 0, 150, height, '#1a1a2e', '#16213e');
    drawGradientRect(0, 0, gameEdgeLeft, height, '#1a1a2e', '#16213e');

    drawEnhancedUI(colorBackground, colorLight);

    stroke(colorDark);
    strokeWeight(1);
    line(gameEdgeRight, 0, gameEdgeRight, height);

    fallingPiece.show();

    // Draw ghost piece (shadow showing where piece will land)
    if (!pauseGame && !gameOver) {
        drawGhostPiece();
    }

    if (keyIsDown(32)) {
        updateEvery = 1;
    } else if (keyIsDown(DOWN_ARROW)) {
        updateEvery = 2;
    } else {
        updateEvery = updateEveryCurrent;
    }

    if (!pauseGame && !showRestartModal) {
        ticks++;
        if (ticks >= updateEvery) {
            ticks = 0;
            fallingPiece.fall(fallSpeed);
        }
    }

    for (let i = 0; i < gridPieces.length; i++) {
        gridPieces[i].show();
    }

    for (let i = 0; i < lineFades.length; i++) {
        lineFades[i].show();
    }

    drawControls();

    if (pauseGame && !gameOver && !showRestartModal) {
        drawPauseScreen();
    }

    if (gameOver) {
        drawGameOver();
    }

    if (showRestartModal) {
        drawRestartModal();
    }

    strokeWeight(4);
    stroke('#2c3e50');
    noFill();
    rect(2, 2, width - 4, height - 4, 8);
}

function drawGradientRect(x, y, w, h, c1, c2) {
    noStroke();
    for (let i = 0; i <= h; i++) {
        let inter = map(i, 0, h, 0, 1);
        let c = lerpColor(color(c1), color(c2), inter);
        stroke(c);
        line(x, y + i, x + w, y + i);
    }
}

function drawEnhancedUI(bgColor, lightColor) {
    drawUIPanel(460, 60, 130, 90, bgColor, 'SCORE', currentScore);
    drawUIPanel(460, 328, 130, 70, bgColor, 'HIGH SCORE!', highScore);
    drawUIPanel(460, 193, 130, 60, bgColor, 'LEVEL', currentLevel);
    drawUIPanel(460, 260, 130, 60, bgColor, 'LINES', linesCleared);
    
    fill(bgColor);
    stroke(lightColor);
    strokeWeight(3);
    rect(460, 405, 130, 130, 8);
    
    fill('#2c3e50');
    noStroke();
    textSize(16);
    textAlign(CENTER);
    text('NEXT', 525, 430);
}

function drawUIPanel(x, y, w, h, bgColor, label, value) {
    fill(bgColor);
    stroke('#304550');
    strokeWeight(3);
    rect(x, y, w, h, 8);
    
    fill('#2c3e50');
    noStroke();
    textSize(16);
    textAlign(CENTER);
    textStyle(BOLD);
    text(label, x + w/2, y + 22);
    
    drawTextWithGlow(String(value), x + w/2, y + h - 8, 22, '#2c3e50');
}

function drawTextWithGlow(txt, x, y, size, col) {
    textAlign(CENTER);
    textSize(size);
    textStyle(BOLD);
    
    fill(colors[currentLevel % colors.length] + '40');
    for (let i = 0; i < 3; i++) {
        text(txt, x + i, y);
        text(txt, x - i, y);
        text(txt, x, y + i);
        text(txt, x, y - i);
    }
    
    fill(col);
    text(txt, x, y);
}

function drawControls() {
    fill(255, 240);
    noStroke();
    textAlign(CENTER);
    textSize(13);
    textStyle(NORMAL);
    
    text('CONTROLS', 75, 140);
    textSize(11);
    text('← →  Move', 75, 165);
    text('↑  Rotate', 75, 185);
    text('↓  Drop', 75, 205);
    text('SPACE  Smash', 75, 225);
    text('P  Pause', 75, 245);
    text('R  Restart', 75, 265);
    text('M  Mute/Unmute', 75, 285);
    
    // Audio indicator - clickable
    if (audioInitialized) {
        if (audioMuted) {
            fill('#e74c3c');
            text('🔇 Muted', 75, 315);
            textSize(9);
            text('(Press M)', 75, 330);
        } else {
            fill('#2ecc71');
            text('🔊 Audio ON', 75, 315);
            textSize(9);
            text('(Press M)', 75, 330);
        }
    } else {
        fill('#e74c3c');
        textSize(11);
        text('🔇 Click to enable', 75, 315);
    }
}

function drawPauseScreen() {
    fill(0, 200);
    noStroke();
    rect(0, 0, width, height);
    
    let pulse = sin(frameCount * 0.08) * 5;
    fill(255);
    textSize(64 + pulse);
    textAlign(CENTER);
    textStyle(BOLD);
    text('PAUSED', 300, 250);
    
    textSize(18);
    textStyle(NORMAL);
    text('Press P to resume', 300, 300);
}

function drawRestartModal() {
    fill(0, 220);
    noStroke();
    rect(0, 0, width, height);
    
    fill('#e1eeb0');
    stroke('#304550');
    strokeWeight(4);
    rect(150, 180, 300, 180, 12);
    
    fill('#2c3e50');
    noStroke();
    textSize(24);
    textAlign(CENTER);
    textStyle(BOLD);
    text('Restart Game?', 300, 220);
    
    textSize(14);
    textStyle(NORMAL);
    text('Your current progress will be lost', 300, 250);
    
    // Yes button
    if (modalButton1Hover) {
        fill('#e74c3c');
    } else {
        fill('#c0392b');
    }
    stroke(255);
    strokeWeight(2);
    rect(170, 285, 100, 50, 8);
    
    // No button
    if (modalButton2Hover) {
        fill('#2ecc71');
    } else {
        fill('#27ae60');
    }
    rect(330, 285, 100, 50, 8);
    
    fill(255);
    noStroke();
    textSize(18);
    textStyle(BOLD);
    text('YES', 220, 317);
    text('NO', 380, 317);
    
    textSize(12);
    textStyle(NORMAL);
    text(220, 335);
    text(380, 335);
}

function drawGameOver() {
    fill(0, 180);
    noStroke();
    rect(0, 0, width, height);
    
    let pulse = sin(frameCount * 0.1) * 10;
    drawTextWithGlow('GAME OVER 😭', 300, 220, 54 + pulse, '#e74c3c');
    
    fill(255);
    textSize(18);
    textStyle(NORMAL);
    text('Final Score: ' + currentScore, 300, 270);
    
    if (currentScore === highScore && currentScore > 0) {
        fill('#f1c40f');
        textSize(20);
        textStyle(BOLD);
        text('🏆 NEW HIGH SCORE! 🏆', 300, 300);
    }
    
    fill(255);
    textSize(16);
    textStyle(NORMAL);
    text('Press R to restart', 300, 340);
}

function drawGhostPiece() {
    // Calculate where the piece would land
    let ghostY = fallingPiece.pos.y;
    let testY = ghostY;
    
    // Find the lowest position without collision
    while (!testCollision(fallingPiece.pos.x, testY + fallSpeed, fallingPiece.rotation)) {
        testY += fallSpeed;
    }
    
    // Only draw if ghost is below current piece
    if (testY <= ghostY) return;
    
    // Draw ghost pieces
    const points = orientPoints(fallingPiece.pieceType, fallingPiece.rotation);
    for (let i = 0; i < points.length; i++) {
        let x = fallingPiece.pos.x + points[i][0] * gridSpace;
        let y = testY + points[i][1] * gridSpace;
        
        // Draw semi-transparent ghost block
        fill(colors[fallingPiece.pieceType] + '40'); // 40 = 25% opacity
        stroke(colors[fallingPiece.pieceType] + 'AA'); // AA = 66% opacity
        strokeWeight(2);
        rect(x, y, gridSpace - 1, gridSpace - 1, 2);
        
        // Add highlight effect
        noStroke();
        fill(255, 60);
        rect(x + 5, y + 5, gridSpace - 15, 2, 1);
        rect(x + 5, y + 5, 2, gridSpace - 15, 1);
    }
}

function testCollision(x, y, rotation) {
    // Test collision for ghost piece calculation
    let points = orientPoints(fallingPiece.pieceType, rotation);
    
    for (let i = 0; i < points.length; i++) {
        let testX = x + points[i][0] * gridSpace;
        let testY = y + points[i][1] * gridSpace;
        
        if (testX < gameEdgeLeft || testX + gridSpace > gameEdgeRight || testY + gridSpace > height) {
            return true;
        }
        
        for (let j = 0; j < gridPieces.length; j++) {
            if (testX === gridPieces[j].pos.x) {
                if (testY >= gridPieces[j].pos.y && testY < gridPieces[j].pos.y + gridSpace) {
                    return true;
                }
                if (testY + gridSpace > gridPieces[j].pos.y && testY + gridSpace <= gridPieces[j].pos.y + gridSpace) {
                    return true;
                }
            }
        }
    }
    return false;
}

function updateParticles() {
    if (frameCount % 10 === 0 && particles.length < 20) {
        particles.push({
            x: random(gameEdgeLeft, gameEdgeRight),
            y: random(height),
            size: random(2, 4),
            speed: random(0.5, 1.5),
            alpha: random(100, 200)
        });
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        fill(colors[i % colors.length] + hex(p.alpha, 2));
        noStroke();
        circle(p.x, p.y, p.size);
        
        p.y -= p.speed;
        p.alpha -= 2;
        
        if (p.alpha <= 0 || p.y < 0) {
            particles.splice(i, 1);
        }
    }
}

function updateSplashEffects() {
    for (let i = splashEffects.length - 1; i >= 0; i--) {
        let splash = splashEffects[i];
        
        noFill();
        strokeWeight(3);
        stroke(colors[splash.colorIndex] + hex(splash.alpha, 2));
        circle(splash.x, splash.y, splash.size);
        
        for (let j = 0; j < splash.particles.length; j++) {
            let p = splash.particles[j];
            fill(colors[splash.colorIndex] + hex(splash.alpha, 2));
            noStroke();
            circle(p.x, p.y, p.size);
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
        }
        
        splash.size += 8;
        splash.alpha -= 5;
        
        if (splash.alpha <= 0) {
            splashEffects.splice(i, 1);
        }
    }
}

function createSplashEffect(y) {
    for (let x = gameEdgeLeft; x < gameEdgeRight; x += gridSpace) {
        let splash = {
            x: x + gridSpace / 2,
            y: y + gridSpace / 2,
            size: 10,
            alpha: 255,
            colorIndex: Math.floor(random(colors.length)),
            particles: []
        };
        
        for (let i = 0; i < 8; i++) {
            let angle = random(TWO_PI);
            let speed = random(2, 5);
            splash.particles.push({
                x: splash.x,
                y: splash.y,
                vx: cos(angle) * speed,
                vy: sin(angle) * speed - 2,
                size: random(3, 6)
            });
        }
        
        splashEffects.push(splash);
    }
}

function mousePressed() {
    if (!audioInitialized) {
        initAudio();
    }
    
    if (showRestartModal) {
        // Yes button
        if (mouseX > 170 && mouseX < 270 && mouseY > 285 && mouseY < 335) {
            confirmRestart();
        }
        // No button
        if (mouseX > 330 && mouseX < 430 && mouseY > 285 && mouseY < 335) {
            cancelRestart();
        }
    }
}

function mouseMoved() {
    if (showRestartModal) {
        modalButton1Hover = (mouseX > 170 && mouseX < 270 && mouseY > 285 && mouseY < 335);
        modalButton2Hover = (mouseX > 330 && mouseX < 430 && mouseY > 285 && mouseY < 335);
    }
}

function keyPressed() {
    if (showRestartModal) {
        if (keyCode === 89) { // Y key
            confirmRestart();
        } else if (keyCode === 78) { // N key
            cancelRestart();
        }
        return;
    }
    
    if (keyCode === 82) { // R key
        if (!gameOver) {
            showRestartModal = true;
        } else {
            resetGame();
        }
    }
    
    if (keyCode === 80) { // P key
        if (!gameOver) {
            pauseGame = !pauseGame;
            playPauseSound();
        }
    }
    
    if (keyCode === 77) { // M key - Mute/Unmute
        if (!audioInitialized) {
            initAudio();
        }
        toggleMute();
    }
    
    if (!pauseGame && !showRestartModal) {
        if (keyCode === LEFT_ARROW) {
            fallingPiece.input(LEFT_ARROW);
            playMoveSound();
        } else if (keyCode === RIGHT_ARROW) {
            fallingPiece.input(RIGHT_ARROW);
            playMoveSound();
        }
        if (keyCode === UP_ARROW) {
            fallingPiece.input(UP_ARROW);
            playRotateSound();
        }
        if (keyCode === 32) {
            fallingPiece.hardDrop();
        }
    }
    
    if (!audioInitialized) {
        initAudio();
    }
}

function confirmRestart() {
    showRestartModal = false;
    resetGame();
}

function cancelRestart() {
    showRestartModal = false;
}

function updateHighScore() {
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('tetrisHighScore', highScore);
    }
}

class PlayPiece {
    constructor() {
        this.pos = createVector(0, 0);
        this.rotation = 0;
        this.nextPieceType = Math.floor(Math.random() * 7);
        this.nextPieces = [];
        this.pieceType = 0;
        this.pieces = [];
        this.orientation = [];
        this.fallen = false;
    }

    nextPiece() {
        this.nextPieceType = pseudoRandom(this.pieceType);
        this.nextPieces = [];

        const points = orientPoints(this.nextPieceType, 0);
        let xx = 525, yy = 490;

        if (this.nextPieceType !== 0 && this.nextPieceType !== 3 && this.nextPieceType !== 5) {
            xx += (gridSpace * 0.5);
        }

        if (this.nextPieceType == 5) {
            xx -= (gridSpace * 0.5);
        }

        for (let i = 0; i < 4; i++) {
            this.nextPieces.push(new Square(xx + points[i][0] * gridSpace, yy + points[i][1] * gridSpace, this.nextPieceType));
        }
    }

    fall(amount) {
        if (!this.futureCollision(0, amount, this.rotation)) {
            this.addPos(0, amount);
            this.fallen = true;
        } else {
            if (!this.fallen) {
                pauseGame = true;
                gameOver = true;
                updateHighScore();
                playGameOverSound();
            } else {
                this.commitShape();
                playDropSound();
            }
        }
    }

    hardDrop() {
        while (!this.futureCollision(0, fallSpeed, this.rotation)) {
            this.addPos(0, fallSpeed);
        }
        this.commitShape();
        playDropSound();
        
        for (let i = 0; i < this.pieces.length; i++) {
            for (let j = 0; j < 10; j++) {
                particles.push({
                    x: this.pieces[i].pos.x + gridSpace / 2,
                    y: this.pieces[i].pos.y + gridSpace / 2,
                    size: random(3, 6),
                    speed: random(2, 5),
                    alpha: 255
                });
            }
        }
    }

    resetPiece() {
        this.rotation = 0;
        this.fallen = false;
        this.pos.x = 330;
        this.pos.y = -60;
        this.pieceType = this.nextPieceType;
        this.nextPiece();
        this.newPoints();
    }

    newPoints() {
        const points = orientPoints(this.pieceType, this.rotation);
        this.orientation = points;
        this.pieces = [];

        for (let i = 0; i < points.length; i++) {
            this.pieces.push(new Square(this.pos.x + points[i][0] * gridSpace, this.pos.y + points[i][1] * gridSpace, this.pieceType));
        }
    }

    updatePoints() {
        if (this.pieces) {
            const points = orientPoints(this.pieceType, this.rotation);
            this.orientation = points;
            for (let i = 0; i < 4; i++) {
                this.pieces[i].pos.x = this.pos.x + points[i][0] * gridSpace;
                this.pieces[i].pos.y = this.pos.y + points[i][1] * gridSpace;
            }
        }
    }

    addPos(x, y) {
        this.pos.x += x;
        this.pos.y += y;

        if (this.pieces) {
            for (let i = 0; i < 4; i++) {
                this.pieces[i].pos.x += x;
                this.pieces[i].pos.y += y;
            }
        }
    }

    futureCollision(x, y, rotation) {
        let xx, yy, points = 0;
        if (rotation !== this.rotation) {
            points = orientPoints(this.pieceType, rotation);
        }

        for (let i = 0; i < this.pieces.length; i++) {
            if (points) {
                xx = this.pos.x + points[i][0] * gridSpace;
                yy = this.pos.y + points[i][1] * gridSpace;
            } else {
                xx = this.pieces[i].pos.x + x;
                yy = this.pieces[i].pos.y + y;
            }
            if (xx < gameEdgeLeft || xx + gridSpace > gameEdgeRight || yy + gridSpace > height) {
                return true;
            }
            for (let j = 0; j < gridPieces.length; j++) {
                if (xx === gridPieces[j].pos.x) {
                    if (yy >= gridPieces[j].pos.y && yy < gridPieces[j].pos.y + gridSpace) {
                        return true;
                    }
                    if (yy + gridSpace > gridPieces[j].pos.y && yy + gridSpace <= gridPieces[j].pos.y + gridSpace) {
                        return true;
                    }
                }
            }
        }
    }

    input(key) {
        switch (key) {
            case LEFT_ARROW:
                if (!this.futureCollision(-gridSpace, 0, this.rotation)) {
                    this.addPos(-gridSpace, 0);
                }
                break;
            case RIGHT_ARROW:
                if (!this.futureCollision(gridSpace, 0, this.rotation)) {
                    this.addPos(gridSpace, 0);
                }
                break;
            case UP_ARROW:
                let newRotation = this.rotation + 1;
                if (newRotation > 3) {
                    newRotation = 0;
                }
                if (!this.futureCollision(0, 0, newRotation)) {
                    this.rotation = newRotation;
                    this.updatePoints();
                }
                break;
        }
    }

    show() {
        for (let i = 0; i < this.pieces.length; i++) {
            this.pieces[i].show();
        }
        for (let i = 0; i < this.nextPieces.length; i++) {
            this.nextPieces[i].show();
        }
    }

    commitShape() {
        for (let i = 0; i < this.pieces.length; i++) {
            gridPieces.push(this.pieces[i]);
        }
        this.resetPiece();
        analyzeGrid();
    }
}

class Square {
    constructor(x, y, type) {
        this.pos = createVector(x, y);
        this.type = type;
    }

    show() {
        strokeWeight(2);
        const colorMid = colors[this.type];

        fill(colorMid + '40');
        noStroke();
        rect(this.pos.x - 2, this.pos.y - 2, gridSpace + 3, gridSpace + 3, 3);

        fill(colorMid);
        stroke(25);
        strokeWeight(2);
        rect(this.pos.x, this.pos.y, gridSpace - 1, gridSpace - 1, 2);

        noStroke();
        fill(255, 180);
        rect(this.pos.x + 5, this.pos.y + 5, gridSpace - 15, 2, 1);
        rect(this.pos.x + 5, this.pos.y + 5, 2, gridSpace - 15, 1);
        
        fill(0, 80);
        rect(this.pos.x + 5, this.pos.y + gridSpace - 8, gridSpace - 10, 2);
        rect(this.pos.x + gridSpace - 8, this.pos.y + 5, 2, gridSpace - 10);
    }
}

function pseudoRandom(previous) {
    let roll = Math.floor(Math.random() * 8);
    if (roll === previous || roll === 7) {
        roll = Math.floor(Math.random() * 7);
    }
    return roll;
}

function analyzeGrid() {
    let score = 0;
    let cleared = 0;
    let clearedLines = [];
    
    for (let y = 0; y < height; y += gridSpace) {
        let count = 0;
        for (let i = 0; i < gridPieces.length; i++) {
            if (gridPieces[i].pos.y === y) {
                count++;
            }
        }
        if (count === 10) {
            clearedLines.push(y);
        }
    }
    
    for (let y of clearedLines) {
        gridPieces = gridPieces.filter(piece => piece.pos.y !== y);
        createSplashEffect(y);
        playLineClearSound();
        cleared++;
        score += 100;
        linesCleared += 1;
        
        if (linesCleared % 10 === 0) {
            currentLevel += 1;
            if (updateEveryCurrent > 2) {
                updateEveryCurrent -= 1;
            }
        }
        
        for (let i = 0; i < gridPieces.length; i++) {
            if (gridPieces[i].pos.y < y) {
                gridPieces[i].pos.y += gridSpace;
            }
        }
    }
    
    if (cleared > 1) {
        score *= cleared;
    }
    currentScore += score;
    
    if (cleared > 0) {
        for (let i = 0; i < cleared * 15; i++) {
            particles.push({
                x: random(gameEdgeLeft, gameEdgeRight),
                y: random(height),
                size: random(3, 6),
                speed: random(1, 3),
                alpha: 255
            });
        }
    }
}

function resetGame() {
    fallingPiece = new PlayPiece();
    fallingPiece.resetPiece();
    gridPieces = [];
    lineFades = [];
    particles = [];
    splashEffects = [];
    currentScore = 0;
    currentLevel = 1;
    linesCleared = 0;
    ticks = 0;
    updateEvery = 15;
    updateEveryCurrent = 15;
    fallSpeed = gridSpace * 0.5;
    pauseGame = false;
    gameOver = false;
    showRestartModal = false;
}
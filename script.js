// Game state
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameContainer = document.getElementById('gameContainer');
const character = document.getElementById('character');
const interactBtn = document.getElementById('interactBtn');
const gameArea = document.getElementById('gameArea');
const messageDisplay = document.getElementById('messageDisplay');
const collectedCountEl = document.getElementById('collectedCount');
const collectedLettersDisplay = document.getElementById('collectedLettersDisplay');
const finalScene = document.getElementById('finalScene');
const endButton = document.getElementById('endButton');

// Responsive positioning - calculate based on game area size
function getGameAreaDimensions() {
    return {
        width: gameArea.offsetWidth,
        height: gameArea.offsetHeight
    };
}

let characterPos = { x: 0, y: 0 }; // Will be set in initializeGame
let speed = 3; // Slower movement
let nearbyObject = null;
let collectedLetters = [];
let totalLetters = 13;
let gameStarted = false;
let gameCompleted = false;
let messageTimeout = null;

// Initialize character position based on game area size
function initializeGame() {
    const dims = getGameAreaDimensions();
    characterPos.x = dims.width / 2 - 40; // Center horizontally
    characterPos.y = dims.height / 2 - 40; // Center vertically
    updateCharacterPosition();
}

// Object data with messages and special effects
const objectData = {
    flower: { letter: 'H', message: 'Something beautiful for someone beautiful.', effect: 'hearts' },
    tree: { letter: 'A', message: 'No matter how much time passes, some things only grow stronger.', effect: 'hearts' },
    butterfly: { letter: 'P', message: 'Wishes take flight...', effect: 'fly' },
    crown: { letter: 'P', message: 'Today, you\'re the VIP 👑', effect: 'sparkle' },
    star: { letter: 'Y', message: 'You shine brighter than any star ⭐', effect: 'sparkle' },
    gift: { letter: 'B', message: 'A special surprise awaits...', effect: 'shake' },
    cake: { letter: 'I', message: 'Make a wish! 🎂', effect: 'candles' },
    diamond: { letter: 'R', message: 'You\'re a rare gem 💎', effect: 'sparkle' },
    rainbow: { letter: 'T', message: 'After every storm comes color 🌈', effect: 'rainbow' },
    balloon: { letter: 'H', message: 'Let your dreams soar high 🎈', effect: 'float' },
    sun: { letter: 'D', message: 'You brighten everyone\'s day ☀️', effect: 'glow' },
    heart: { letter: 'A', message: 'You\'re amazing #1 Fineshyt ❤️', effect: 'hearts' },
    mushroom: { letter: 'Y', message: 'Growing into something amazing 🍄' }
};

// Start button click handler
startButton.addEventListener('click', () => {
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        gameStarted = true;
        initializeGame(); // Initialize responsive positions
        gameLoop();
    }, 500);
});

// Get all interactive objects
const objects = document.querySelectorAll('.object');

// Update character position
function updateCharacterPosition() {
    character.style.left = characterPos.x + 'px';
    character.style.bottom = characterPos.y + 'px';
    checkProximityToObjects();
}

// Check if character is near any object
function checkProximityToObjects() {
    if (gameCompleted) return;

    const charRect = character.getBoundingClientRect();
    let closestObject = null;
    let minDistance = Infinity;

    objects.forEach(obj => {
        if (obj.dataset.collected === 'true') return;

        const objRect = obj.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(charRect.left + charRect.width / 2 - (objRect.left + objRect.width / 2), 2) +
            Math.pow(charRect.top + charRect.height / 2 - (objRect.top + objRect.height / 2), 2)
        );

        if (distance < 120 && distance < minDistance) {
            minDistance = distance;
            closestObject = obj;
        }
    });

    // Remove nearby class from all objects
    objects.forEach(obj => obj.classList.remove('nearby'));

    if (closestObject) {
        nearbyObject = closestObject;
        closestObject.classList.add('nearby');

        // Show interact button near the object
        const objRect = closestObject.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();
        interactBtn.style.left = (objRect.left - gameRect.left + objRect.width / 2) + 'px';
        interactBtn.style.top = (objRect.top - gameRect.top - 40) + 'px';
        interactBtn.style.display = 'block';
    } else {
        nearbyObject = null;
        interactBtn.style.display = 'none';
    }
}

// Keyboard controls
const keys = {};

document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;

    keys[e.key] = true;

    // Space bar to interact
    if ((e.key === ' ' || e.code === 'Space') && nearbyObject && !gameCompleted) {
        e.preventDefault();
        interactWithObject(nearbyObject);
    }

    // Space to open final gift
    if ((e.key === ' ' || e.code === 'Space') && gameCompleted) {
        const personalMsg = document.getElementById('personalMessage');
        if (personalMsg && personalMsg.style.display === 'none') {
            e.preventDefault();
            openFinalGift();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game loop for movement
function gameLoop() {
    if (!gameStarted) return;

    if (!gameCompleted) {
        const gameWidth = gameArea.offsetWidth - 80;
        const gameHeight = gameArea.offsetHeight - 80;

        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            characterPos.x = Math.max(0, characterPos.x - speed);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            characterPos.x = Math.min(gameWidth, characterPos.x + speed);
        }
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            characterPos.y = Math.min(gameHeight, characterPos.y + speed);
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            characterPos.y = Math.max(0, characterPos.y - speed);
        }

        updateCharacterPosition();
    }

    requestAnimationFrame(gameLoop);
}

// Interact with an object
function interactWithObject(obj) {
    if (obj.dataset.collected === 'true') return;

    const objClass = Array.from(obj.classList).find(c => c !== 'object' && c !== 'nearby');
    const data = objectData[objClass];

    if (!data) return;

    const letter = data.letter;
    const position = parseInt(obj.dataset.position);

    // Store letter with its position
    collectedLetters.push({ letter: letter, position: position });

    // Show message for 3 seconds
    messageDisplay.textContent = data.message;
    messageDisplay.style.display = 'block';

    // Clear any existing timeout
    if (messageTimeout) {
        clearTimeout(messageTimeout);
    }

    // Hide message after 3 seconds
    messageTimeout = setTimeout(() => {
        messageDisplay.style.display = 'none';
    }, 3000);

    // Mark as collected
    obj.dataset.collected = 'true';
    obj.classList.add('collected');
    obj.classList.remove('nearby');

    // Hide interact button
    interactBtn.style.display = 'none';
    nearbyObject = null;

    // Trigger special effect
    if (data.effect) {
        triggerSpecialEffect(obj, data.effect);
    }

    // Create particles
    createParticles(obj);

    // Launch letter animation
    launchLetter(obj, letter);

    // Update progress
    collectedCountEl.textContent = collectedLetters.length;
    updateCollectedDisplay();

    // Check if all letters collected
    if (collectedLetters.length === totalLetters) {
        setTimeout(() => {
            showEndButton();
        }, 1500);
    }
}

// Trigger special effects for different objects
function triggerSpecialEffect(obj, effect) {
    const sprite = obj.querySelector('.object-sprite');

    switch (effect) {
        case 'fly':
            sprite.style.animation = 'flyAway 2s ease-out forwards';
            break;
        case 'shake':
            sprite.style.animation = 'shake 0.5s ease';
            break;
        case 'candles':
            sprite.textContent = '🎂🕯️';
            setTimeout(() => sprite.textContent = '🎂', 2000);
            break;
        case 'sparkle':
            for (let i = 0; i < 8; i++) {
                setTimeout(() => createSparkle(obj), i * 100);
            }
            break;
        case 'hearts':
            for (let i = 0; i < 6; i++) {
                setTimeout(() => createHeartParticle(obj), i * 150);
            }
            break;
        case 'float':
            sprite.style.animation = 'floatUp 3s ease-out forwards';
            break;
        case 'glow':
            sprite.style.filter = 'brightness(2) drop-shadow(0 0 20px #ffd700)';
            setTimeout(() => sprite.style.filter = '', 1000);
            break;
        case 'twinkle':
            sprite.style.animation = 'twinkle 1s ease infinite';
            setTimeout(() => sprite.style.animation = '', 2000);
            break;
    }
}

// Create sparkle effect
function createSparkle(obj) {
    const objRect = obj.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    const centerX = objRect.left - gameRect.left + objRect.width / 2;
    const centerY = objRect.top - gameRect.top + objRect.height / 2;

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = centerX + (Math.random() - 0.5) * 60 + 'px';
    sparkle.style.top = centerY + (Math.random() - 0.5) * 60 + 'px';

    gameArea.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

// Create heart particle
function createHeartParticle(obj) {
    const objRect = obj.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    const centerX = objRect.left - gameRect.left + objRect.width / 2;
    const centerY = objRect.top - gameRect.top + objRect.height / 2;

    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.textContent = '❤️';
    heart.style.left = centerX + (Math.random() - 0.5) * 40 + 'px';
    heart.style.top = centerY + 'px';

    gameArea.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
}

// Create particle effect
function createParticles(obj) {
    const objRect = obj.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    const centerX = objRect.left - gameRect.left + objRect.width / 2;
    const centerY = objRect.top - gameRect.top + objRect.height / 2;

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const angle = (Math.PI * 2 * i) / 12;
        const distance = 50 + Math.random() * 30;
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;

        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--px', px + 'px');
        particle.style.setProperty('--py', py + 'px');

        gameArea.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

// Launch letter from object to UI
function launchLetter(obj, letter) {
    const objRect = obj.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    const startX = objRect.left - gameRect.left + objRect.width / 2;
    const startY = objRect.top - gameRect.top + objRect.height / 2;

    const letterEl = document.createElement('div');
    letterEl.className = 'flying-letter';
    letterEl.textContent = letter;
    letterEl.style.left = startX + 'px';
    letterEl.style.top = startY + 'px';

    gameArea.appendChild(letterEl);

    // Animate to bottom display
    setTimeout(() => {
        letterEl.style.transform = 'translate(-50%, 300px) scale(1.5)';
        letterEl.style.opacity = '0';
    }, 50);

    setTimeout(() => letterEl.remove(), 1500);
}

// Update collected letters display - single line only
function updateCollectedDisplay() {
    // Create array for "HAPPYBIRTHDAY" (14 positions: 0-13)
    let messageArray = new Array(14).fill('_');

    // Fill in letters at their correct positions
    collectedLetters.forEach(item => {
        if (item.position !== undefined && item.position >= 0 && item.position <= 13) {
            messageArray[item.position] = item.letter;
        }
    });

    // Format as single line - more space between HAPPY and BIRTHDAY
    let display = messageArray.slice(0, 5).join(' ') + '         ' + messageArray.slice(6).join(' ');

    collectedLettersDisplay.textContent = display;
}

// Show end button
function showEndButton() {
    endButton.style.display = 'block';
}

// End button click handler
endButton.addEventListener('click', () => {
    showFinalScene();
});

// Show final scene
function showFinalScene() {
    gameCompleted = true;
    interactBtn.style.display = 'none';

    // Fade out game
    gameContainer.style.transition = 'opacity 1s';
    gameContainer.style.opacity = '0';

    setTimeout(() => {
        gameContainer.style.display = 'none';
        finalScene.style.display = 'flex';
        setTimeout(() => {
            finalScene.style.opacity = '1';
            createFinalConfetti();
        }, 100);
    }, 1000);
}

// Open final gift
function openFinalGift() {
    const giftBox = document.getElementById('finalGift');
    const openedGift = document.getElementById('openedGift');
    const personalMessage = document.getElementById('personalMessage');
    const giftPrompt = document.querySelector('.gift-prompt');

    giftBox.style.animation = 'giftOpen 0.5s ease';
    giftPrompt.style.display = 'none';

    setTimeout(() => {
        giftBox.style.display = 'none'; // Hide the gift emoji
        openedGift.style.display = 'block'; // Show scuba cat gif
        personalMessage.style.display = 'block';
        personalMessage.style.animation = 'fadeInUp 1s ease';
    }, 500);
}

// Create final confetti
function createFinalConfetti() {
    const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#ffd700', '#ff69b4', '#00ff00', '#ff6b6b'];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'final-confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.setProperty('--fall-distance', (400 + Math.random() * 200) + 'px');

            finalScene.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// Click button interaction
interactBtn.addEventListener('click', () => {
    if (nearbyObject && !gameCompleted) {
        interactWithObject(nearbyObject);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (gameStarted && !gameCompleted) {
        // Adjust character position to stay within bounds
        const dims = getGameAreaDimensions();
        characterPos.x = Math.min(characterPos.x, dims.width - 80);
        characterPos.y = Math.min(characterPos.y, dims.height - 80);
        updateCharacterPosition();
    }
});

// Initialize display
updateCollectedDisplay();

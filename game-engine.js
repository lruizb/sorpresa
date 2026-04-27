const CONFIG = {
  // 🎮 FÍSICA
  GRAVITY: 0.6,
  JUMP_POWER: -14,
  MAX_FALL_SPEED: 16,
  ANIMATION_SPEED: 0.15,
  
  // 🧱 NIVEL ÚNICO
  LEVEL_WIDTH: 3500,
  PLATFORM_HEIGHT: 60,
  BASE_SPEED: 0,
  
  // 🎮 MOVIMIENTO DEL JUGADOR
  PLAYER_SPEED: 6,
  PLAYER_MAX_SPEED: 6,
  
  // 🎯 META
  GOAL_DISTANCE: 3200,
  
  // 📐 SPRITE DEL PERSONAJE
  SPRITE_COLS: 8,
  SPRITE_ROWS: 3,
  SPRITE_WIDTH: 256,      // 5120 ÷ 8 ÷ 2.5 = 256px
  SPRITE_HEIGHT: 682,
  
  // 🎭 ANIMACIONES
  ANIMATION_FRAMES: {
    idle: { row: 0, frames: 4, speed: 0.08 },
    run:  { row: 1, frames: 6, speed: 0.15 },
    jump: { row: 2, frames: 3, speed: 0.1 }
  }
};

// ═══════════════════════════════════════════════════════════════
// 📦 CONFIGURACIÓN DE RUTAS DE IMÁGENES
// ═══════════════════════════════════════════════════════════════
// 👇 AQUÍ COLOCAS LAS RUTAS DE TUS IMÁGENES

const IMAGE_PATHS = {
  // 🌳 DECORACIONES
  clouds: {
    cloud1: 'assets/scenery/cloud1.png',      // 👈 RUTA DE NUBE 1
    cloud2: 'assets/scenery/cloud2.png'       // 👈 RUTA DE NUBE 2
  },
  
  // 🏗️ PLATAFORMAS Y SUELO
  platforms: {
    ground: 'assets/scenery/floorbricks.png', // 👈 RUTA DEL PISO/SUELO
    platform: 'assets/scenery/floorbricks.png'   // 👈 RUTA DE PLATAFORMA
  },
  
  // 🔧 ESTRUCTURAS
  structures: {
    pipe: 'assets/scenery/pipe1.png',         // 👈 RUTA DEL PIPE/TUBERÍA
    castle: 'assets/scenery/castle.png',      // 👈 RUTA DEL CASTILLO
    flagMast: 'assets/scenery/flag-mast.png', // 👈 RUTA DEL MÁSTIL
    flag: 'assets/scenery/final-flag.png'     // 👈 RUTA DE LA BANDERA
  },
  
  // 🌲 ELEMENTOS DECORATIVOS
  decorations: {
    bush1: 'assets/scenery/bush1.png',        // 👈 RUTA ARBUSTO 1
    bush2: 'assets/scenery/bush2.png',        // 👈 RUTA ARBUSTO 2
    mountain1: 'assets/scenery/mountain1.png',// 👈 RUTA MONTAÑA 1
    mountain2: 'assets/scenery/mountain2.png' // 👈 RUTA MONTAÑA 2
  },
  
  // 🧱 BLOQUES
  blocks: {
    brick: 'assets/blocks/customBlock.png',   // 👈 RUTA BLOQUE LADRILLO
    mystery: 'assets/blocks/misteryBlock.png' // 👈 RUTA BLOQUE MISTERIO
  },
  
  // 🪙 COLECCIONABLES
  collectibles: {
    coin: 'assets/collectibles/coin.png',
    superMushroom: 'assets/collectibles/super-mushroom.png',
    fireFlower: 'assets/collectibles/fire-flower.png'
  },
  
  // 👾 ENEMIGOS
  entities: {
    goomba: 'assets/entities/goomba.png',
    koopa: 'assets/entities/koopa.png',
    fireball: 'assets/entities/fireball.png'
  }
};

// ═══════════════════════════════════════════════════════════════
// 🖼️ SISTEMA DE CARGA DE IMÁGENES
// ═══════════════════════════════════════════════════════════════

let loadedAssets = {};

async function loadAllAssets() {
  console.log('📥 Cargando todos los assets...');
  const loadPromises = [];
  
  for (const category in IMAGE_PATHS) {
    loadedAssets[category] = {};
    
    for (const assetName in IMAGE_PATHS[category]) {
      const path = IMAGE_PATHS[category][assetName];
      
      const promise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          loadedAssets[category][assetName] = img;
          console.log(`✅ Cargado: ${assetName}`);
          resolve(true);
        };
        
        img.onerror = () => {
          console.warn(`⚠️ No se pudo cargar: ${path}`);
          loadedAssets[category][assetName] = null;
          resolve(false);
        };
        
        img.src = path;
      });
      
      loadPromises.push(promise);
    }
  }
  
  await Promise.all(loadPromises);
  console.log('✅ Assets cargados completamente');
  return true;
}

function getAsset(category, assetName) {
  const asset = loadedAssets[category]?.[assetName];
  return (asset && asset.complete) ? asset : null;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SISTEMA DE COLISIONES
// ═══════════════════════════════════════════════════════════════

function checkCollisionSides(obj1, obj2) {
  const overlapping = !(
    obj1.x + obj1.width <= obj2.x ||
    obj1.x >= obj2.x + obj2.width ||
    obj1.y + obj1.height <= obj2.y ||
    obj1.y >= obj2.y + obj2.height
  );

  if (!overlapping) return null;

  const top = (obj1.y + obj1.height) - obj2.y;
  const bottom = (obj2.y + obj2.height) - obj1.y;
  const left = (obj1.x + obj1.width) - obj2.x;
  const right = (obj2.x + obj2.width) - obj1.x;

  const min = Math.min(top, bottom, left, right);

  let side = null;
  if (min === top) side = 'top';
  else if (min === bottom) side = 'bottom';
  else if (min === left) side = 'left';
  else if (min === right) side = 'right';

  return {
    colliding: true,
    side: side,
    penetration: min
  };
}

function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// ═══════════════════════════════════════════════════════════════
// 🎮 VARIABLES GLOBALES
// ═══════════════════════════════════════════════════════════════

let gameRunning = false;
let gameStarted = false;
let gameEnded = false;
let gameTime = 0;
let score = 0;
let coinsCollected = 0;
let distanceTraveled = 0;
let playerState = 0;

let canvas;
let ctx;
let groundY = 0;

let joystick = {
  active: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  direction: 0,
  radius: 50,
  deadzone: 20,
  centerX: 0,
  centerY: 0
};

let jumpButton = {
  x: 0,
  y: 0,
  radius: 40,
  pressed: false
};

let player = {
  x: 50,
  y: 0,
  width: 32,
  height: 44,
  velocityY: 0,
  velocityX: 0,
  inputVelocityX: 0,
  
  state: 'idle',
  frameX: 0,
  frameY: 0,
  animationIndex: 0,
  
   spriteSheets: {           // 👈 CAMBIAR: de spriteSheet a spriteSheets (con "s")
    idle: null,
    run: null,
    jump: null
  },
  spriteLoaded: false,
  
  isJumping: false,
  isGrounded: true,
  gravity: CONFIG.GRAVITY,
  jumpPower: CONFIG.JUMP_POWER,
  
  frameWidth: CONFIG.SPRITE_WIDTH,
  frameHeight: CONFIG.SPRITE_HEIGHT,
  facingRight: true,
  
  spriteOffsetX: 4,
  spriteOffsetY: 3
};

let platforms = [];
let coins = [];
let particles = [];
let enemies = [];
let structures = [];
let powerups = [];
let specialBlocks = [];
let fireballsPlayer = [];
let cameraX = 0;
let levelGenerated = false;
let decorations = [];

let goal = {
  x: CONFIG.GOAL_DISTANCE,
  y: 0,
  width: 120,
  height: 120,
  active: false,
  entered: false,
  image: null
};

// ═══════════════════════════════════════════════════════════════
// 🏗️ CLASES DE ESTRUCTURAS
// ═══════════════════════════════════════════════════════════════

class Pipe {
  constructor(x, y, width = 60, height = 80) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = 'pipe';
    this.image = getAsset('structures', 'pipe');
    this.solid = true;
  }

  update() {}

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    if (screenX > -this.width && screenX < canvas.width) {
      if (this.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(screenX, this.y, this.width, this.height);
      }
    }
  }
}

class BrickBlock {
  constructor(x, y, width = 40, height = 32) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = 'brick';
    this.breakable = true;
    this.health = 1;
    this.image = getAsset('blocks', 'brick');
    this.solid = true;
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    if (screenX > -this.width && screenX < canvas.width) {
      if (this.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX, this.y, this.width, this.height);
      }
    }
  }

  break() {
    this.health--;
    return this.health <= 0;
  }
}

class MysteryBlock {
  constructor(x, y, reward = 'coin') {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.type = 'mystery';
    this.reward = reward;
    this.isOpen = false;
    this.animationIndex = 0;
    this.image = getAsset('blocks', 'mystery');
    this.solid = true;
  }

  update() {
    if (!this.isOpen) {
      this.animationIndex = (this.animationIndex + 0.12) % 2;
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    if (screenX > -this.width && screenX < canvas.width) {
      if (this.isOpen) {
        ctx.fillStyle = '#999999';
        ctx.fillRect(screenX, this.y, this.width, this.height);
      } else {
        if (this.image) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
        } else {
          const color = Math.floor(this.animationIndex) === 0 ? '#FFD700' : '#FFA500';
          ctx.fillStyle = color;
          ctx.fillRect(screenX, this.y, this.width, this.height);
        }
      }
    }
  }

  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      return this.reward;
    }
    return null;
  }
}

class PowerUp {
  constructor(x, y, type = 'mushroom') {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.type = type;
    this.velocityY = -5;
    this.velocityX = 0;
    this.direction = 1;
    this.collected = false;
    this.moveCounter = 0;
    this.moveSpeed = 0.02;
    
    if (type === 'mushroom') {
      this.image = getAsset('collectibles', 'superMushroom');
    } else if (type === 'fireflower') {
      this.image = getAsset('collectibles', 'fireFlower');
    }
  }

  update() {
    this.moveCounter += this.moveSpeed;
    this.x += Math.sin(this.moveCounter) * 0.5;
    
    this.velocityY += 0.3;
    this.y += this.velocityY;
    
    if (this.y >= groundY - 50) {
      this.y = groundY - 50;
      this.velocityY = 0;
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    if (screenX > -this.width && screenX < canvas.width) {
      if (this.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
      }
    }
  }
}

class Goomba {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.type = 'goomba';
    this.direction = -1;
    this.speed = 1.5;
    this.isAlive = true;
    this.velocityY = 0;
    this.gravity = 0.4;
    this.image = getAsset('entities', 'goomba');
    this.solid = true;
  }

  update() {
    this.x += this.direction * this.speed;
    this.velocityY += this.gravity;
    this.y += this.velocityY;
    
    platforms.forEach(platform => {
      if (this.y + this.height >= platform.y && 
          this.y + this.height <= platform.y + 20 &&
          this.x + this.width > platform.x &&
          this.x < platform.x + platform.width) {
        this.velocityY = 0;
        this.y = platform.y - this.height;
      }
    });
    
    if (this.x < cameraX - 100 || this.x > cameraX + canvas.width + 100) {
      this.isAlive = false;
    }
  }

  draw(ctx, cameraX) {
    if (this.isAlive) {
      const screenX = this.x - cameraX;
      if (this.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(screenX + this.width / 2, this.y + this.height * 0.7, 
                   this.width / 2, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

class Koopa {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 48;
    this.type = 'koopa';
    this.direction = -1;
    this.speed = 1.2;
    this.isAlive = true;
    this.velocityY = 0;
    this.gravity = 0.4;
    this.image = getAsset('entities', 'koopa');
    this.solid = true;
  }

  update() {
    this.x += this.direction * this.speed;
    this.velocityY += this.gravity;
    this.y += this.velocityY;
    
    platforms.forEach(platform => {
      if (this.y + this.height >= platform.y && 
          this.y + this.height <= platform.y + 20 &&
          this.x + this.width > platform.x &&
          this.x < platform.x + platform.width) {
        this.velocityY = 0;
        this.y = platform.y - this.height;
      }
    });
    
    if (this.x < cameraX - 100 || this.x > cameraX + canvas.width + 100) {
      this.isAlive = false;
    }
  }

  draw(ctx, cameraX) {
    if (this.isAlive) {
      const screenX = this.x - cameraX;
      if (this.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = '#00AA00';
        ctx.beginPath();
        ctx.ellipse(screenX + this.width / 2, this.y + this.height / 3, 
                   this.width / 2.2, this.height / 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

class Fireball {
  constructor(x, y, direction = 1) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.direction = direction;
    this.speed = 6;
    this.velocityY = 0;
    this.gravity = 0.3;
    this.life = 300;
    this.active = true;
    this.image = getAsset('entities', 'fireball');
  }

  update() {
    this.x += this.direction * this.speed;
    this.velocityY += this.gravity;
    this.y += this.velocityY;
    this.life--;
    
    if (this.life <= 0) {
      this.active = false;
    }
    
    enemies.forEach((enemy, idx) => {
      if (checkCollision(this, enemy) && enemy.isAlive) {
        enemy.isAlive = false;
        this.active = false;
        score += 100;
        createParticle(enemy.x, enemy.y, '💥', 2);
      }
    });
    
    specialBlocks.forEach((block, idx) => {
      if (checkCollision(this, block) && block.breakable) {
        block.break();
        this.active = false;
        createParticle(block.x, block.y, '💥', 1.5);
      }
    });
  }

  draw(ctx, cameraX) {
    if (this.active) {
      const screenX = this.x - cameraX;
      if (this.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════
// 🎮 FUNCIONES PRINCIPALES
// ══════════════════════════════════════════════════════════════

function loadSpriteSheet() {
  const spriteData = {
    idle: 'img/princes_idle.png',    // 👈 Tu sprite de reposo
    run: 'img/princes_run.png',      // 👈 Tu sprite corriendo
    jump: 'img/princes_jump.png'     // 👈 Tu sprite saltando
  };
  
  let loadedCount = 0;
  const totalSprites = Object.keys(spriteData).length;
  
  for (const state in spriteData) {
    player.spriteSheets[state] = new Image();
    player.spriteSheets[state].crossOrigin = 'anonymous';
    
    player.spriteSheets[state].onload = () => {
      loadedCount++;
      console.log(`✅ Sprite ${state} cargado`);
      
      if (loadedCount === totalSprites) {
        player.spriteLoaded = true;
        console.log('✅ Todos los sprites cargados');
      }
    };
    
    player.spriteSheets[state].onerror = () => {
      console.warn(`⚠️ Sprite ${state} no encontrado: ${spriteData[state]}`);
      loadedCount++;
      
      if (loadedCount === totalSprites) {
        player.spriteLoaded = false;
      }
    };
    
    player.spriteSheets[state].src = spriteData[state];
  }
}

function initGameEngine(canvasElement) {
  if (!canvasElement) {
    console.error('❌ Canvas no encontrado');
    return false;
  }
  
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  
  groundY = canvas.height - 100;
  
  joystick.centerX = canvas.width * 0.15;
  joystick.centerY = canvas.height * 0.85;
  jumpButton.x = canvas.width * 0.85;
  jumpButton.y = canvas.height * 0.85;

  loadSpriteSheet();
  setupMobileControls();
  window.addEventListener("resize", redimensionarCanvas);

  console.log('✅ Motor inicializado');
  return true;
}

function setupMobileControls() {
    canvas.addEventListener('touchstart', (e) => {
    const touches = e.touches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const distToJoystick = Math.sqrt(
        Math.pow(x - joystick.centerX, 2) + Math.pow(y - joystick.centerY, 2)
      );
      
      if (distToJoystick < joystick.radius + 30) {
        joystick.active = true;
        joystick.startX = x;
        joystick.startY = y;
        joystick.currentX = x;
        joystick.currentY = y;
        
        if (!gameStarted) {
          gameStarted = true;
          gameRunning = true;
        }
        updateJoystickInput();
      }
      
      const distToJumpButton = Math.sqrt(
        Math.pow(x - jumpButton.x, 2) + Math.pow(y - jumpButton.y, 2)
      );
      
      if (distToJumpButton < jumpButton.radius + 15) {  // 👈 AUMENTAR área táctil
        jumpButton.pressed = true;
        if (gameRunning) jump();
        if (!gameStarted) {
          gameStarted = true;
          gameRunning = true;
        }
      }
    }
    e.preventDefault();
  }, { passive: false });
  // 👇 AGREGAR ESTO - Para que X funcione también con mouseup
  canvas.addEventListener('mouseup', (e) => {
    jumpButton.pressed = false;
  });
  canvas.addEventListener('touchmove', (e) => {
    if (!joystick.active) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    joystick.currentX = x;
    joystick.currentY = y;
    updateJoystickInput();
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => {
    joystick.active = false;
    joystick.direction = 0;
    player.inputVelocityX = 0;
    jumpButton.pressed = false;
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const distToJoystick = Math.sqrt(
      Math.pow(x - joystick.centerX, 2) + Math.pow(y - joystick.centerY, 2)
    );
    
    if (distToJoystick < joystick.radius + 30) {
      joystick.active = true;
      joystick.startX = x;
      joystick.startY = y;
      joystick.currentX = x;
      joystick.currentY = y;
      
      if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
      }
      updateJoystickInput();
    }
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!joystick.active) return;
    
    const rect = canvas.getBoundingClientRect();
    joystick.currentX = e.clientX - rect.left;
    joystick.currentY = e.clientY - rect.top;
    updateJoystickInput();
  });
  
  canvas.addEventListener('mouseup', (e) => {
    joystick.active = false;
    joystick.direction = 0;
    player.inputVelocityX = 0;
  });
  
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !e.repeat) {
      e.preventDefault();
      if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
      }
      if (gameRunning) jump();
    }
    
    if (e.code === 'KeyQ' && playerState === 2 && gameRunning) {
      fireballShoot();
    }
  });
}

function updateJoystickInput() {
  const dx = joystick.currentX - joystick.startX;
  const dy = joystick.currentY - joystick.startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < joystick.deadzone) {
    player.inputVelocityX = 0;
    joystick.direction = 0;
    return;
  }
  
  const angle = Math.atan2(dy, dx);
  const degrees = (angle * 180) / Math.PI;
  
  if (degrees > -67.5 && degrees < 67.5) {
    joystick.direction = 1;
    player.inputVelocityX = 4;   // Movimiento horizontal más lento en salto
player.inputVelocityX = 6;   // Normal (actual)
player.inputVelocityX = 8;   // Movimiento horizontal más rápido en salto
player.inputVelocityX = 10;  // Muy rápido en salto
  }
  else if (degrees > 112.5 || degrees < -112.5) {
    joystick.direction = -1;
    player.inputVelocityX = -CONFIG.PLAYER_MAX_SPEED;  // ← Aumenta de 0.5 a 1
  }
  else {
    joystick.direction = 0;
    player.inputVelocityX = 0;
  }
}

function generateDecorations() {
  decorations = [];
  
  let mountainX = 500;
  while (mountainX < CONFIG.GOAL_DISTANCE - 200) {
    const mountainType = Math.random() < 0.5 ? 'mountain1' : 'mountain2';
    const mountainImg = getAsset('decorations', mountainType);
    
    decorations.push({
      x: mountainX,
      y: groundY - 80,
      width: 150,
      height: 80,
      type: 'mountain',
      image: mountainImg
    });
    
    mountainX += 400;
  }
  
  let bushX = 300;
  while (bushX < CONFIG.GOAL_DISTANCE - 200) {
    const bushType = Math.random() < 0.5 ? 'bush1' : 'bush2';
    const bushImg = getAsset('decorations', bushType);
    
    decorations.push({
      x: bushX,
      y: groundY - 50,
      width: 80,
      height: 60,
      type: 'bush',
      image: bushImg
    });
    
    bushX += 300;
  }
  
  console.log(`✅ ${decorations.length} decoraciones generadas`);
}

function generateLevel() {
  if (levelGenerated) return;
  
  platforms = [];
  coins = [];
  enemies = [];
  structures = [];
  powerups = [];
  specialBlocks = [];
  decorations = [];
  
  // 🏗️ PLATAFORMA BASE
  platforms.push({
    x: 0,
    y: groundY,
    width: CONFIG.LEVEL_WIDTH,
    height: CONFIG.PLATFORM_HEIGHT,
    type: 'ground',
    isGround: true,
    image: getAsset('platforms', 'ground'),
    solid: true,
    invisible: false
  });
  
  generateDecorations();
  
  let currentX = 400;
  const platformSpacing = 280;
  
  // ⭐ GENERAR TODO ANTES DEL CASTILLO FINAL (CONFIG.GOAL_DISTANCE - 300)
  const levelEndX = CONFIG.GOAL_DISTANCE - 300;
  
  let structureCount = 0;
  
  while (currentX < levelEndX) {
    const rand = Math.random();
    
    // 🔧 PIPES - Generado primero para evitar bloques encima
    if (rand < 0.2) {
      structures.push(new Pipe(
        currentX + 80,
        groundY - 80,
        60,
        80
      ));
    }
    
    // 🏢 SOLO 2-3 ESTRUCTURAS FLOTANTES
    if (structureCount < 3 && rand > 0.2 && rand < 0.5) {
      const numBlocks = 3 + Math.floor(Math.random() * 3); // 3-5 bloques
      const platformY = groundY - 160;
      
      // Bloques pegados horizontalmente
      for (let i = 0; i < numBlocks; i++) {
        specialBlocks.push(new BrickBlock(
          currentX + (i * 40),
          platformY,
          40,
          32
        ));
      }
      
      // Mystery blocks encima (60% de probabilidad)
      if (Math.random() < 0.6) {
        specialBlocks.push(new MysteryBlock(currentX, platformY - 100, 'coin'));
        specialBlocks.push(new MysteryBlock(currentX + 40, platformY - 100, 'mushroom'));
      }
      
      structureCount++;
    }
    
    // 🪨 2-3 BLOQUES FLOTANTES AISLADOS
    if (rand > 0.5 && rand < 0.75) {
      const numFloatingBlocks = 2 + Math.floor(Math.random() * 2); // 2-3 bloques
      const floatingY = groundY - 120 - Math.random() * 40;
      
      for (let i = 0; i < numFloatingBlocks; i++) {
        specialBlocks.push(new BrickBlock(
          currentX + (i * 50),
          floatingY,
          40,
          32
        ));
      }
    }
    
    // 👾 ENEMIGOS
    if (rand > 0.6) {
      if (Math.random() < 0.5) {
        enemies.push(new Goomba(currentX + 100, groundY - 120));
      } else {
        enemies.push(new Koopa(currentX + 100, groundY - 140));
      }
    }
    
    // 🪙 MONEDAS
    if (Math.random() < 0.4) {
      coins.push({
        x: currentX + 60,
        y: groundY - 100,
        width: 40,
        height: 40,
        collected: false,
        image: getAsset('collectibles', 'coin')
      });
    }
    
    currentX += platformSpacing;
  }
  
  // 🏰 CASTILLO FINAL - AL FINAL DEL NIVEL
  goal.x = CONFIG.GOAL_DISTANCE - 150;
  goal.y = groundY - 120;
  goal.width = 150;
  goal.height = 150;
  goal.active = true;
  goal.image = getAsset('structures', 'castle');
  
  // 🚩 BANDERA JUNTO AL CASTILLO
  structures.push({
    x: CONFIG.GOAL_DISTANCE - 250,
    y: groundY - 100,
    width: 60,
    height: 100,
    type: 'flagMast',
    image: getAsset('structures', 'flagMast'),
    solid: false,
    draw: function(ctx, cameraX) {
      const screenX = this.x - cameraX;
      if (screenX > -this.width && screenX < canvas.width) {
        if (this.image) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
        } else {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX, this.y, 10, this.height);
        }
      }
    },
    update: function() {}
  });
  
  structures.push({
    x: CONFIG.GOAL_DISTANCE - 240,
    y: groundY - 90,
    width: 50,
    height: 40,
    type: 'flag',
    image: getAsset('structures', 'flag'),
    solid: false,
    draw: function(ctx, cameraX) {
      const screenX = this.x - cameraX;
      if (screenX > -this.width && screenX < canvas.width) {
        if (this.image) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(this.image, screenX, this.y, this.width, this.height);
        } else {
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(screenX, this.y, this.width, this.height);
        }
      }
    },
    update: function() {}
  });
  
  levelGenerated = true;
  console.log('✅ Nivel generado');
}

function startGameLevel() {
  redimensionarCanvas();
  gameStarted = false;
  gameRunning = false;
  gameEnded = false;
  gameTime = 0;
  score = 0;
  coinsCollected = 0;
  distanceTraveled = 0;
  levelGenerated = false;
  cameraX = 0;
  playerState = 0;
  
  groundY = canvas.height - 100;
  
  player.x = 100;
  player.y = groundY - player.height;
  player.velocityY = 0;
  player.velocityX = 0;
  player.inputVelocityX = 0;
  player.state = 'idle';
  player.isJumping = false;
  player.isGrounded = true;
  player.animationIndex = 0;
  
  joystick.active = false;
  joystick.direction = 0;
  jumpButton.pressed = false;
  
  generateLevel();
  gameLoop();
}

function gameLoop() {
  if (!gameStarted && !gameRunning && !gameEnded) {
    drawBackground();
    drawPlayer();
    drawMobileControls();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¡Mueve el joystick para comenzar!', canvas.width / 2, canvas.height / 2);
    
    requestAnimationFrame(gameLoop);
    return;
  }
  
  if (!gameRunning) return;
  
  updateGameState();
  updatePlayer();
  updateEnemies();
  updatePowerups();
  updateParticles();
  updateFireballs();
  updateStructures();
  updateCamera();

  drawBackground();
  drawDecorations();
  drawPlatforms();
  drawStructures();
  drawSpecialBlocks();
  drawCoins();
  drawEnemies();
  drawPowerups();
  drawFireballs();
  drawGoal();
  drawPlayer();
  drawParticles();
  drawUI();
  drawMobileControls();

  requestAnimationFrame(gameLoop);
}

function updateGameState() {
  gameTime++;
  
  if (player.inputVelocityX > 0) {
    distanceTraveled = player.x - 100;
  }
}

function updatePlayer() {
  player.velocityX = player.inputVelocityX;
  player.velocityY += player.gravity;
  
  if (player.velocityY > CONFIG.MAX_FALL_SPEED) {
    player.velocityY = CONFIG.MAX_FALL_SPEED;
  }
  
  player.y += player.velocityY;
  player.x += player.velocityX;
  
  if (player.y > canvas.height + 100) {
    gameOverMiniGame();
    return;
  }
  
  player.isGrounded = false;
  
  if (player.velocityY >= 0) {
    platforms.forEach(platform => {
      const collision = checkCollisionSides(player, platform);
      
      if (collision && collision.side === 'top') {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.isGrounded = true;
        player.isJumping = false;
      }
    });
  }
  
  if (Math.abs(player.velocityX) > 0) {
    platforms.forEach(platform => {
      const collision = checkCollisionSides(player, platform);
      
      if (collision && collision.side === 'left') {
        player.x = platform.x - player.width;
        player.velocityX = 0;
      } else if (collision && collision.side === 'right') {
        player.x = platform.x + platform.width;
        player.velocityX = 0;
      }
    });
  }
  
  structures.forEach(struct => {
    if (struct instanceof Pipe && struct.solid) {
      if (player.velocityY >= 0) {
        const collision = checkCollisionSides(player, struct);
        if (collision && collision.side === 'top') {
          player.y = struct.y - player.height;
          player.velocityY = 0;
          player.isGrounded = true;
          player.isJumping = false;
        }
      }
      
      if (Math.abs(player.velocityX) > 0) {
        const collision = checkCollisionSides(player, struct);
        if (collision && collision.side === 'left') {
          player.x = struct.x - player.width;
          player.velocityX = 0;
        } else if (collision && collision.side === 'right') {
          player.x = struct.x + struct.width;
          player.velocityX = 0;
        }
      }
    }
  });
  
  specialBlocks.forEach(block => {
    if (block.solid) {
      if (player.velocityY >= 0) {
        const collision = checkCollisionSides(player, block);
        if (collision && collision.side === 'top') {
          player.y = block.y - player.height;
          player.velocityY = 0;
          player.isGrounded = true;
          player.isJumping = false;
        }
      }
      
      if (Math.abs(player.velocityX) > 0) {
        const collision = checkCollisionSides(player, block);
        if (collision && collision.side === 'left') {
          player.x = block.x - player.width;
          player.velocityX = 0;
        } else if (collision && collision.side === 'right') {
          player.x = block.x + block.width;
          player.velocityX = 0;
        }
      }
    }
  });
  
  coins.forEach((coin) => {
    if (!coin.collected && checkCollision(player, coin)) {
      coin.collected = true;
      coinsCollected++;
      score += 10;
      createParticle(coin.x, coin.y, '🪙', 1.5);
      playSound('coin');
    }
  });
  
  powerups.forEach((powerup, idx) => {
    if (!powerup.collected && checkCollision(player, powerup)) {
      powerup.collected = true;
      consumePowerUp(powerup);
      powerups.splice(idx, 1);
    }
  });
  
  specialBlocks.forEach(block => {
    if (checkCollision(player, block) && block instanceof MysteryBlock) {
      if (player.y + player.height <= block.y + 20) {
        const reward = block.open();
        if (reward) {
          score += 100;
          if (reward === 'coin') {
            coinsCollected++;
            createParticle(block.x, block.y, '🪙', 2);
          } else {
            powerups.push(new PowerUp(block.x, block.y, reward));
            createParticle(block.x, block.y, '✨', 2);
          }
        }
      }
    }
  });
  
  if (goal.active && checkCollision(player, goal)) {
    winMiniGame();
    return;
  }
  
  enemies.forEach((enemy, idx) => {
    if (checkCollision(player, enemy) && enemy.isAlive) {
      if (player.y + player.height - 15 <= enemy.y) {
        enemy.isAlive = false;
        player.velocityY = player.jumpPower / 1.5;
        score += 100;
        createParticle(enemy.x, enemy.y, '💥', 2);
        playSound('coin');
      } else {
        gameOverMiniGame();
      }
    }
  });
  
  updatePlayerAnimation();
}

function updateEnemies() {
  enemies = enemies.filter(enemy => {
    enemy.update();
    return enemy.isAlive;
  });
}

function updatePowerups() {
  powerups.forEach(powerup => {
    if (!powerup.collected) {
      powerup.update();
    }
  });
}

function updateFireballs() {
  fireballsPlayer = fireballsPlayer.filter(fireball => {
    fireball.update();
    return fireball.active;
  });
}

function updateStructures() {
  structures.forEach(struct => {
    if (struct.update) {
      struct.update();
    }
  });
  
  specialBlocks.forEach(block => {
    if (block.update) {
      block.update();
    }
  });
}

function updateCamera() {
  const targetCameraX = player.x - canvas.width * 0.25;
  cameraX += (targetCameraX - cameraX) * 0.08;
  cameraX = Math.max(0, Math.min(cameraX, CONFIG.LEVEL_WIDTH - canvas.width));
}

function updateParticles() {
  particles = particles.filter(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.2;
    particle.life -= 1;
    
    return particle.life > 0;
  });
}

function updatePlayerAnimation() {
  if (player.inputVelocityX > 0) {
    player.facingRight = true;
  } else if (player.inputVelocityX < 0) {
    player.facingRight = false;
  }

  if (player.velocityY !== 0) {
    player.state = 'jump';
  } else if (Math.abs(player.velocityX) > 0.5) {
    player.state = 'run';
  } else {
    player.state = 'idle';
  }
  
  const animConfig = CONFIG.ANIMATION_FRAMES[player.state];
  player.animationIndex += animConfig.speed;
  
  if (player.animationIndex >= animConfig.frames) {
    player.animationIndex = 0;
  }
  
  player.frameX = 0;  // Siempre el primer frame
  player.frameY = 0;  // Siempre la primera fila
}

function consumePowerUp(powerup) {
  if (powerup.type === 'mushroom') {
    if (playerState === 0) {
      playerState = 1;
      console.log('🍄 ¡Crecido!');
      score += 1000;
    }
  } else if (powerup.type === 'fireflower') {
    playerState = 2;
    console.log('🔥 ¡Poder de fuego!');
    score += 1000;
  }
  createParticle(powerup.x, powerup.y, '✨', 2);
  playSound('coin');
}

function fireballShoot() {
  if (playerState === 2) {
    const fireball = new Fireball(
      player.x + (player.facingRight ? 20 : -20),
      player.y + 20,
      player.facingRight ? 1 : -1
    );
    fireballsPlayer.push(fireball);
    playSound('fireball');
  }
}

function jump() {
  if (player.isGrounded && !player.isJumping && gameRunning) {
    player.velocityY = player.jumpPower;
    player.isJumping = true;
    player.isGrounded = false;
    playSound('jump');
  }
}

function createParticle(x, y, emoji, size) {
  particles.push({
    x: x,
    y: y,
    emoji: emoji,
    size: size || 1,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4 - 2,
    life: 30,
    maxLife: 30
  });
}

function playSound(type) {
  try {
    const soundElement = document.getElementById(`${type}-sound`);
    if (soundElement) {
      soundElement.currentTime = 0;
      soundElement.play().catch(e => {
        console.log(`⚠️ No se pudo reproducir: ${type}`);
      });
    }
  } catch (e) {
    console.log('⚠️ Error en playSound');
  }
}

// ═══════════════════════════════════════════════════════════════
// 🎨 FUNCIONES DE RENDERIZADO
// ═══════════════════════════════════════════════════════════════

function drawBackground() {
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ☁️ NUBES CON PARALLAX
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 5; i++) {
    const cloudX = ((i * 400 - cameraX * 0.3) % (canvas.width + 200)) - 100;
    
    // 🌥️ DIBUJAR NUBE CON IMAGEN O FALLBACK
    const cloudImg = i % 2 === 0 ? getAsset('clouds', 'cloud1') : getAsset('clouds', 'cloud2');
    
    if (cloudImg) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(cloudImg, cloudX, 60 + i * 30, 80, 40);
    } else {
      // Fallback: nube dibujada
      drawCloud(cloudX, 60 + i * 30, 40);
    }
  }
  
  // 🟢 PISO/SUELO CON IMAGEN
  const groundImg = getAsset('platforms', 'ground');
  if (groundImg) {
    ctx.imageSmoothingEnabled = false;
    // Repetir la imagen del suelo
    for (let x = -cameraX; x < canvas.width; x += groundImg.width) {
      ctx.drawImage(groundImg, x, groundY, groundImg.width, 100);
    }
  } else {
    // Fallback: color verde
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, groundY, canvas.width, 100);
  }
}

function drawCloud(x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.9, 0, Math.PI * 2);
  ctx.arc(x + size * 1.6, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawDecorations() {
  decorations.forEach(decoration => {
    const screenX = decoration.x - cameraX;
    
    if (screenX > -decoration.width && screenX < canvas.width) {
      if (decoration.image) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          decoration.image,
          screenX,
          decoration.y,
          decoration.width,
          decoration.height
        );
      } else {
        ctx.fillStyle = decoration.type === 'mountain' ? '#8B7355' : '#228B22';
        ctx.fillRect(screenX, decoration.y, decoration.width, decoration.height);
      }
    }
  });
}

function drawPlatforms() {
  platforms.forEach(platform => {
    if (platform.invisible) return;
    
    const screenX = platform.x - cameraX;
    
    if (screenX > -platform.width && screenX < canvas.width) {
      if (platform.image) {
        ctx.imageSmoothingEnabled = false;
        // Repetir imagen de plataforma si es necesario
        for (let x = 0; x < platform.width; x += platform.image.width) {
          ctx.drawImage(
            platform.image,
            screenX + x,
            platform.y,
            Math.min(platform.image.width, platform.width - x),
            platform.height
          );
        }
      } else {
        ctx.fillStyle = '#666666';
        ctx.fillRect(screenX, platform.y, platform.width, platform.height);
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, platform.y, platform.width, platform.height);
      }
    }
  });
}

function drawStructures() {
  structures.forEach(struct => {
    if (struct.draw) {
      struct.draw(ctx, cameraX);
    }
  });
}

function drawSpecialBlocks() {
  specialBlocks.forEach(block => {
    block.draw(ctx, cameraX);
  });
}

function drawCoins() {
  coins.forEach(coin => {
    if (!coin.collected) {
      const screenX = coin.x - cameraX;
      
      if (screenX > -coin.width && screenX < canvas.width) {
        if (coin.image) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(coin.image, screenX, coin.y, coin.width, coin.height);
        } else {
          ctx.save();
          ctx.translate(screenX + coin.width / 2, coin.y + coin.height / 2);
          ctx.rotate((gameTime * 0.02) % (Math.PI * 2));
          
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      }
    }
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    enemy.draw(ctx, cameraX);
  });
}

function drawPowerups() {
  powerups.forEach(powerup => {
    powerup.draw(ctx, cameraX);
  });
}

function drawFireballs() {
  fireballsPlayer.forEach(fireball => {
    fireball.draw(ctx, cameraX);
  });
}

function drawGoal() {
  if (!goal.active) return;
  
  const screenX = goal.x - cameraX;
  
  if (screenX > -goal.width && screenX < canvas.width) {
    if (goal.image) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(goal.image, screenX, goal.y, goal.width, goal.height);
    } else {
      const x = screenX;
      const y = goal.y;
      
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x, y + 20, goal.width, goal.height - 20);
      
      ctx.fillRect(x + 10, y - 30, 25, 50);
      ctx.fillRect(x + goal.width - 35, y - 30, 25, 50);
      
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x + goal.width / 2, y);
      ctx.lineTo(x + goal.width, y + 20);
      ctx.fill();
    }
  }
}

function drawPlayer() {
  const screenX = player.x - cameraX;
  
  const currentSpriteSheet = player.spriteSheets[player.state];
  
  if (player.spriteLoaded && currentSpriteSheet && currentSpriteSheet.complete) {
    // 👇 MOSTRAR LA IMAGEN COMPLETA (no recortarla)
    const drawX = screenX;
    const drawY = player.y - 10;
    const drawWidth = 64;      // Ancho visual del personaje
    const drawHeight = 64;     // Alto visual del personaje
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    if (!player.facingRight) {
      ctx.scale(-1, 1);
      ctx.drawImage(
        currentSpriteSheet,
        0, 0, currentSpriteSheet.width, currentSpriteSheet.height,  // 👈 Imagen completa
        -drawX - drawWidth, drawY,
        drawWidth, drawHeight
      );
    } else {
      ctx.drawImage(
        currentSpriteSheet,
        0, 0, currentSpriteSheet.width, currentSpriteSheet.height,  // 👈 Imagen completa
        drawX, drawY, drawWidth, drawHeight
      );
    }
    
    ctx.restore();
  } else {
    // Fallback: dibuja si no carga
    const size = 30;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(screenX + size / 2 - 10, player.y - 10);
    ctx.lineTo(screenX + size / 2 - 5, player.y - 20);
    ctx.lineTo(screenX + size / 2, player.y - 15);
    ctx.lineTo(screenX + size / 2 + 5, player.y - 20);
    ctx.lineTo(screenX + size / 2 + 10, player.y - 10);
    ctx.fill();
    
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.arc(screenX + size / 2, player.y - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + size / 2 - 5, player.y - 8, 2, 2);
    ctx.fillRect(screenX + size / 2 + 3, player.y - 8, 2, 2);
    
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(screenX + size / 2 - 8, player.y, 16, 20);
    
    ctx.fillStyle = '#FDBCB4';
    ctx.fillRect(screenX + size / 2 - 12, player.y + 2, 4, 10);
    ctx.fillRect(screenX + size / 2 + 8, player.y + 2, 4, 10);
    
    ctx.fillStyle = '#FDBCB4';
    ctx.fillRect(screenX + size / 2 - 6, player.y + 20, 4, 10);
    ctx.fillRect(screenX + size / 2 + 2, player.y + 20, 4, 10);
  }
  
  if (playerState > 0) {
    const icon = playerState === 1 ? '🍄' : '🔥';
    ctx.font = '24px Arial';
    ctx.fillText(icon, screenX + player.width + 10, player.y - 20);
  }
}

function drawParticles() {
  particles.forEach(particle => {
    ctx.save();
    ctx.globalAlpha = particle.life / particle.maxLife;
    ctx.font = `${particle.size * 16}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(particle.emoji, particle.x - cameraX, particle.y);
    ctx.restore();
  });
}

function drawMobileControls() {
  const baseX = joystick.centerX;
  const baseY = joystick.centerY;
  const radius = joystick.radius;
  
  ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(baseX, baseY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  if (joystick.active) {
    const dx = joystick.currentX - joystick.startX;
    const dy = joystick.currentY - joystick.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const limitedDistance = Math.min(distance, radius);
    const angle = Math.atan2(dy, dx);
    
    const controlX = baseX + Math.cos(angle) * limitedDistance;
    const controlY = baseY + Math.sin(angle) * limitedDistance;
    
    ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(controlX, controlY, 20, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(100, 150, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(baseX, baseY, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('←→', baseX, baseY);
  
  const jumpX = jumpButton.x;
  const jumpY = jumpButton.y;
  
  ctx.fillStyle = jumpButton.pressed 
    ? 'rgba(255, 100, 100, 0.9)' 
    : 'rgba(255, 100, 100, 0.4)';
  ctx.beginPath();
  ctx.arc(jumpX, jumpY, jumpButton.radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✕', jumpX, jumpY);
}

function drawUI() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(10, 10, 200, 80);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Monedas: ${coinsCollected}`, 20, 50);
  
  let stateText = playerState === 0 ? '👧' : playerState === 1 ? '🍄 Grande' : '🔥 Fuego';
  ctx.fillText(`Estado: ${stateText}`, 20, 70);
  
  const progressPercent = Math.floor((distanceTraveled / CONFIG.GOAL_DISTANCE) * 100);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(canvas.width - 210, 10, 200, 50);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Tiempo: ${Math.floor(gameTime / 60)}s`, canvas.width - 20, 30);
  ctx.fillText(`Progreso: ${Math.min(progressPercent, 100)}%`, canvas.width - 20, 50);
}

function redimensionarCanvas() {
  // Usar documentElement para evitar problemas con barra del navegador
  const screenWidth = document.documentElement.clientWidth;
  const screenHeight = document.documentElement.clientHeight;
  
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  
  joystick.centerX = screenWidth * 0.15;
  joystick.centerY = screenHeight * 0.75;  /* ← CAMBIAR de 0.85 (más arriba) */
  jumpButton.x = screenWidth * 0.85;
  jumpButton.y = screenHeight * 0.75;      /* ← CAMBIAR de 0.85 (más arriba) */
  
  groundY = screenHeight - 100;
}

function stopGame() {
  gameRunning = false;
  gameEnded = true;
}

function gameOverMiniGame() {
  stopGame();
  playSound('fail');
  console.log('💀 Game Over');
  
  document.dispatchEvent(new CustomEvent('gameOver', {
    detail: { score, coinsCollected }
  }));
}

function winMiniGame() {
  stopGame();
  playSound('win');
  console.log('🏆 ¡Victoria!');
  
  document.dispatchEvent(new CustomEvent('gameWin', {
    detail: { score, coinsCollected, time: gameTime }
  }));
}

function getScore() { return score; }
function getCoinsCollected() { return coinsCollected; }
function getGameTime() { return Math.floor(gameTime / 60); }

const gameEngine = {
  init: initGameEngine,
  start: startGameLevel,
  stop: stopGame,
  jump: jump,
  fireballShoot: fireballShoot,
  getScore: getScore,
  getCoinsCollected: getCoinsCollected,
  getGameTime: getGameTime,
  isRunning: () => gameRunning
};

console.log('✅ Game Engine listo - Todas las correcciones aplicadas');
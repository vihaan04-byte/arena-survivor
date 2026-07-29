// main.js
// Game loop, canvas setup, state machine, XP orbs, projectile/enemy
// collision. Owns the shared `enemies` array; spawner.js populates it.

import { createPlayer, initInput, updatePlayer, tryAutoAttack, gainXp } from './player.js';
import {
  clearArena, drawPlayer, drawEnemies, drawProjectiles, drawXpOrbs,
  drawDamageNumbers, drawHud, drawUpgradeCards, drawGameOverScreen,
} from './render.js';
import { updateEnemies, applyContactDamage, damageEnemy, removeDeadEnemies } from './enemies.js';
import { createSpawner, updateSpawner } from './spawner.js';
import { getUpgradeChoices, applyUpgrade } from './upgrades.js';

const ARENA_WIDTH = 900;
const ARENA_HEIGHT = 600;
const TIME_LIMIT = 600; // 10 min win condition

const canvas = document.getElementById('game');
canvas.width = ARENA_WIDTH;
canvas.height = ARENA_HEIGHT;
const ctx = canvas.getContext('2d');

const STATE = {
  PLAYING: 'playing',
  LEVEL_UP: 'level_up',
  GAME_OVER: 'game_over',
};

function newGameState() {
  return {
    mode: STATE.PLAYING,
    player: createPlayer(ARENA_WIDTH, ARENA_HEIGHT),
    enemies: [],
    projectiles: [],
    xpOrbs: [],
    damageNumbers: [],
    elapsed: 0,
    kills: 0,
    pendingUpgrades: [],
    won: false,
    spawner: createSpawner(),
    contactCooldowns: new Map(),
  };
}

let state = newGameState();
initInput();

window.addEventListener('keydown', (e) => {
  if (state.mode === STATE.GAME_OVER && e.key.toLowerCase() === 'r') {
    state = newGameState();
  }
  if (state.mode === STATE.LEVEL_UP) {
    const idx = parseInt(e.key, 10) - 1;
    if (idx >= 0 && idx < state.pendingUpgrades.length) {
      pickUpgrade(idx);
    }
  }
});

canvas.addEventListener('click', (e) => {
  if (state.mode !== STATE.LEVEL_UP) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  state.pendingUpgrades.forEach((card, i) => {
    const hb = card._hitbox;
    if (hb && mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
      pickUpgrade(i);
    }
  });
});

function pickUpgrade(index) {
  const upgrade = state.pendingUpgrades[index];
  applyUpgrade(state.player, upgrade.id);
  state.pendingUpgrades = [];
  state.mode = STATE.PLAYING;
}

function spawnXpOrb(x, y, value) {
  state.xpOrbs.push({ x, y, value, radius: 5 });
}

function addDamageNumber(x, y, value) {
  state.damageNumbers.push({ x, y, value, life: 0.8, maxLife: 0.8 });
}

function updateProjectiles(dt) {
  for (const p of state.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  state.projectiles = state.projectiles.filter((p) => p.life > 0);
}

function handleCollisions() {
  // projectiles vs enemies
  for (const p of state.projectiles) {
    for (const e of state.enemies) {
      if (e.hp <= 0) continue;
      const dx = e.x - p.x, dy = e.y - p.y;
      const distSq = dx * dx + dy * dy;
      const hitDist = e.radius + p.radius;
      if (distSq <= hitDist * hitDist) {
        const killed = damageEnemy(e, p.dmg);
        addDamageNumber(e.x, e.y - e.radius - 4, p.dmg);
        p.life = 0; // consume projectile on hit
        if (killed) {
          state.kills += 1;
          spawnXpOrb(e.x, e.y, 5);
        }
        break;
      }
    }
  }
  state.projectiles = state.projectiles.filter((p) => p.life > 0);
  removeDeadEnemies(state.enemies);

  // enemies vs player (contact damage, handles its own per-enemy cooldown)
  applyContactDamage(state.enemies, state.player, 1 / 60, state.contactCooldowns);

  // player vs xp orbs
  state.xpOrbs = state.xpOrbs.filter((orb) => {
    const dx = orb.x - state.player.x, dy = orb.y - state.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= state.player.pickupRadius) {
      const leveledUp = gainXp(state.player, orb.value);
      if (leveledUp) triggerLevelUp();
      return false;
    }
    return true;
  });
}

function triggerLevelUp() {
  state.pendingUpgrades = getUpgradeChoices(state.player, 3);
  if (state.pendingUpgrades.length > 0) {
    state.mode = STATE.LEVEL_UP;
  }
}

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp big pauses
  lastTime = now;

  if (state.mode === STATE.PLAYING) {
    state.elapsed += dt;

    updatePlayer(state.player, dt, ARENA_WIDTH, ARENA_HEIGHT);
    updateSpawner(state.spawner, state.enemies, state.elapsed, dt, ARENA_WIDTH, ARENA_HEIGHT);
    updateEnemies(state.enemies, state.player, dt);
    updateProjectiles(dt);

    const newProjectiles = tryAutoAttack(state.player, state.enemies);
    state.projectiles.push(...newProjectiles);

    handleCollisions();

    for (const n of state.damageNumbers) n.life -= dt;
    state.damageNumbers = state.damageNumbers.filter((n) => n.life > 0);

    if (state.player.hp <= 0) {
      state.mode = STATE.GAME_OVER;
      state.won = false;
    } else if (state.elapsed >= TIME_LIMIT) {
      state.mode = STATE.GAME_OVER;
      state.won = true;
    }
  }

  render();
  requestAnimationFrame(loop);
}

function render() {
  clearArena(ctx, ARENA_WIDTH, ARENA_HEIGHT);
  drawEnemies(ctx, state.enemies);
  drawXpOrbs(ctx, state.xpOrbs);
  drawProjectiles(ctx, state.projectiles);
  drawPlayer(ctx, state.player);
  drawDamageNumbers(ctx, state.damageNumbers);
  drawHud(ctx, state.player, ARENA_WIDTH, state.elapsed, TIME_LIMIT);

  if (state.mode === STATE.LEVEL_UP) {
    drawUpgradeCards(ctx, ARENA_WIDTH, ARENA_HEIGHT, state.pendingUpgrades);
  }
  if (state.mode === STATE.GAME_OVER) {
    drawGameOverScreen(ctx, ARENA_WIDTH, ARENA_HEIGHT, {
      timeSurvived: `${Math.floor(state.elapsed)}s`,
      kills: state.kills,
      level: state.player.level,
    }, state.won);
  }
}

requestAnimationFrame(loop);

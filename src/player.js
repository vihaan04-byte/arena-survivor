// player.js
// Owns the player object, movement, stat management, and auto-attack.
//
// Player object shape (contract shared with enemies.js / upgrades.js):
// {
//   x, y,
//   hp, maxHp,
//   moveSpeed,
//   dmg,
//   attackSpeed,   // attacks per second
//   range,
//   pickupRadius,
//   xp, xpToNext, level,
//   radius,        // for collision
//   _attackCooldown // internal, seconds until next attack allowed
// }

export const PLAYER_RADIUS = 14;

export function createPlayer(arenaWidth, arenaHeight) {
  return {
    x: arenaWidth / 2,
    y: arenaHeight / 2,
    hp: 100,
    maxHp: 100,
    moveSpeed: 180,       // px/sec
    dmg: 10,
    attackSpeed: 1.5,     // attacks per second
    range: 220,
    pickupRadius: 60,
    xp: 0,
    xpToNext: 10,
    level: 1,
    radius: PLAYER_RADIUS,
    _attackCooldown: 0,
  };
}

const keysDown = new Set();

export function initInput() {
  window.addEventListener('keydown', (e) => keysDown.add(e.key.toLowerCase()));
  window.addEventListener('keyup', (e) => keysDown.delete(e.key.toLowerCase()));
}

function getMoveVector() {
  let dx = 0, dy = 0;
  if (keysDown.has('w') || keysDown.has('arrowup')) dy -= 1;
  if (keysDown.has('s') || keysDown.has('arrowdown')) dy += 1;
  if (keysDown.has('a') || keysDown.has('arrowleft')) dx -= 1;
  if (keysDown.has('d') || keysDown.has('arrowright')) dx += 1;
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv; dy *= inv;
  }
  return { dx, dy };
}

export function updatePlayer(player, dt, arenaWidth, arenaHeight) {
  const { dx, dy } = getMoveVector();
  player.x += dx * player.moveSpeed * dt;
  player.y += dy * player.moveSpeed * dt;

  // clamp to arena bounds
  player.x = Math.max(player.radius, Math.min(arenaWidth - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(arenaHeight - player.radius, player.y));

  if (player._attackCooldown > 0) {
    player._attackCooldown -= dt;
  }
}

function findNearestEnemy(player, enemies) {
  let nearest = null;
  let nearestDistSq = Infinity;
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < nearestDistSq) {
      nearestDistSq = distSq;
      nearest = enemy;
    }
  }
  return nearest;
}

// Returns an array of projectile objects fired this frame (empty if none).
// Projectile shape: { x, y, vx, vy, dmg, radius, life }
export function tryAutoAttack(player, enemies) {
  if (player._attackCooldown > 0) return [];

  const target = findNearestEnemy(player, enemies);
  if (!target) return [];

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > player.range) return [];

  player._attackCooldown = 1 / player.attackSpeed;

  const speed = 480; // projectile speed px/sec
  const vx = (dx / dist) * speed;
  const vy = (dy / dist) * speed;

  return [{
    x: player.x,
    y: player.y,
    vx, vy,
    dmg: player.dmg,
    radius: 5,
    life: 1.5, // seconds before despawn if it hits nothing
  }];
}

// XP handling. Returns true if player leveled up this call.
export function gainXp(player, amount) {
  player.xp += amount;
  if (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;
    player.xpToNext = Math.floor(player.xpToNext * 1.35 + 5);
    return true;
  }
  return false;
}

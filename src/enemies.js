
/**
 * enemies.js
 *
 * Enemy utilities for Arena Survivor.
 * This module owns no global state.
 * main.js owns the shared enemies array.
 */

export const ENEMY_TYPES = {
    grunt: {
        hp: 25,
        dmg: 8,
        speed: 85,
        radius: 14
    },

    runner: {
        hp: 14,
        dmg: 6,
        speed: 150,
        radius: 11
    },

    tank: {
        hp: 80,
        dmg: 18,
        speed: 45,
        radius: 22
    }
};

/**
 * Creates a new enemy.
 *
 * Shape:
 * {
 *   x,
 *   y,
 *   hp,
 *   dmg,
 *   speed,
 *   type,
 *   radius
 * }
 */
export function createEnemy(type, x, y) {
    const stats = ENEMY_TYPES[type];

    if (!stats) {
        throw new Error(`Unknown enemy type "${type}"`);
    }

    return {
        x,
        y,
        hp: stats.hp,
        dmg: stats.dmg,
        speed: stats.speed,
        type,
        radius: stats.radius
    };
}

/**
 * Updates movement for every enemy.
 *
 * dt is in seconds.
 */
export function updateEnemies(enemies, player, dt) {
    for (const enemy of enemies) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        const distance = Math.hypot(dx, dy);

        if (distance === 0) continue;

        enemy.x += (dx / distance) * enemy.speed * dt;
        enemy.y += (dy / distance) * enemy.speed * dt;
    }
}

/**
 * Returns true if the enemy touches the player.
 */
export function enemyTouchesPlayer(enemy, player) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;

    const playerRadius = player.radius ?? 16;

    const collisionDistance = enemy.radius + playerRadius;

    return dx * dx + dy * dy <= collisionDistance * collisionDistance;
}

/**
 * Damages the player if an enemy is touching them.
 *
 * contactCooldowns should be a Map()
 * stored by main.js.
 */
export function applyContactDamage(
    enemies,
    player,
    dt,
    contactCooldowns,
    cooldown = 0.4
) {
    for (const enemy of enemies) {
        const timer = contactCooldowns.get(enemy) ?? 0;

        if (timer > 0) {
            contactCooldowns.set(enemy, timer - dt);
            continue;
        }

        if (enemyTouchesPlayer(enemy, player)) {
            player.hp = Math.max(0, player.hp - enemy.dmg);

            contactCooldowns.set(enemy, cooldown);
        }
    }
}

/**
 * Damages one enemy.
 *
 * Returns true if killed.
 */
export function damageEnemy(enemy, amount) {
    enemy.hp -= amount;
    return enemy.hp <= 0;
}

/**
 * Removes dead enemies.
 *
 * Returns an array containing every enemy
 * that died this frame.
 */
export function removeDeadEnemies(enemies) {
    const dead = [];

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
            dead.push(enemies[i]);
            enemies.splice(i, 1);
        }
    }

    return dead;
}

/**
 * Finds the nearest enemy.
 *
 * Returns null if none exist.
 */
export function getNearestEnemy(player, enemies) {
    let nearest = null;
    let bestDistanceSq = Infinity;

    for (const enemy of enemies) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;

        const distSq = dx * dx + dy * dy;

        if (distSq < bestDistanceSq) {
            bestDistanceSq = distSq;
            nearest = enemy;
        }
    }

    return nearest;
}

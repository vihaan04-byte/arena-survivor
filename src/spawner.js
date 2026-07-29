
/**
 * spawner.js
 *
 * Handles wave progression and enemy spawning.
 * Does not own the enemies array.
 */

import { createEnemy } from "./enemies.js";

const SURGE_INTERVAL = 30; // seconds
const BASE_INTERVAL = 1.4;
const MIN_INTERVAL = 0.25;

export function createSpawner() {
    return {
        timer: 0,
        nextSpawn: BASE_INTERVAL,
        lastSurge: -1
    };
}

/**
 * Update spawning.
 *
 * @param {Object} spawner
 * @param {Array} enemies Shared enemy array
 * @param {number} elapsedTime Seconds since run started
 * @param {number} dt Seconds since previous frame
 * @param {number} width Arena width
 * @param {number} height Arena height
 */
export function updateSpawner(
    spawner,
    enemies,
    elapsedTime,
    dt,
    width,
    height
) {
    spawner.timer += dt;

    // Spawn interval decreases over time
    const difficulty = Math.min(elapsedTime / 300, 1);

    spawner.nextSpawn =
        BASE_INTERVAL -
        difficulty * (BASE_INTERVAL - MIN_INTERVAL);

    while (spawner.timer >= spawner.nextSpawn) {
        spawner.timer -= spawner.nextSpawn;

        const type = chooseEnemyType(elapsedTime);

        enemies.push(
            createEnemy(type, ...randomEdgePosition(width, height))
        );
    }

    handleSurge(
        spawner,
        enemies,
        elapsedTime,
        width,
        height
    );
}

/**
 * Enemy composition evolves over time.
 */
function chooseEnemyType(time) {
    const r = Math.random();

    if (time < 45) {
        return "grunt";
    }

    if (time < 120) {
        if (r < 0.75) return "grunt";
        return "runner";
    }

    if (r < 0.55) return "grunt";
    if (r < 0.85) return "runner";
    return "tank";
}

/**
 * Every SURGE_INTERVAL seconds,
 * spawn a burst of enemies.
 */
function handleSurge(
    spawner,
    enemies,
    elapsedTime,
    width,
    height
) {
    const surge = Math.floor(elapsedTime / SURGE_INTERVAL);

    if (surge <= spawner.lastSurge) {
        return;
    }

    spawner.lastSurge = surge;

    const count = 6 + surge * 2;

    for (let i = 0; i < count; i++) {
        enemies.push(
            createEnemy(
                chooseEnemyType(elapsedTime),
                ...randomEdgePosition(width, height)
            )
        );
    }
}

/**
 * Picks a random point just outside
 * one edge of the arena.
 */
function randomEdgePosition(width, height) {
    const edge = Math.floor(Math.random() * 4);

    const margin = 40;

    switch (edge) {
        case 0:
            return [
                Math.random() * width,
                -margin
            ];

        case 1:
            return [
                Math.random() * width,
                height + margin
            ];

        case 2:
            return [
                -margin,
                Math.random() * height
            ];

        default:
            return [
                width + margin,
                Math.random() * height
            ];
    }
}

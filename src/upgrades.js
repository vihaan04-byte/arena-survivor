/**
 * upgrades.js
 *
 * Upgrade definitions and application logic.
 * Mutates the player stats object supplied by main.js.
 */

export const UPGRADES = [
    {
        id: "damage",
        name: "Sharpened Weapon",
        description: "+5 attack damage",
        apply(player) {
            player.dmg += 5;
        }
    },

    {
        id: "attackSpeed",
        name: "Rapid Fire",
        description: "+15% attack speed",
        apply(player) {
            player.attackSpeed *= 1.15;
        }
    },

    {
        id: "moveSpeed",
        name: "Swift Boots",
        description: "+15 move speed",
        apply(player) {
            player.moveSpeed += 15;
        }
    },

    {
        id: "maxHp",
        name: "Vitality",
        description: "+20 max HP and heal 20 HP",
        apply(player) {
            player.maxHp += 20;
            player.hp = Math.min(player.maxHp, player.hp + 20);
        }
    },

    {
        id: "pickupRadius",
        name: "Magnet",
        description: "+30 pickup radius",
        apply(player) {
            player.pickupRadius += 30;
        }
    },

    {
        id: "range",
        name: "Longshot",
        description: "+40 attack range",
        apply(player) {
            player.range += 40;
        }
    }
];

/**
 * Returns an upgrade object by id.
 */
export function getUpgrade(id) {
    return UPGRADES.find(upgrade => upgrade.id === id) ?? null;
}

/**
 * Returns random upgrades.
 *
 * No duplicates.
 * Future versions can filter by unlock level.
 */
export function getUpgradeChoices(player, count = 3) {
    const pool = [...UPGRADES];
    const choices = [];

    while (pool.length > 0 && choices.length < count) {
        const index = Math.floor(Math.random() * pool.length);
        choices.push(pool.splice(index, 1)[0]);
    }

    return choices;
}

/**
 * Applies an upgrade by id.
 */
export function applyUpgrade(player, upgradeId) {
    const upgrade = getUpgrade(upgradeId);

    if (!upgrade) {
        throw new Error(`Unknown upgrade "${upgradeId}"`);
    }

    upgrade.apply(player);

    return upgrade;
}


# Arena Survivor — Design Doc

## Concept
Top-down arena survivor (Vampire Survivors–style). Player auto-attacks,
moves manually, survives escalating waves of enemies, collects XP,
picks upgrades on level-up. Run ends in a win (survive timer) or loss
(HP hits 0).

## Tech
- Vanilla JS, HTML5 Canvas 2D. No frameworks, no build step.
- Single `index.html` loads `/src/*.js` as ES modules.
- No external art/audio assets. All visuals are drawn shapes
  (circles, polygons, glow via shadowBlur, particle trails).
  Color and motion carry the "juice," not sprites.
- Must run by opening index.html directly or via GitHub Pages.

## Controls
- WASD / arrow keys: move
- Attack is automatic, always targets nearest enemy
- On level-up: game pauses, shows 3 upgrade cards, click/number key to pick

## Core Loop
1. Player spawns center-screen, arena is a fixed-size bounded rectangle
2. Enemies spawn from off-screen edges in waves, escalating over time
3. Player auto-attacks nearest enemy in range
4. Killed enemies drop XP orbs, player auto-collects within pickup radius
5. XP fills bar → level up → choose 1 of 3 upgrades → resume
6. Survive the timer (e.g. 10 min) = win. HP reaches 0 = lose.

## Player
- Base stats: HP, move speed, attack damage, attack speed, attack range, pickup radius
- Starts with one basic attack (e.g. projectile toward nearest enemy)

## Enemy Types (start with 3, expand later)
- **Grunt**: low HP, slow, contact damage, spawns in large numbers
- **Runner**: low HP, fast, contact damage, spawns in smaller numbers
- **Tank**: high HP, slow, high contact damage, spawns rarely

## Wave Scaling
- Spawn rate and enemy HP/damage scale up over elapsed time
- Occasional larger "surge" waves every N seconds

## Upgrades (pick 3 random of these per level-up, no duplicates in same offer)
- +Damage, +Attack Speed, +Move Speed, +Max HP, +Pickup Radius
- New attack type (e.g. orbiting blade, area pulse) — unlocked after a few levels
- Attack evolutions come later, not MVP

## Visual Style
- Dark background, neon/glow accent colors per entity type
- Player: distinct bright color + subtle trail
- Enemies: color-coded by type
- Damage numbers as floating text, brief scale-pop on hit
- Screen shake on player hit / big kills

## Win/Loss
- Win: survive to timer
- Loss: HP <= 0, show run stats (time survived, kills, level reached)

## MVP scope (day 1-2)
Player movement, one enemy type, auto-attack, XP + leveling with at
least 3 upgrades, basic win/loss states. Everything else layered after.


# Tasks

## MVP (do first)
- [ ] `main.js` — game loop, canvas setup, state machine (playing/paused/gameover)     (owner: ?)
- [ ] `player.js` — movement, stats, auto-attack targeting + firing                    (owner: ?)
- [ ] `enemies.js` — enemy classes/objects, contact damage, death                      (owner: ?)
- [ ] `spawner.js` — wave timing, spawn positions, difficulty scaling                  (owner: ?)
- [ ] XP orbs + pickup + level-up trigger                                              (owner: ?)
- [ ] `upgrades.js` — upgrade list, 3-card selection UI, apply to player stats         (owner: ?)
- [ ] `render.js` — draw player/enemies/orbs/UI (HP bar, XP bar, timer)                (owner: ?)
- [ ] Win/loss states + run summary screen                                             (owner: ?)

## Polish (after MVP works)
- [ ] Screen shake + hit flash
- [ ] Particle trails / glow tuning
- [ ] Damage number popups
- [ ] Second + third enemy type
- [ ] More upgrades / attack evolutions
- [ ] Sound (optional, only if we find free SFX — else skip, silence is fine)

---
Notes go here as tasks are finished — e.g.:
"enemies.js: Enemy is {x,y,hp,dmg,speed,type,radius}. Spawner pushes into
a shared `enemies` array in main.js, doesn't own its own loop."

enemies.js: Exports createEnemy(), updateEnemies(), applyContactDamage(), damageEnemy(), removeDeadEnemies(), getNearestEnemy(). Enemy objects are {x,y,hp,dmg,speed,type,radius}; module owns no global state.

spawner.js: Exports createSpawner() and updateSpawner(). Spawner owns only timer state; new enemies are created with createEnemy() and pushed into the shared enemies array owned by main.js.

upgrades.js: Exports UPGRADES, getUpgradeChoices(player,count), getUpgrade(id), and applyUpgrade(player,id). Upgrade effects mutate the shared player object fields (hp, maxHp, moveSpeed, dmg, attackSpeed, range, pickupRadius).

---
### Claude's update
- [x] main.js — game loop, state machine (playing/level_up/game_over)
- [x] player.js — movement, stats, auto-attack, XP/leveling
- [x] render.js — took this too, wasn't clearly owned and main.js needed it (enemies drawn generically by `type` string + color map, no need to touch this file for new enemy types beyond adding a color)
- [x] index.html — canvas shell

Wired main.js against the ACTUAL exports GPT built (not my earlier guessed contract):
- `createSpawner()` + `updateSpawner(spawner, enemies, elapsedTime, dt, width, height)`
- `updateEnemies(enemies, player, dt)` for movement, `applyContactDamage(enemies, player, dt, contactCooldowns)` for touch damage
- `damageEnemy(enemy, amount)` returns true if killed, `removeDeadEnemies(enemies)` to clean up
- `getUpgradeChoices(player, count)` returns full upgrade objects `{id, name, description, apply}`, `applyUpgrade(player, upgradeId)` takes the id string

Everything wired and passes a syntax check. Next real test is opening index.html in a browser.


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

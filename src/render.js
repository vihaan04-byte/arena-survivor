// render.js
// Draws everything: arena, player, projectiles, xp orbs, enemies (generic
// by type/color so enemies.js doesn't need to touch this file), and UI.
//
// Enemy color map keyed by `type` string - add new types here if
// enemies.js introduces more (falls back to a default color).
const ENEMY_COLORS = {
  grunt: '#ff5566',
  runner: '#ffaa33',
  tank: '#aa55ff',
};
const DEFAULT_ENEMY_COLOR = '#ff2244';

export function clearArena(ctx, width, height) {
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, width, height);
}

function glowCircle(ctx, x, y, radius, color, glow = 12) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPlayer(ctx, player) {
  glowCircle(ctx, player.x, player.y, player.radius, '#4ef0ff', 16);
}

export function drawEnemies(ctx, enemies) {
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const color = ENEMY_COLORS[e.type] || DEFAULT_ENEMY_COLOR;
    glowCircle(ctx, e.x, e.y, e.radius, color, 8);
  }
}

export function drawProjectiles(ctx, projectiles) {
  for (const p of projectiles) {
    glowCircle(ctx, p.x, p.y, p.radius, '#ffffff', 10);
  }
}

export function drawXpOrbs(ctx, orbs) {
  for (const o of orbs) {
    glowCircle(ctx, o.x, o.y, o.radius, '#66ffaa', 6);
  }
}

export function drawDamageNumbers(ctx, numbers) {
  ctx.save();
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  for (const n of numbers) {
    const alpha = Math.max(0, n.life / n.maxLife);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillText(Math.round(n.value), n.x, n.y);
  }
  ctx.restore();
}

export function drawHud(ctx, player, width, elapsed, timeLimit) {
  const barWidth = 240;
  const barHeight = 14;
  const margin = 16;

  ctx.fillStyle = '#331111';
  ctx.fillRect(margin, margin, barWidth, barHeight);
  ctx.fillStyle = '#ff4466';
  ctx.fillRect(margin, margin, barWidth * Math.max(0, player.hp / player.maxHp), barHeight);

  ctx.fillStyle = '#113311';
  ctx.fillRect(margin, margin + barHeight + 6, barWidth, barHeight);
  ctx.fillStyle = '#55ffaa';
  ctx.fillRect(margin, margin + barHeight + 6, barWidth * (player.xp / player.xpToNext), barHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Level ${player.level}`, margin, margin + barHeight * 2 + 22);

  const remaining = Math.max(0, timeLimit - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60).toString().padStart(2, '0');
  ctx.textAlign = 'right';
  ctx.fillText(`${mins}:${secs}`, width - margin, margin + barHeight);
}

export function drawUpgradeCards(ctx, width, height, cards) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, width, height);

  const cardWidth = 200, cardHeight = 260, gap = 24;
  const totalWidth = cards.length * cardWidth + (cards.length - 1) * gap;
  const startX = (width - totalWidth) / 2;
  const y = (height - cardHeight) / 2;

  cards.forEach((card, i) => {
    const x = startX + i * (cardWidth + gap);
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#4ef0ff';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${i + 1}`, x + cardWidth / 2, y + 30);
    ctx.font = '14px sans-serif';
    wrapText(ctx, card.name, x + cardWidth / 2, y + 60, cardWidth - 20, 18);
    ctx.font = '12px sans-serif';
    wrapText(ctx, card.description || '', x + cardWidth / 2, y + 100, cardWidth - 24, 16);

    card._hitbox = { x, y, w: cardWidth, h: cardHeight };
  });
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, cy);
      line = word + ' ';
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cy);
}

export function drawGameOverScreen(ctx, width, height, stats, won) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = won ? '#66ffaa' : '#ff5566';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(won ? 'YOU SURVIVED' : 'YOU DIED', width / 2, height / 2 - 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Time survived: ${stats.timeSurvived}`, width / 2, height / 2);
  ctx.fillText(`Kills: ${stats.kills}`, width / 2, height / 2 + 26);
  ctx.fillText(`Level reached: ${stats.level}`, width / 2, height / 2 + 52);
  ctx.font = '13px sans-serif';
  ctx.fillText('Press R to restart', width / 2, height / 2 + 90);
  ctx.restore();
}

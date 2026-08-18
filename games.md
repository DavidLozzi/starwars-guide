---
title: Games
layout: page
permalink: /games/
social-image: "/assets/cards/clone-defense.png"
social-title: Star Wars Games
social-desc: Three free Star Wars games. Play all today!
date: 2026-08-18 12:00:00
last_modified_at: 2026-08-18 12:00:00
---

<div class="games-springboard">
  {% for g in site.data.games %}
  <button type="button" class="game-icon border-{{ g.color }}" data-game="{{ g.key }}" aria-expanded="false" aria-controls="panel-{{ g.key }}">
    <img src="{{ g.icon_image }}" alt="" loading="lazy" class="game-icon-img border-{{ g.color }}">
    <span class="game-icon-name">{{ g.name }}</span>
  </button>
  {% endfor %}
</div>

<div class="games-panels">
  {% for g in site.data.games %}
  <div class="game-panel border-{{ g.color }}" id="panel-{{ g.key }}" role="dialog" aria-modal="true" aria-labelledby="panel-{{ g.key }}-title" data-play="{% if g.external %}{{ g.play }}{% else %}{{ g.play | relative_url }}{% endif %}" data-external="{{ g.external }}">
    <button type="button" class="game-panel-close text-{{ g.color }}" aria-label="Close {{ g.name }}">
      &times;
    </button>
    <div class="flex flex-col items-center justify-center mb-4 mt-4 relative z-10 w-full px-4">
      <img src="{{ g.card }}" alt="{{ g.name }}" loading="lazy" class="w-full max-h-60 object-contain rounded shadow-lg bg-black border-2 border-{{ g.color }}">
    </div>
    <h2 id="panel-{{ g.key }}-title" class="game-panel-title text-{{ g.color }}">{{ g.name }}</h2>
    <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10 text-center">
      {{ g.tagline }}
    </p>
    <div class="flex gap-2 mt-4 w-full">
      <a href="{% if g.external %}{{ g.play }}{% else %}{{ g.play | relative_url }}{% endif %}" class="btn flex-1 bg-{{ g.color }}"{% if g.external %} target="_blank" rel="noopener"{% endif %} onclick="event.stopPropagation()">
        <i class="fas fa-rocket mr-2"></i>
        LAUNCH
      </a>
      <a href="{{ g.read | relative_url }}" class="btn flex-1 border-{{ g.color }} text-{{ g.color }} hover:bg-{{ g.color }} hover:text-black" onclick="event.stopPropagation()">
        <i class="fas fa-book mr-2"></i>
        READ
      </a>
    </div>
  </div>
  {% endfor %}
</div>

<div class="games-backdrop" hidden></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var backdrop = document.querySelector('.games-backdrop');
    var icons = document.querySelectorAll('.game-icon');
    var openPanel = null;
    var openIcon = null;

    function close() {
      if (!openPanel) return;
      openPanel.classList.remove('is-open');
      if (openIcon) {
        openIcon.setAttribute('aria-expanded', 'false');
        openIcon.focus();
      }
      if (backdrop) backdrop.hidden = true;
      document.body.style.overflow = '';
      openPanel = null;
      openIcon = null;
    }

    function open(icon) {
      var panel = document.getElementById(icon.getAttribute('aria-controls'));
      if (!panel) return;
      close();
      panel.classList.add('is-open');
      icon.setAttribute('aria-expanded', 'true');
      if (backdrop) backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      openPanel = panel;
      openIcon = icon;
      var closeBtn = panel.querySelector('.game-panel-close');
      if (closeBtn) closeBtn.focus();
    }

    icons.forEach(function(icon) {
      icon.addEventListener('click', function() { open(icon); });
    });

    // Desktop cards launch the game on click, same as the home page cards.
    // Below 768px the panel is a modal instead, so a stray tap must not fire it.
    document.querySelectorAll('.game-panel').forEach(function(panel) {
      panel.addEventListener('click', function() {
        if (window.innerWidth <= 768) return;
        var play = panel.getAttribute('data-play');
        if (panel.getAttribute('data-external') === 'true') {
          window.open(play, '_blank');
        } else {
          window.location.href = play;
        }
      });
    });

    document.querySelectorAll('.game-panel-close').forEach(function(btn) {
      btn.addEventListener('click', close);
    });

    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') close();
    });

    // A rotated phone must not leave a modal stuck open over the desktop grid.
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) close();
    });
  });
</script>

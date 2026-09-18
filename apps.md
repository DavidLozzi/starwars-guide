---
title: Apps
layout: page
permalink: /apps/
social-image: "/assets/cards/timeline.png"
social-title: Star Wars Apps
social-desc: The Ultimate Star Wars Timeline and HyperPanels — two free Star Wars apps.
date: 2026-09-18 12:00:00
last_modified_at: 2026-09-18 12:00:00
---

<div class="games-springboard">
  {% for a in site.data.apps %}
  <button type="button" class="game-icon border-{{ a.color }}" data-game="{{ a.key }}" aria-expanded="false" aria-controls="panel-{{ a.key }}">
    <img src="{{ a.icon_image }}" alt="" loading="lazy" class="game-icon-img border-{{ a.color }}">
    <span class="game-icon-name">{{ a.name }}</span>
  </button>
  {% endfor %}
  <a href="{{ '/games/' | relative_url }}" class="game-icon border-white">
    <span class="game-icon-glyph border-white text-white"><i class="fas fa-gamepad"></i></span>
    <span class="game-icon-name">Games</span>
  </a>
</div>

<div class="games-panels">
  {% for a in site.data.apps %}
  <div class="game-panel border-{{ a.color }}" id="panel-{{ a.key }}" data-game-key="{{ a.key }}" role="dialog" aria-modal="true" aria-labelledby="panel-{{ a.key }}-title" data-play="{% if a.external %}{{ a.play }}{% else %}{{ a.play | relative_url }}{% endif %}" data-external="{{ a.external }}">
    <button type="button" class="game-panel-close text-{{ a.color }}" aria-label="Close {{ a.name }}">
      &times;
    </button>
    <div class="flex flex-col items-center justify-center mb-4 mt-4 relative z-10 w-full px-4">
      <img src="{{ a.card }}" alt="{{ a.name }}" loading="lazy" class="w-full max-h-60 object-contain rounded shadow-lg bg-black border-2 border-{{ a.color }}">
    </div>
    <h2 id="panel-{{ a.key }}-title" class="game-panel-title text-{{ a.color }}">{{ a.name }}</h2>
    <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10 text-center">
      {{ a.tagline }}
    </p>
    <div class="flex gap-2 mt-4 w-full">
      <a href="{% if a.external %}{{ a.play }}{% else %}{{ a.play | relative_url }}{% endif %}" class="btn flex-1 bg-{{ a.color }}"{% if a.external %} target="_blank" rel="noopener"{% endif %} data-launch-app="{{ a.key }}" onclick="event.stopPropagation()">
        <i class="fas fa-rocket mr-2"></i>
        LAUNCH
      </a>
      <a href="{{ a.read | relative_url }}" class="btn flex-1 border-{{ a.color }} text-{{ a.color }} hover:bg-{{ a.color }} hover:text-black" onclick="event.stopPropagation()">
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
    var icons = document.querySelectorAll('.game-icon[aria-controls]');
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

    // GA4 launch attribution. The buttons below call stopPropagation, so the
    // site-wide delegated listener in footer.html never sees them; bind direct.
    function trackLaunch(app, surface) {
      if (typeof gtag !== 'function') return;
      gtag('event', 'launch_app', { app: app, surface: surface });
    }

    document.querySelectorAll('.game-panel a[data-launch-app]').forEach(function(a) {
      a.addEventListener('click', function() {
        trackLaunch(a.getAttribute('data-launch-app'), 'apps-hub-button');
      });
    });

    // Desktop cards launch the app on click, same as the home page cards.
    // Below 768px the panel is a modal instead, so a stray tap must not fire it.
    document.querySelectorAll('.game-panel').forEach(function(panel) {
      panel.addEventListener('click', function() {
        if (window.innerWidth <= 768) return;
        var play = panel.getAttribute('data-play');
        trackLaunch(panel.getAttribute('data-game-key'), 'apps-hub-card');
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

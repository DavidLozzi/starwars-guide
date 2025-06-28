---
layout: home
date: 2023-06-28 12:00:00
last_modified_at: 2026-06-28 12:00:00
---

<div class="min-h-screen bg-black text-white font-mono relative overflow-hidden">

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto p-6 relative">
    <!-- Apps Section -->
    <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Timeline Card -->
        <div class="card border-yellow-400 flex flex-col items-center justify-between" onclick="window.open('https://timeline.starwars.guide', '_blank')">
          <div class="flex flex-col items-center justify-center mb-4 mt-4 relative z-10 w-full px-4">
            <img src="/assets/cards/timeline.png" alt="Timeline Logo" class="w-full max-h-60 object-contain rounded shadow-lg bg-black border-2 border-yellow-400">
          </div>
          <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10 text-center">
            Explore the complete Star Wars chronology
          </p>
          <div class="flex gap-2 mt-4 w-full">
            <div class="btn flex-1">
              <span class="rocket mr-2">🚀</span>
              LAUNCH
            </div>
            <a href="{{ 'star-wars-timeline' | relative_url }}" class="btn flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black" onclick="event.stopPropagation()">
              <span class="book mr-2">📖</span>
              READ
            </a>
          </div>
        </div>

        <!-- HyperPanels Card -->
        <div class="card border-blue-400 flex flex-col items-center justify-between" onclick="window.open('https://comics.starwars.guide', '_blank')">
          <div class="flex flex-col items-center justify-center mb-4 mt-4 relative z-10 w-full px-4">
            <img src="/assets/cards/hyperpanels_web.png" alt="HyperPanels Logo" class="w-full max-h-60 object-contain rounded shadow-lg bg-black border-2 border-blue-400">
          </div>
          <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10 text-center">
            Respond using the Force! with a witty Star Wars comic.
          </p>
          <div class="flex gap-2 mt-4 w-full">
            <div class="btn flex-1">
              <span class="rocket mr-2">🚀</span>
              LAUNCH
            </div>
            <a href="{{ 'hyper-panels' | relative_url }}" class="btn flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black" onclick="event.stopPropagation()">
              <span class="book mr-2">📖</span>
              READ
            </a>
          </div>
        </div>

        <!-- SWordle Card -->
        <div class="card border-red-400 flex flex-col items-center justify-between" onclick="window.open('https://wordle.starwars.guide', '_blank')">
          <div class="flex flex-col items-center justify-center mb-4 mt-4 relative z-10 w-full px-4">
            <img src="/assets/cards/swordle.png" alt="SWordle Logo" class="w-full max-h-60 object-contain rounded shadow-lg bg-black border-2 border-red-400">
          </div>
          <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10 text-center">
            Wordle for the real Star Wars fan
          </p>
          <div class="flex gap-2 mt-4 w-full">
            <div class="btn flex-1">
              <span class="rocket mr-2">🚀</span>
              LAUNCH
            </div>
            <a href="{{ 'swordle-star-wars-wordle' | relative_url }}" class="btn flex-1 border-red-400 text-red-400 hover:bg-red-400 hover:text-black" onclick="event.stopPropagation()">
              <span class="book mr-2">📖</span>
              READ
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Decorative Break -->
    <div class="separator">
      <div class="separator-line bg-red-400"></div>
      <span class="separator-icon">★</span>
      <div class="separator-line bg-blue-400"></div>
    </div>

    <!-- News Section -->
    <section class="mb-16">
      <h2 class="text-4xl font-black text-white mb-8 border-l-8 border-red-400 pl-4 uppercase flex items-center">
        <span class="zap mr-4 text-red-400">⚡</span>
        recent posts
        <div class="ml-4 flex space-x-1">
          <div class="w-2 h-2 bg-red-400 animate-pulse"></div>
          <div class="w-2 h-2 bg-yellow-400 animate-pulse" style="animation-delay: 0.2s;"></div>
          <div class="w-2 h-2 bg-blue-400 animate-pulse" style="animation-delay: 0.4s;"></div>
        </div>
      </h2>
      
      <div class="space-y-4">
        {% for post in site.posts limit:3 %}
        <a href="{{ post.url | relative_url }}" class="news-item">
          <!-- Background Pattern -->
          <div class="absolute top-0 right-0 opacity-5">
            {% if post.tags contains 'YouTube' %}
              <span class="youtube" style="font-size: 120px;">📺</span>
            {% elsif post.tags contains 'Comicbook' %}
              <span class="book" style="font-size: 120px;">📖</span>
            {% else %}
              <span class="star" style="font-size: 120px;">★</span>
            {% endif %}
          </div>
          
          <div class="mb-2 relative z-10">
            <div class="flex items-center">
              <div class="news-icon">
                {% if post.tags contains 'YouTube' %}
                  <span class="youtube text-yellow-400">📺</span>
                {% elsif post.tags contains 'Comicbook' %}
                  <span class="book text-yellow-400">📖</span>
                {% else %}
                  <span class="star text-yellow-400">★</span>
                {% endif %}
              </div>
              <h3 class="news-title">
                {{ post.title | upcase }}
              </h3>
            </div>
          </div>
          <p class="news-summary relative z-10">
            {% if post.excerpt %}
              {{ post.excerpt | strip_html | truncatewords: 20 }}
            {% else %}
              {{ post.content | strip_html | truncatewords: 20 }}
            {% endif %}
          </p>
          <div class="mt-3 relative z-10">
            <span class="text-yellow-400 hover:text-yellow-300 text-sm uppercase tracking-wide font-bold">
              <span class="arrow mr-1">→</span>
              READ MORE
            </span>
          </div>
        </a>
        {% endfor %}
      </div>
      
      <a href="{{ '/posts' | relative_url }}" class="btn mt-6 bg-transparent border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wider text-lg px-8 py-4">
        <span class="external-link mr-2">🔗</span>
        VIEW ALL POSTS
      </a>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <!-- Decorative Elements -->
      <div class="quote-decorative top-left">★</div>
      <div class="quote-decorative top-right">★</div>
      <div class="quote-decorative bottom-left">★</div>
      <div class="quote-decorative bottom-right">★</div>
      
      <div class="quote-icons">
        <span class="sword text-blue-400 mr-4">⚔️</span>
        <span class="star text-yellow-400">★</span>
        <span class="sword text-blue-400 ml-4">⚔️</span>
      </div>
      
      <blockquote class="quote-text">
        "THE FORCE WILL BE WITH YOU, ALWAYS"
      </blockquote>
      <cite class="quote-author">
        <div class="h-1 w-8 bg-blue-400 mr-3"></div>
        OBI-WAN KENOBI
        <div class="h-1 w-8 bg-blue-400 ml-3"></div>
      </cite>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-bg"></div>
    <div class="footer-content">
      <p class="footer-text">
        <span class="star mr-2 text-yellow-400">★</span>
        © 2025 STARWARS.GUIDE // UNOFFICIAL FAN SITE // NOT AFFILIATED WITH DISNEY OR LUCASFILM
        <span class="star ml-2 text-yellow-400">★</span>
      </p>
    </div>
  </footer>
</div>

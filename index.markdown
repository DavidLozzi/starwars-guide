---
layout: home
date: 2023-06-28 12:00:00
last_modified_at: 2026-06-28 12:00:00
---

<div class="min-h-screen bg-black text-white font-mono relative overflow-hidden">

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto p-6 relative home-main-flex">
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
              <i class="fas fa-rocket mr-2"></i>
              LAUNCH
            </div>
            <a href="{{ 'star-wars-timeline' | relative_url }}" class="btn flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black" onclick="event.stopPropagation()">
              <i class="fas fa-book mr-2"></i>
              READ
            </a>
          </div>
        </div>

        <!-- HyperPanels Card -->
        <div class="card border-blue-400 flex flex-col items-center justify-between" onclick="window.open('https://hyperpanels.starwars.guide', '_blank')">
          <div class="flex flex-col items-center justify-center mb-4 mt-4 relative z-10 w-full px-4">
            <img src="/assets/cards/hyperpanels_web.png" alt="HyperPanels Logo" class="w-full max-h-60 object-contain rounded shadow-lg bg-black border-2 border-blue-400">
          </div>
          <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10 text-center">
            Respond using the Force! with a witty Star Wars comic.
          </p>
          <div class="flex gap-2 mt-4 w-full">
            <div class="btn flex-1">
              <i class="fas fa-rocket mr-2"></i>
              LAUNCH
            </div>
            <a href="{{ 'hyper-panels' | relative_url }}" class="btn flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black" onclick="event.stopPropagation()">
              <i class="fas fa-book mr-2"></i>
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
              <i class="fas fa-rocket mr-2"></i>
              LAUNCH
            </div>
            <a href="{{ 'swordle-star-wars-wordle' | relative_url }}" class="btn flex-1 border-red-400 text-red-400 hover:bg-red-400 hover:text-black" onclick="event.stopPropagation()">
              <i class="fas fa-book mr-2"></i>
              READ
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Follow Us Section -->
    <section class="mb-16">
      <h2 class="text-4xl font-black text-white mb-8 border-l-8 border-green-400 pl-4 uppercase flex items-center">
        <i class="fas fa-users mr-4 text-blue-400"></i>
        follow us
        <div class="ml-4 flex space-x-1">
          <div class="w-2 h-2 bg-red-400 animate-pulse"></div>
          <div class="w-2 h-2 bg-yellow-400 animate-pulse" style="animation-delay: 0.2s;"></div>
          <div class="w-2 h-2 bg-blue-400 animate-pulse" style="animation-delay: 0.4s;"></div>
        </div>
      </h2>
      
      <div class="flex flex-wrap justify-center gap-6">
        <!-- Threads -->
        <a href="https://threads.net/@aurebeshfiles" target="_blank" rel="noopener noreferrer" class="social-link text-green-400 hover:text-white transition-all duration-300">
          <div class="flex flex-col items-center justify-center p-4">
            <i class="fab fa-threads text-3xl mb-2"></i>
            <span class="text-sm font-bold uppercase tracking-wide">Threads</span>
          </div>
        </a>

        <!-- BlueSky -->
        <a href="https://bsky.app/profile/aurebeshfiles.bsky.social" target="_blank" rel="noopener noreferrer" class="social-link text-blue-400 hover:text-white transition-all duration-300">
          <div class="flex flex-col items-center justify-center p-4">
            <i class="fas fa-cloud text-3xl mb-2"></i>
            <span class="text-sm font-bold uppercase tracking-wide">BlueSky</span>
          </div>
        </a>

        <!-- Instagram -->
        <a href="https://instagram.com/aurebeshfiles" target="_blank" rel="noopener noreferrer" class="social-link text-pink-400 hover:text-white transition-all duration-300">
          <div class="flex flex-col items-center justify-center p-4">
            <i class="fab fa-instagram text-3xl mb-2"></i>
            <span class="text-sm font-bold uppercase tracking-wide">Instagram</span>
          </div>
        </a>

        <!-- YouTube -->
        <a href="https://youtube.com/@aurebeshfiles" target="_blank" rel="noopener noreferrer" class="social-link text-red-400 hover:text-white transition-all duration-300">
          <div class="flex flex-col items-center justify-center p-4">
            <i class="fab fa-youtube text-3xl mb-2"></i>
            <span class="text-sm font-bold uppercase tracking-wide">YouTube</span>
          </div>
        </a>

        <!-- Reddit -->
        <a href="https://www.reddit.com/user/aurebeshFiles/" target="_blank" rel="noopener noreferrer" class="social-link text-orange-400 hover:text-white transition-all duration-300">
          <div class="flex flex-col items-center justify-center p-4">
            <i class="fab fa-reddit text-3xl mb-2"></i>
            <span class="text-sm font-bold uppercase tracking-wide">Reddit</span>
          </div>
        </a>
      </div>
    </section>

    <!-- Decorative Break -->
    <div class="separator">
      <div class="separator-line bg-red-400"></div>
      <i class="fas fa-star separator-icon"></i>
      <div class="separator-line bg-blue-400"></div>
    </div>

    <!-- News Section -->
    <section class="mb-16">
      <h2 class="text-4xl font-black text-white mb-8 border-l-8 border-red-400 pl-4 uppercase flex items-center">
        <i class="fas fa-bolt mr-4 text-red-400"></i>
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
              <i class="fas fa-tv" style="font-size: 120px;"></i>
            {% elsif post.tags contains 'Comicbook' %}
              <i class="fas fa-book" style="font-size: 120px;"></i>
            {% else %}
              <i class="fas fa-star" style="font-size: 120px;"></i>
            {% endif %}
          </div>
          
          <div class="mb-2 relative z-10">
            <div class="flex items-center">
              <div class="news-icon">
                {% if post.tags contains 'YouTube' %}
                  <i class="fas fa-tv text-yellow-400"></i>
                {% elsif post.tags contains 'Comicbook' %}
                  <i class="fas fa-book text-yellow-400"></i>
                {% else %}
                  <i class="fas fa-star text-yellow-400"></i>
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
              <i class="fas fa-arrow-right mr-1"></i>
              READ MORE
            </span>
          </div>
        </a>
        {% endfor %}
      </div>
      
      <a href="{{ '/posts' | relative_url }}" class="btn mt-6 bg-transparent border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wider text-lg px-8 py-4">
        <i class="fas fa-external-link-alt mr-2"></i>
        VIEW ALL POSTS
      </a>
    </section>

    <!-- Quote Section -->
    <section class="quote-section relative overflow-hidden min-h-[300px]" style="background-image: url('{{ '/assets/kenobi.png' | relative_url }}'); background-position: left center; background-repeat: no-repeat; background-size: contain;">  
      <div class="quote-icons relative z-10">
        <i class="fas fa-khanda text-blue-400 mr-4"></i>
        <i class="fas fa-star text-yellow-400"></i>
        <i class="fas fa-khanda text-blue-400 ml-4"></i>
      </div>
      
      <blockquote class="quote-text relative z-10">
        "THE FORCE WILL BE WITH YOU, ALWAYS"
      </blockquote>
      <cite class="quote-author relative z-10">
        <div class="h-1 w-8 bg-blue-400 mr-3"></div>
        OBI-WAN KENOBI
        <div class="h-1 w-8 bg-blue-400 ml-3"></div>
      </cite>
    </section>
  </main>
</div>

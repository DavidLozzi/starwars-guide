---
layout: home
---

<div class="min-h-screen bg-black text-white font-mono relative overflow-hidden">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-5">
    <div class="bg-pattern">★</div>
    <div class="bg-pattern-2">⚔</div>
    <div class="bg-pattern-3">◆</div>
    <div class="bg-pattern-4">▲</div>
    <div class="bg-pattern-5">■</div>
    <div class="bg-pattern-6">●</div>
  </div>

  <!-- Header -->
  <header class="border-b-4 border-white p-6 relative">
    <div class="max-w-6xl mx-auto">
      <!-- ASCII Art Logo -->
      <div class="mb-4 text-yellow-400 text-xs font-mono leading-tight">
        <pre class="ascii-art">
    ███████╗████████╗ █████╗ ██████╗ ██╗    ██╗ █████╗ ██████╗ ███████╗
    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║    ██║██╔══██╗██╔══██╗██╔════╝
    ███████╗   ██║   ███████║██████╔╝██║ █╗ ██║███████║██████╔╝███████╗
    ╚════██║   ██║   ██╔══██║██╔══██╗██║███╗██║██╔══██║██╔══██╗╚════██║
    ███████║   ██║   ██║  ██║██║  ██║╚███╔███╔╝██║  ██║██║  ██║███████║
    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
        </pre>
      </div>
      
      <p class="text-xl text-white opacity-80 uppercase tracking-wide flex items-center justify-center">
        <span class="text-red-400 mr-2">▶</span>
        A COUPLE OF STAR WARS NERDS
        <span class="text-blue-400 ml-2">◀</span>
      </p>
    </div>
  </header>

  <!-- Decorative Separator -->
  <div class="w-full h-4 bg-gradient-to-r"></div>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto p-6 relative">
    <!-- Apps Section -->
    <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Timeline Card -->
        <div class="card border-yellow-400">
          <!-- Background Icon -->
          <div class="absolute top-2 right-2 opacity-10">
            <span class="star">★</span>
          </div>
          
          <div class="flex items-center mb-4 relative z-10">
            <div class="p-2 border-2 border-yellow-400 rounded mr-4">
              <span class="star text-yellow-400">★</span>
            </div>
            <div>
              <h3 class="text-2xl font-black uppercase">Timeline</h3>
              <div class="h-1 w-12 bg-yellow-400 mt-1"></div>
            </div>
          </div>
          
          <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10">
            Explore the complete Star Wars chronology
          </p>
          
          <a href="{{ 'star-wars-timeline' | relative_url }}" class="btn w-full mt-4">
            <span class="rocket mr-2">🚀</span>
            LAUNCH TIMELINE
          </a>
        </div>

        <!-- Comics Card -->
        <div class="card border-blue-400">
          <!-- Background Icon -->
          <div class="absolute top-2 right-2 opacity-10">
            <span class="book">📖</span>
          </div>
          
          <div class="flex items-center mb-4 relative z-10">
            <div class="p-2 border-2 border-blue-400 rounded mr-4">
              <span class="book text-blue-400">📖</span>
            </div>
            <div>
              <h3 class="text-2xl font-black uppercase">Comics</h3>
              <div class="h-1 w-12 bg-blue-400 mt-1"></div>
            </div>
          </div>
          
          <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10">
            Dive into the expanded universe
          </p>
          
          <a href="{{ 'comics/star wars yoda/' | relative_url }}" class="btn w-full mt-4">
            <span class="rocket mr-2">🚀</span>
            LAUNCH COMICS
          </a>
        </div>

        <!-- SWordle Card -->
        <div class="card border-red-400">
          <!-- Background Icon -->
          <div class="absolute top-2 right-2 opacity-10">
            <span class="grid-icon">⊞</span>
          </div>
          
          <div class="flex items-center mb-4 relative z-10">
            <div class="p-2 border-2 border-red-400 rounded mr-4">
              <span class="grid-icon text-red-400">⊞</span>
            </div>
            <div>
              <h3 class="text-2xl font-black uppercase">SWordle</h3>
              <div class="h-1 w-12 bg-red-400 mt-1"></div>
            </div>
          </div>
          
          <p class="text-white opacity-70 text-sm uppercase tracking-wide mb-4 relative z-10">
            Star Wars themed word game
          </p>
          
          <a href="{{ 'swordle-star-wars-wordle' | relative_url }}" class="btn w-full mt-4">
            <span class="rocket mr-2">🚀</span>
            LAUNCH SWORDLE
          </a>
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
        NEWS & ANNOUNCEMENTS
        <div class="ml-4 flex space-x-1">
          <div class="w-2 h-2 bg-red-400 animate-pulse"></div>
          <div class="w-2 h-2 bg-yellow-400 animate-pulse" style="animation-delay: 0.2s;"></div>
          <div class="w-2 h-2 bg-blue-400 animate-pulse" style="animation-delay: 0.4s;"></div>
        </div>
      </h2>
      
      <div class="space-y-4">
        <!-- News Item 1 -->
        <div class="news-item">
          <!-- Background Pattern -->
          <div class="absolute top-0 right-0 opacity-5">
            <span class="shield" style="font-size: 120px;">🛡️</span>
          </div>
          
          <div class="flex justify-between items-start mb-2 relative z-10">
            <div class="flex items-center">
              <div class="news-icon">
                <span class="shield text-yellow-400">🛡️</span>
              </div>
              <h3 class="news-title">
                NEW MANDALORIAN SERIES ANNOUNCED
              </h3>
            </div>
            <span class="news-date">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              2024.06.20
            </span>
          </div>
          <p class="news-summary relative z-10">
            Disney reveals plans for new Mandalorian spinoff series focusing on Grogu's training
          </p>
        </div>

        <!-- News Item 2 -->
        <div class="news-item">
          <!-- Background Pattern -->
          <div class="absolute top-0 right-0 opacity-5">
            <span class="sword" style="font-size: 120px;">⚔️</span>
          </div>
          
          <div class="flex justify-between items-start mb-2 relative z-10">
            <div class="flex items-center">
              <div class="news-icon">
                <span class="sword text-yellow-400">⚔️</span>
              </div>
              <h3 class="news-title">
                KENOBI SEASON 2 CONFIRMED
              </h3>
            </div>
            <span class="news-date">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              2024.06.18
            </span>
          </div>
          <p class="news-summary relative z-10">
            Ewan McGregor returns as Obi-Wan Kenobi in highly anticipated second season
          </p>
        </div>

        <!-- News Item 3 -->
        <div class="news-item">
          <!-- Background Pattern -->
          <div class="absolute top-0 right-0 opacity-5">
            <span class="book" style="font-size: 120px;">📖</span>
          </div>
          
          <div class="flex justify-between items-start mb-2 relative z-10">
            <div class="flex items-center">
              <div class="news-icon">
                <span class="book text-yellow-400">📖</span>
              </div>
              <h3 class="news-title">
                COMIC TIMELINE UPDATE
              </h3>
            </div>
            <span class="news-date">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              2024.06.15
            </span>
          </div>
          <p class="news-summary relative z-10">
            Major updates to our Comics section with 50+ new High Republic issues
          </p>
        </div>
      </div>
      
      <a href="{{ 'star-wars-news' | relative_url }}" class="btn mt-6 bg-transparent border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wider text-lg px-8 py-4">
        <span class="external-link mr-2">🔗</span>
        VIEW ALL NEWS
      </a>
    </section>

    <!-- YouTube Section -->
    <section class="mb-16">
      <h2 class="text-4xl font-black text-white mb-8 border-l-8 border-yellow-400 pl-4 uppercase flex items-center">
        <span class="youtube mr-4 text-red-400">📺</span>
        YOUTUBE CHANNEL
      </h2>
      
      <div class="youtube-card">
        <!-- Background Graphics -->
        <div class="youtube-bg">
          <div class="youtube-bg-1">▶</div>
          <div class="youtube-bg-2">📺</div>
          <div class="youtube-bg-3">🎬</div>
        </div>
        
        <div class="flex items-center justify-between relative z-10">
          <div>
            <h3 class="youtube-title">
              <div class="w-4 h-4 bg-red-400 rounded-full mr-3 animate-pulse"></div>
              STARWARS.GUIDE OFFICIAL
            </h3>
            <p class="youtube-subtitle">
              <span class="star mr-2 text-yellow-400">★</span>
              DEEP DIVES // THEORIES // BREAKDOWNS
              <span class="star ml-2 text-yellow-400">★</span>
            </p>
            <p class="youtube-description">
              Subscribe for the latest Star Wars content and analysis
            </p>
          </div>
          <div class="relative">
            <span class="youtube-icon">📺</span>
            <div class="live-indicator">
              LIVE
            </div>
          </div>
        </div>
        
        <div class="flex gap-4 mt-6 relative z-10">
          <a href="https://www.youtube.com/@aurebeshfiles6312" class="btn bg-red-400 text-black hover:bg-red-300 font-black uppercase tracking-wider px-8 py-4">
            <span class="youtube mr-2">📺</span>
            SUBSCRIBE
          </a>
          <a href="https://www.youtube.com/@aurebeshfiles6312" class="btn border-red-400 text-red-400 hover:bg-red-400 hover:text-black font-black uppercase tracking-wider px-8 py-4">
            <span class="external-link mr-2">🔗</span>
            WATCH LATEST
          </a>
        </div>
      </div>
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
        © 2024 STARWARS.GUIDE // UNOFFICIAL FAN SITE // NOT AFFILIATED WITH DISNEY OR LUCASFILM
        <span class="star ml-2 text-yellow-400">★</span>
      </p>
    </div>
  </footer>
</div>

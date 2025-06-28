---
layout: page
title: "BLOG POSTS"
social-desc: "All Star Wars blog posts and updates from StarWars.Guide"
---

<div class="min-h-screen bg-black text-white font-mono relative overflow-hidden">
  <main class="max-w-6xl mx-auto p-6 relative">
    <div class="mb-16">
      <div class="space-y-4">
        {% for post in site.posts %}
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
              {% if post.tags contains 'YouTube' %}
                <i class="fas fa-tv text-yellow-400 mr-2"></i>
              {% elsif post.tags contains 'Comicbook' %}
                <i class="fas fa-book text-yellow-400 mr-2"></i>
              {% else %}
                <i class="fas fa-star text-yellow-400 mr-2"></i>
              {% endif %}
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
    </div>
    <div class="mt-8 text-center">
      <a href="{{ '/' | relative_url }}" class="btn bg-transparent border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wider text-lg px-8 py-4">
        <i class="fas fa-home mr-2"></i>
        BACK TO HOME
      </a>
    </div>
  </main>
</div> 
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
              <span class="youtube" style="font-size: 120px;">📺</span>
            {% elsif post.tags contains 'Comicbook' %}
              <span class="book" style="font-size: 120px;">📖</span>
            {% else %}
              <span class="star" style="font-size: 120px;">★</span>
            {% endif %}
          </div>
          
          <div class="mb-2 relative z-10">
            <div class="flex items-center">
              {% if post.tags contains 'YouTube' %}
                <span class="youtube text-yellow-400 mr-2">📺</span>
              {% elsif post.tags contains 'Comicbook' %}
                <span class="book text-yellow-400 mr-2">📖</span>
              {% else %}
                <span class="star text-yellow-400 mr-2">★</span>
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
              <span class="arrow mr-1">→</span>
              READ MORE
            </span>
          </div>
        </a>
        {% endfor %}
      </div>
    </div>
    <div class="mt-8 text-center">
      <a href="{{ '/' | relative_url }}" class="btn bg-transparent border-4 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wider text-lg px-8 py-4">
        <span class="home mr-2">🏠</span>
        BACK TO HOME
      </a>
    </div>
  </main>
</div> 
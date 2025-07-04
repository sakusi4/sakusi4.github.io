---
layout: default
---

<div class="posts">
  <h1>Posts</h1>
  <ul>
    {% for post in site.posts %}
      <li>
        <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
        <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </li>
    {% endfor %}
  </ul>
</div>

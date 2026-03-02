/* blog-renderer.js — Markdown to HTML renderer for blog posts */
(function () {

  /**
   * Parse YAML-ish frontmatter (--- delimited)
   * Returns { meta: {}, body: '' }
   */
  function parseFrontmatter(raw) {
    var meta = {};
    var body = raw;
    var match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (match) {
      match[1].split('\n').forEach(function (line) {
        var keyValuePair = line.match(/^(\w+):\s*(.+)$/);
        if (keyValuePair) meta[keyValuePair[1].trim()] = keyValuePair[2].trim();
      });
      body = match[2];
    }
    return { meta: meta, body: body };
  }

  /**
   * Minimal Markdown → HTML parser
   * Supports: headings, paragraphs, bold, italic, inline code,
   *           blockquotes, unordered lists, links, horizontal rules
   */
  function parseMarkdown(md) {
    var lines = md.split('\n');
    var html = '';
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      // Heading
      var hMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        var level = hMatch[1].length;
        html += '<h' + level + '>' + inlineMarkdown(hMatch[2]) + '</h' + level + '>\n';
        i++;
        continue;
      }

      // Horizontal rule
      if (/^[-*_]{3,}\s*$/.test(line)) {
        html += '<hr>\n';
        i++;
        continue;
      }

      // Blockquote
      if (/^>\s/.test(line)) {
        var bqContent = '';
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          bqContent += lines[i].replace(/^>\s?/, '') + ' ';
          i++;
        }
        html += '<blockquote>' + inlineMarkdown(bqContent.trim()) + '</blockquote>\n';
        continue;
      }

      // Unordered list
      if (/^[-*+]\s/.test(line)) {
        html += '<ul>\n';
        while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
          html += '<li>' + inlineMarkdown(lines[i].replace(/^[-*+]\s/, '')) + '</li>\n';
          i++;
        }
        html += '</ul>\n';
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Paragraph — collect consecutive non-empty, non-special lines
      var pContent = '';
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^#{1,6}\s/.test(lines[i]) &&
        !/^>\s/.test(lines[i]) &&
        !/^[-*+]\s/.test(lines[i]) &&
        !/^[-*_]{3,}\s*$/.test(lines[i])
      ) {
        pContent += (pContent ? ' ' : '') + lines[i];
        i++;
      }
      if (pContent) {
        html += '<p>' + inlineMarkdown(pContent) + '</p>\n';
      }
    }

    return html;
  }

  /** Inline markdown: bold, italic, inline code, links */
  function inlineMarkdown(text) {
    // Escape HTML first
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold: **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    return text;
  }

  /** Calculate rough reading time */
  function readingTime(text) {
    var wordCount = text.trim().split(/\s+/).length;
    var minutes = Math.ceil(wordCount / 200);
    return minutes + ' min read';
  }

  /** Main: load post from URL ?post=path/to/file.md */
  function loadPost() {
    var params = new URLSearchParams(window.location.search);
    var postPath = params.get('post');
    if (!postPath) {
      renderError('No post specified.');
      return;
    }

    fetch(postPath)
      .then(function (res) {
        if (!res.ok) throw new Error('Post not found: ' + postPath);
        return res.text();
      })
      .then(function (raw) {
        var parsed = parseFrontmatter(raw);
        var meta = parsed.meta;
        var bodyHTML = parseMarkdown(parsed.body);
        var time = meta.readTime || readingTime(parsed.body);

        renderPost(meta, bodyHTML, time);
      })
      .catch(function (err) {
        renderError(err.message);
      });
  }

  function renderPost(meta, bodyHTML, time) {
    var titleEl = document.getElementById('post-title');
    var dateEl = document.getElementById('post-date');
    var timeEl = document.getElementById('post-read-time');
    var bodyEl = document.getElementById('post-body');
    var pageTitle = document.getElementById('page-title');

    if (titleEl) titleEl.textContent = meta.title || 'Untitled';
    if (dateEl) dateEl.textContent = meta.date || '';
    if (timeEl) timeEl.textContent = time;
    if (bodyEl) bodyEl.innerHTML = bodyHTML;
    if (pageTitle) pageTitle.textContent = (meta.title || 'Post') + ' | With Love AJ';

    // Hero image
    if (meta.image) {
      var heroImg = document.getElementById('post-hero-img');
      if (heroImg) {
        heroImg.src = meta.image;
        heroImg.alt = meta.title || '';
        heroImg.style.display = 'block';
      }
    }
  }

  function renderError(msg) {
    var bodyEl = document.getElementById('post-body');
    if (bodyEl) bodyEl.innerHTML = '<p style="color:#888;">Error: ' + msg + '</p>';
  }

  document.addEventListener('DOMContentLoaded', loadPost);

})();

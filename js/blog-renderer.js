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

  /** Escape HTML special characters to prevent XSS */
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Slugify a heading string for use as an anchor id */
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-');
  }

  /**
   * Build a table of contents from heading tokens.
   * headings: array of { level, text, id }
   */
  function buildTOC(headings) {
    if (!headings.length) return '';
    var html = '<nav class="toc" aria-label="Table of contents"><ul>\n';
    headings.forEach(function (h) {
      html += '<li class="toc-h' + h.level + '"><a href="#' + h.id + '">' + escapeHTML(h.text) + '</a></li>\n';
    });
    html += '</ul></nav>\n';
    return html;
  }

  /**
   * Minimal Markdown → HTML parser
   * Supports: headings (with anchor ids), paragraphs, bold, italic,
   *           inline code, fenced code blocks, blockquotes,
   *           unordered lists, ordered lists, links, horizontal rules,
   *           and auto-generated table of contents.
   */
  function parseMarkdown(md) {
    var lines = md.split('\n');
    var html = '';
    var i = 0;
    var headings = [];

    while (i < lines.length) {
      var line = lines[i];

      // Fenced code block (``` or ~~~)
      var fenceMatch = line.match(/^(`{3}|~{3})(\S*)$/);
      if (fenceMatch) {
        var fence = fenceMatch[1];
        var lang = fenceMatch[2] || '';
        var codeContent = '';
        i++;
        while (i < lines.length && lines[i].indexOf(fence) !== 0) {
          codeContent += lines[i] + '\n';
          i++;
        }
        i++; // skip closing fence
        var langAttr = lang ? ' class="language-' + escapeHTML(lang) + '"' : '';
        html += '<pre><code' + langAttr + '>' + escapeHTML(codeContent) + '</code></pre>\n';
        continue;
      }

      // Heading
      var hMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        var level = hMatch[1].length;
        var headingText = hMatch[2];
        var id = slugify(headingText);
        headings.push({ level: level, text: headingText, id: id });
        html += '<h' + level + ' id="' + id + '">' + inlineMarkdown(headingText) + '</h' + level + '>\n';
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

      // Ordered list
      if (/^\d+\.\s/.test(line)) {
        html += '<ol>\n';
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          html += '<li>' + inlineMarkdown(lines[i].replace(/^\d+\.\s/, '')) + '</li>\n';
          i++;
        }
        html += '</ol>\n';
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
        !/^\d+\.\s/.test(lines[i]) &&
        !/^[-*_]{3,}\s*$/.test(lines[i]) &&
        !/^(`{3}|~{3})/.test(lines[i])
      ) {
        pContent += (pContent ? ' ' : '') + lines[i];
        i++;
      }
      if (pContent) {
        html += '<p>' + inlineMarkdown(pContent) + '</p>\n';
      }
    }

    // Prepend table of contents if there are headings
    if (headings.length) {
      html = buildTOC(headings) + html;
    }

    return html;
  }

  /** Inline markdown: bold, italic, inline code, links */
  function inlineMarkdown(text) {
    // Escape HTML first
    text = escapeHTML(text);

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
    if (bodyEl) bodyEl.innerHTML = '<p style="color:#888;">Error: ' + escapeHTML(msg) + '</p>';
  }

  document.addEventListener('DOMContentLoaded', loadPost);

})();

/* blog-renderer.js — Markdown renderer for blog-post.html
   Reads ?post=blog/filename.md, parses frontmatter + markdown, injects into DOM */
(function () {

  /* Reveal the page — called after content renders OR on error */
  function showPage() {
    document.body.style.opacity = '1';
  }

  /* Safety net: force-reveal after 2s so users never see a blank screen */
  var safetyTimer = setTimeout(showPage, 2000);

  /* ── FRONTMATTER PARSER ── */
  function parseFrontmatter(raw) {
    var meta = {};
    var body = raw;
    var match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (match) {
      match[1].split('\n').forEach(function (line) {
        var kv = line.match(/^(\w+):\s*(.+)$/);
        if (kv) meta[kv[1].trim()] = kv[2].trim();
      });
      body = match[2];
    }
    return { meta: meta, body: body };
  }

  /* ── MARKDOWN PARSER ──
     Supports: h1-h6, hr, blockquote, ul, ol, paragraphs,
               bold, italic, inline code, links */
  function parseMarkdown(md) {
    var lines = md.split('\n');
    var html  = '';
    var i     = 0;

    while (i < lines.length) {
      var line = lines[i];

      /* Heading */
      var hMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        var level = hMatch[1].length;
        html += '<h' + level + '>' + inline(hMatch[2]) + '</h' + level + '>\n';
        i++; continue;
      }

      /* Horizontal rule */
      if (/^[-*_]{3,}\s*$/.test(line)) {
        html += '<hr>\n'; i++; continue;
      }

      /* Blockquote — wraps content in <p> so CSS blockquote p selector works */
      if (/^>\s?/.test(line)) {
        var bq = '';
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          bq += lines[i].replace(/^>\s?/, '') + ' ';
          i++;
        }
        html += '<blockquote><p>' + inline(bq.trim()) + '</p></blockquote>\n';
        continue;
      }

      /* Unordered list */
      if (/^[-*+]\s/.test(line)) {
        html += '<ul>\n';
        while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
          html += '<li>' + inline(lines[i].replace(/^[-*+]\s/, '')) + '</li>\n';
          i++;
        }
        html += '</ul>\n'; continue;
      }

      /* Ordered list */
      if (/^\d+\.\s/.test(line)) {
        html += '<ol>\n';
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          html += '<li>' + inline(lines[i].replace(/^\d+\.\s/, '')) + '</li>\n';
          i++;
        }
        html += '</ol>\n'; continue;
      }

      /* Empty line */
      if (line.trim() === '') { i++; continue; }

      /* Paragraph */
      var p = '';
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^#{1,6}\s/.test(lines[i]) &&
        !/^>\s?/.test(lines[i]) &&
        !/^[-*+]\s/.test(lines[i]) &&
        !/^\d+\.\s/.test(lines[i]) &&
        !/^[-*_]{3,}\s*$/.test(lines[i])
      ) {
        p += (p ? ' ' : '') + lines[i];
        i++;
      }
      if (p) html += '<p>' + inline(p) + '</p>\n';
    }

    return html;
  }

  /* Inline formatting: links, code, bold, italic */
  function inline(text) {
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    return text;
  }

  /* Reading time estimate */
  function readingTime(text) {
    var words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200) + ' min read';
  }

  /* ── MAIN ── */
  function loadPost() {
    var params   = new URLSearchParams(window.location.search);
    var postPath = params.get('post');

    if (!postPath) {
      renderError('No post specified. Add ?post=blog/filename.md to the URL.');
      return;
    }

    fetch(postPath)
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load: ' + postPath + ' (' + res.status + ')');
        return res.text();
      })
      .then(function (raw) {
        var parsed   = parseFrontmatter(raw);
        var bodyHTML = parseMarkdown(parsed.body);
        var time     = parsed.meta.readTime || readingTime(parsed.body);
        renderPost(parsed.meta, bodyHTML, time);
      })
      .catch(function (err) {
        renderError(err.message);
        clearTimeout(safetyTimer);
        showPage();
      });
  }

  function renderPost(meta, bodyHTML, time) {
    var titleEl   = document.getElementById('post-title');
    var dateEl    = document.getElementById('post-date');
    var timeEl    = document.getElementById('post-read-time');
    var bodyEl    = document.getElementById('post-body');
    var pageTitleEl = document.getElementById('page-title');

    if (titleEl)    titleEl.textContent    = meta.title || 'Untitled';
    if (dateEl)     dateEl.textContent     = meta.date  || '';
    if (timeEl)     timeEl.textContent     = time;
    if (bodyEl)     bodyEl.innerHTML       = bodyHTML;
    if (pageTitleEl) pageTitleEl.textContent = (meta.title || 'Post') + ' | With Love AJ';

    /* Meta / Open Graph */
    var tempDiv   = document.createElement('div');
    tempDiv.innerHTML = bodyHTML;
    var plainText = (tempDiv.textContent || tempDiv.innerText || '').trim();
    var desc      = meta.description || plainText.split(/\s+/).slice(0, 30).join(' ') + '…';
    var url       = window.location.href;

    var setMeta = function (sel, val) {
      var el = document.querySelector(sel);
      if (el) el.setAttribute('content', val);
    };
    setMeta('meta[name="description"]',       desc);
    setMeta('meta[property="og:title"]',      (meta.title || 'Post') + ' | With Love AJ');
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:url"]',         url);

    /* Hero image */
    if (meta.image) {
      setMeta('meta[property="og:image"]', meta.image);
      var heroImg = document.getElementById('post-hero-img');
      if (heroImg) {
        heroImg.src          = meta.image;
        heroImg.alt          = meta.title || '';
        heroImg.style.display = 'block';
      }
    }

    /* ── Reveal page ── */
    clearTimeout(safetyTimer);
    showPage();
  }

  function renderError(msg) {
    var bodyEl = document.getElementById('post-body');
    if (bodyEl) bodyEl.innerHTML =
      '<p style="color:var(--muted,#888);font-family:monospace;font-size:.85rem;">⚠ ' + msg + '</p>';
  }

  document.addEventListener('DOMContentLoaded', loadPost);

})();

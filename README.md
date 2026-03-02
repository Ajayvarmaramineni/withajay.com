# withajay.com

Personal website of **Ajay Ramineni** — Analytics, Photography & Storytelling.

## Site Structure

```
withajay.com/
│
├── index.html              # Split-screen homepage
├── about.html              # About page
├── photos.html             # Photography gallery (masonry layout)
├── portfolio.html          # Portfolio & resume
├── blog.html               # Blog listing
├── blog-post.html          # Markdown blog post renderer
├── contact.html            # Contact form
│
├── blog/                   # Markdown blog posts
│   ├── the-night-i-questioned-everything.md
│   ├── the-night-i-started-accepting.md
│   └── niagara-in-the-mist.md
│
├── css/
│   ├── global.css          # Reset, variables, shared components
│   ├── home.css            # Split-screen homepage styles
│   ├── blog.css            # Blog listing styles
│   ├── photos.css          # Masonry gallery styles
│   ├── portfolio.css       # Portfolio page styles
│   └── responsive.css      # Mobile-first breakpoints
│
├── js/
│   ├── navigation.js       # Hamburger menu toggle
│   ├── blog-renderer.js    # Markdown → HTML renderer
│   ├── masonry.js          # Photo reveal after load
│   └── app.js              # Page fade-in, smooth scroll
│
├── Photos/                 # Photography images
├── Blog/                   # Blog images
└── images/                 # Site assets
```

## Features

- **Split-screen homepage** with dark/light panels linking to Photos and Portfolio
- **Hamburger navigation overlay** with slide-in panel (all pages)
- **Masonry photo gallery** using CSS columns with lightbox
- **Markdown blog system** — posts written in `.md`, rendered via `blog-renderer.js`
- **Minimalist portfolio** — clean white/black card layout
- **Responsive design** — mobile-first, breakpoints at 1200px and 768px
- **Google Fonts**: Playfair Display (headings) + Open Sans (body)

## Blog Posts

Blog posts live in the `blog/` directory as Markdown files with YAML frontmatter:

```markdown
---
title: Post Title
date: Month DD, YYYY
readTime: N min read
category: Category
image: ../Blog/image.jpg
---

Post content here...
```

Access any post at: `blog-post.html?post=blog/filename.md`

## Contact

**Ajay Varma Ramineni**
- Instagram: [@ajayvarmaramineni](https://www.instagram.com/ajayvarmaramineni)
- X: [@withloveeajay](https://x.com/withloveeajay)
- LinkedIn: [ajayramineni2808](https://www.linkedin.com/in/ajayramineni2808)
- GitHub: [Ajayvarmaramineni](https://github.com/Ajayvarmaramineni)

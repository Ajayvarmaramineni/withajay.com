# withajay.com

Personal website of **Ajay Ramineni** — Analytics, Photography & Storytelling.

## Site Structure

```
withajay.com/
│
├── index.html             
├── about.html              
├── photography.html        
├── photos.html             (redirects to photography.html)
├── portfolio.html          
├── blog.html               
├── blog-post.html          
├── contact.html            
│
├── blog/                   
│   ├── the-night-i-questioned-everything.md
│   ├── the-night-i-started-accepting.md
│   └── niagara-in-the-mist.md
│
├── css/
│   ├── global.css          
│   ├── home.css            
│   ├── blog.css            
│   ├── photos.css          
│   ├── portfolio.css       
│   └── responsive.css      
│
├── js/
│   ├── navigation.js       
│   ├── app.js              
│   ├── blog-renderer.js    
│   └── click-sound.js      
│
└── images/                 
```

## Features

- **Split-screen homepage** with dark/light panels linking to Photos and Portfolio
- **Hamburger navigation overlay** with slide-in panel (all pages)
- **Masonry photo gallery** using CSS columns with lightbox
- **Markdown blog system** — posts written in `.md`, rendered via `blog-renderer.js`
- **Minimalist portfolio** — clean white/black card layout
- **Responsive design** — mobile-first, breakpoints at 1200px and 768px
- **Google Fonts**: Playfair Display (headings) + Open Sans (body) + Bebas Neue (accents)

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

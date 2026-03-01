// blog.js

// Function to animate elements on the blog page
function animateBlogElements() {
    const elements = document.querySelectorAll('.blog-post');
    elements.forEach(element => {
        element.classList.add('fade-in');
    });
}

// Function to calculate reading time of the blog post
function calculateReadingTime(content) {
    const wordsPerMinute = 200; // Average reading speed
    const words = content.trim().split(/\\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
}

// Function to generate a table of contents
function generateTableOfContents() {
    const toc = document.getElementById('table-of-contents');
    const headings = document.querySelectorAll('h2, h3');
    headings.forEach(heading => {
        const anchor = document.createElement('a');
        anchor.href = `#${heading.id}`;
        anchor.textContent = heading.textContent;
        toc.appendChild(anchor);
    });
}

// Execute functions on load
document.addEventListener('DOMContentLoaded', () => {
    animateBlogElements();
    const content = document.querySelector('.blog-content').textContent;
    const readingTime = calculateReadingTime(content);
    document.getElementById('reading-time').textContent = `Read Time: ${readingTime} min`;
    generateTableOfContents();
});
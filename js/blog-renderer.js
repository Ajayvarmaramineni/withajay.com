// Enhanced Markdown Support

function renderMarkdown(markdown) {
    // Initialize variables
    const htmlContent = markdownToHtml(markdown);

    // Code blocks support
    const codeBlockPattern = /```(.*?)\n([\s\S]*?)```/g;
    const enhancedHtml = htmlContent.replace(codeBlockPattern, '<pre><code class="$1">$2</code></pre>');

    // Ordered lists support
    const orderedListPattern = /\d+\. (.*?)(?=\n\d+\.|\s*$)/g;
    const finalHtml = enhancedHtml.replace(orderedListPattern, '<ol><li>$1</li></ol>');

    return finalHtml;
}

function markdownToHtml(markdown) {
    // Placeholder for actual markdown to HTML conversion logic
    // This should include other markdown features as needed
    return escapeHtml(markdown);
}

function escapeHtml(html) {
    return html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
} 

// Example usage
const markdownInput = `# Example Title\n\n1. First item\n2. Second item\n\n```
console.log('Hello, world!')
```\n`;

console.log(renderMarkdown(markdownInput));
// Utility functions for performance optimization and common operations

// Function to debounce another function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Function to throttle another function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Function to deep clone an object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Function to format a date to YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Function to get a random integer between two values
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { debounce, throttle, deepClone, formatDate, getRandomInt };
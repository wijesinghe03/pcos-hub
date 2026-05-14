/**
 * PCOS CARE HUB — Theme Anti-FOUC Script (theme-init.js)
 * Must be loaded as the FIRST script in <head> (before any CSS or other JS).
 * Reads the saved theme from localStorage and applies it immediately to <html>
 * so the browser never renders in the wrong theme (no white flash).
 */
(function () {
  try {
    var saved = localStorage.getItem('pcos_theme') || 'auto';
    var theme = saved;
    if (saved === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Apply theme immediately before any rendering
    document.documentElement.setAttribute('data-theme', theme);

    // Suppress ALL CSS transitions during initial theme application
    // to prevent white → dark flash animation on page load
    document.documentElement.classList.add('no-transition');
    window.addEventListener('load', function () {
      // Use a double rAF to ensure the browser has painted once before re-enabling transitions
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.documentElement.classList.remove('no-transition');
        });
      });
    });
  } catch (e) {
    // localStorage not available — silently fail
  }
})();

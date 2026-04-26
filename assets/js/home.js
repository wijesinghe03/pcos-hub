// ============================================================
// HOME PAGE — home.js
// ============================================================

'use strict';

// Animated hero counter
document.addEventListener('DOMContentLoaded', () => {
  // Parallax blobs on mouse move
  const blobs = document.querySelectorAll('.hero-blob');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 0.4;
      blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });

  // Hero card float animation stagger
  document.querySelectorAll('.hero-card').forEach((card, i) => {
    card.style.animationDelay = `${0.8 + i * 0.2}s`;
    // add subtle float
    card.style.animation += `, float ${5 + i}s ease-in-out infinite ${i * 1.5}s`;
  });

  // Scroll to Top Button
  initScrollToTop();
});

// Scroll to Top functionality
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (!scrollToTopBtn) return;

  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  });

  // Scroll to top when button is clicked
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

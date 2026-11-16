// 1. Navigasi & indikator bab (scroll-spy)
document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * 1. NAVIGATION & SCROLL-SPY CHAPTER INDICATOR
   * ------------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });

  const sections = document.querySelectorAll('.chapter-section');
  const navPills = document.querySelectorAll('.nav-pill');
  const chapterDots = document.querySelectorAll('.chapter-dot');

  const updateActiveChapter = () => {
    let currentId = 'chapter-01';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) {
        currentId = sec.id;
      }
    });

    navPills.forEach(pill => {
      const isMatch = pill.dataset.nav === currentId;
      pill.classList.toggle('text-sky-300', isMatch);
      pill.classList.toggle('bg-sky-500/15', isMatch);
      pill.classList.toggle('text-slate-400', !isMatch);
    });

    chapterDots.forEach(dot => {
      const bar = dot.querySelector('.dot-bar');
      const isMatch = dot.dataset.dot === currentId;
      if (isMatch) {
        bar.className = 'dot-bar w-2.5 h-7 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] transition-all';
      } else {
        bar.className = 'dot-bar w-2 h-3 rounded-full bg-slate-600 group-hover:bg-sky-300 transition-all';
      }
    });
  };
  window.addEventListener('scroll', updateActiveChapter, { passive: true });
  updateActiveChapter();
});

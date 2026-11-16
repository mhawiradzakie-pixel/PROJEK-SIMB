// 6. Bab 05: saklar tampilan dualitas badai
document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * 6. CHAPTER 04: DUALITY OF STORMS VIEW SWITCHER
   * ------------------------------------------------------------------- */
  const dualityBtns = document.querySelectorAll('.duality-btn');
  const impactCol = document.getElementById('duality-impact-col');
  const healerCol = document.getElementById('duality-healer-col');

  dualityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.duality;
      dualityBtns.forEach(b => {
        b.className = b === btn
          ? 'duality-btn px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-500 text-abyss-950 transition'
          : 'duality-btn px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition';
      });

      if (mode === 'both') {
        impactCol.classList.remove('hidden', 'lg:col-span-12');
        impactCol.classList.add('lg:col-span-5');
        healerCol.classList.remove('hidden', 'lg:col-span-12');
        healerCol.classList.add('lg:col-span-7');
      } else if (mode === 'impact') {
        impactCol.classList.remove('hidden', 'lg:col-span-5');
        impactCol.classList.add('lg:col-span-12');
        healerCol.classList.add('hidden');
      } else {
        healerCol.classList.remove('hidden', 'lg:col-span-7');
        healerCol.classList.add('lg:col-span-12');
        impactCol.classList.add('hidden');
      }
    });
  });
});

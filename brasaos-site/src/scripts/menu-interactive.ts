import { loadCart, saveCart } from './cart';

function cartDelta(id: string, delta: number) {
  const c = loadCart();
  const cur = c[id] ?? 0;
  const next = Math.max(0, cur + delta);
  if (next === 0) delete c[id];
  else c[id] = next;
  saveCart(c);
  window.dispatchEvent(new CustomEvent('brasaos-cart'));
}

function cartTotalQty(): number {
  const c = loadCart();
  return Object.values(c).reduce((a, b) => a + b, 0);
}

let lastToastCount = cartTotalQty();
let toastHideTimer: ReturnType<typeof setTimeout> | undefined;

function flashToast() {
  const toast = document.getElementById('menu-toast');
  if (!toast) return;
  toast.classList.remove('pointer-events-none', 'opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');
  window.clearTimeout(toastHideTimer);
  toastHideTimer = window.setTimeout(() => {
    toast.classList.add('pointer-events-none', 'opacity-0', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 2400);
}

function syncMenuSteppers() {
  const cart = loadCart();
  document.querySelectorAll<HTMLElement>('.menu-item-row').forEach((row) => {
    const id = row.dataset.itemId;
    if (!id) return;
    const qty = cart[id] ?? 0;
    const stepper = row.querySelector<HTMLElement>('[data-menu-stepper]');
    const addBtn = row.querySelector<HTMLElement>('[data-menu-add]');
    const qtyEl = row.querySelector<HTMLElement>('[data-menu-qty]');
    if (!stepper || !addBtn || !qtyEl) return;
    qtyEl.textContent = String(Math.max(0, qty));
    if (qty > 0) {
      stepper.classList.remove('hidden');
      stepper.classList.add('inline-flex');
      addBtn.classList.add('hidden');
    } else {
      stepper.classList.add('hidden');
      stepper.classList.remove('inline-flex');
      addBtn.classList.remove('hidden');
    }
  });
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function runSearch(query: string) {
  const q = normalize(query.trim());
  const rows = document.querySelectorAll<HTMLElement>('.menu-item-row');
  const blocks = document.querySelectorAll<HTMLElement>('[data-menu-category]');
  const emptyEl = document.getElementById('menu-no-results');
  const rootEl = document.getElementById('menu-categories-root');
  const countEl = document.getElementById('menu-search-count');

  if (!q) {
    rows.forEach((row) => row.classList.remove('hidden'));
    blocks.forEach((block) => block.classList.remove('hidden'));
    emptyEl?.classList.add('hidden');
    rootEl?.classList.remove('hidden');
    countEl?.classList.add('hidden');
    return;
  }

  rows.forEach((row) => {
    const hay = row.dataset.search ?? '';
    const match = normalize(hay).includes(q);
    row.classList.toggle('hidden', !match);
  });

  blocks.forEach((block) => {
    const visible = Array.from(block.querySelectorAll<HTMLElement>('.menu-item-row')).some(
      (r) => !r.classList.contains('hidden')
    );
    block.classList.toggle('hidden', !visible);
  });

  const visibleRows = Array.from(rows).filter((r) => !r.classList.contains('hidden'));
  const any = visibleRows.length > 0;
  emptyEl?.classList.toggle('hidden', any);
  rootEl?.classList.toggle('hidden', !any);

  if (countEl) {
    countEl.textContent = `${visibleRows.length} resultado${visibleRows.length === 1 ? '' : 's'}`;
    countEl.classList.remove('hidden');
  }
}

function setupSearch() {
  const input = document.getElementById('menu-search') as HTMLInputElement | null;
  const clear = document.getElementById('menu-search-clear');
  if (!input) return;

  let t: ReturnType<typeof setTimeout>;
  input.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      runSearch(input.value);
      clear?.classList.toggle('hidden', !input.value.trim());
    }, 100);
  });

  clear?.addEventListener('click', () => {
    input.value = '';
    runSearch('');
    clear.classList.add('hidden');
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      runSearch('');
      clear?.classList.add('hidden');
    }
  });
}

function setupCategoryObserver() {
  const pills = document.querySelectorAll<HTMLAnchorElement>('.menu-cat-pill');
  const sections = document.querySelectorAll<HTMLElement>('[data-menu-category]');
  if (!sections.length || !pills.length) return;

  const setActive = (slug: string | null) => {
    pills.forEach((p) => {
      const active = !!(slug && p.dataset.slug === slug);
      p.setAttribute('aria-current', active ? 'true' : 'false');
      p.classList.toggle('border-amber-500', active);
      p.classList.toggle('bg-amber-50', active);
      p.classList.toggle('ring-1', active);
      p.classList.toggle('ring-amber-500/30', active);
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      const hit = entries
        .filter((e) => e.isIntersecting && e.intersectionRatio > 0)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit?.target) {
        const slug = (hit.target as HTMLElement).dataset.menuCategory ?? null;
        setActive(slug);
      }
    },
    { root: null, rootMargin: '-18% 0px -52% 0px', threshold: [0, 0.05, 0.15, 0.25] }
  );

  sections.forEach((s) => io.observe(s));
}

function setupToolbarScroll() {
  const toolbar = document.getElementById('menu-toolbar');
  const section = document.getElementById('menu');
  if (!toolbar || !section) return;

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const past = rect.top < 72;
    toolbar.classList.toggle('shadow-md', past);
    toolbar.classList.toggle('ring-1', past);
    toolbar.classList.toggle('ring-stone-200/80', past);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function bindSteppersAndAdd() {
  document.querySelectorAll<HTMLButtonElement>('[data-menu-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) cartDelta(id, 1);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.menu-qty-dec').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) cartDelta(id, -1);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.menu-qty-inc').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) cartDelta(id, 1);
    });
  });
}

function init() {
  syncMenuSteppers();
  setupSearch();
  setupCategoryObserver();
  setupToolbarScroll();
  bindSteppersAndAdd();

  window.addEventListener('brasaos-cart', () => {
    syncMenuSteppers();
    const now = cartTotalQty();
    if (now > lastToastCount) flashToast();
    lastToastCount = now;
  });
}

init();

import { loadCart, saveCart } from './cart';
import type { MenuCategory, MenuItem } from './cart';
import menu from '../data/menu.json';

const menuData = menu as MenuCategory[];

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

function findItem(id: string): { item: MenuItem; category: string } | null {
  for (const cat of menuData) {
    const item = cat.items.find((i) => i.id === id);
    if (item) return { item, category: cat.category };
  }
  return null;
}

function escapeHtml(s: string) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function setupItemDialog() {
  const dialog = document.getElementById('menu-item-dialog') as HTMLDialogElement | null;
  const imgWrap = document.getElementById('menu-dialog-image-wrap');
  const catEl = document.getElementById('menu-dialog-category');
  const titleEl = document.getElementById('menu-dialog-title');
  const priceEl = document.getElementById('menu-dialog-price');
  const descEl = document.getElementById('menu-dialog-desc');
  const btnClose = document.getElementById('menu-dialog-close');
  const btnClose2 = document.getElementById('menu-dialog-close-secondary');
  const btnAdd = document.getElementById('menu-dialog-add');
  if (!dialog || !imgWrap || !catEl || !titleEl || !priceEl || !descEl || !btnAdd) return;

  function openForId(id: string) {
    const found = findItem(id);
    if (!found) return;
    const { item, category } = found;

    catEl.textContent = category;
    titleEl.textContent = item.name;
    priceEl.textContent = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(item.price);
    descEl.innerHTML = item.description
      ? escapeHtml(item.description).replace(/\n/g, '<br>')
      : '<span class="text-stone-400">Sin descripción adicional.</span>';

    if (item.image) {
      imgWrap.innerHTML = `<img src="${escapeHtml(item.image)}" alt="" class="h-full w-full object-cover" width="640" height="400" loading="eager" decoding="async" />`;
    } else {
      imgWrap.innerHTML =
        '<div class="flex h-full min-h-[160px] items-center justify-center bg-stone-200 text-stone-400">Sin foto</div>';
    }

    btnAdd.dataset.id = id;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  }

  document.querySelectorAll<HTMLButtonElement>('[data-menu-open]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.menuOpen;
      if (id) openForId(id);
    });
  });

  function closeDialog() {
    dialog.close();
  }

  btnClose?.addEventListener('click', closeDialog);
  btnClose2?.addEventListener('click', closeDialog);

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog();
  });

  btnAdd.addEventListener('click', () => {
    const id = btnAdd.dataset.id;
    if (id) {
      cartDelta(id, 1);
      closeDialog();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.open) closeDialog();
  });
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
    blocks.forEach((block) => {
      block.classList.remove('hidden');
      if (block instanceof HTMLDetailsElement) {
        block.open = block.dataset.menuDefaultOpen === 'true';
      }
    });
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
    if (block instanceof HTMLDetailsElement) {
      block.open = visible;
    }
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

/** Estado inicial de cada <details> (para restaurar al limpiar búsqueda) */
function markDefaultOpenDetails() {
  document.querySelectorAll<HTMLDetailsElement>('.menu-category-details').forEach((d) => {
    d.dataset.menuDefaultOpen = d.open ? 'true' : 'false';
  });
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
  markDefaultOpenDetails();
  syncMenuSteppers();
  setupSearch();
  setupItemDialog();
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

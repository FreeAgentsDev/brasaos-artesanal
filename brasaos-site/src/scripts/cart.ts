export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  /** URL en CDN de Foodbooking (fbgcdn.com), misma fuente que el menú embebido */
  image?: string;
  foodbookingItemId?: string;
};

export type MenuCategory = {
  category: string;
  categoryDescription: string;
  /** Imagen destacada de la categoría (banner lateral en desktop) */
  categoryImage?: string;
  items: MenuItem[];
};

const STORAGE_KEY = 'brasaos-cart-v1';

export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function loadCart(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCart(cart: Record<string, number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function buildItemMap(menu: MenuCategory[]): Map<string, MenuItem> {
  const m = new Map<string, MenuItem>();
  for (const cat of menu) {
    for (const item of cat.items) {
      m.set(item.id, item);
    }
  }
  return m;
}

export function cartLines(
  cart: Record<string, number>,
  items: Map<string, MenuItem>
): { item: MenuItem; qty: number; subtotal: number }[] {
  const lines: { item: MenuItem; qty: number; subtotal: number }[] = [];
  for (const [id, qty] of Object.entries(cart)) {
    if (qty < 1) continue;
    const item = items.get(id);
    if (!item) continue;
    lines.push({ item, qty, subtotal: item.price * qty });
  }
  return lines.sort((a, b) => a.item.name.localeCompare(b.item.name, 'es'));
}

export function cartTotal(lines: { subtotal: number }[]): number {
  return lines.reduce((s, l) => s + l.subtotal, 0);
}

export function buildOrderMessage(
  lines: { item: MenuItem; qty: number; subtotal: number }[],
  restaurantName: string
): string {
  const parts: string[] = [
    `Hola ${restaurantName}, quiero pedir:`,
    '',
  ];
  for (const { item, qty, subtotal } of lines) {
    parts.push(`• ${qty}× ${item.name} — ${formatCOP(subtotal)}`);
  }
  parts.push('', `Total: ${formatCOP(cartTotal(lines))}`);
  parts.push('', '(Pedido generado desde la web)');
  return parts.join('\n');
}

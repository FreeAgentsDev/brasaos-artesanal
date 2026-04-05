/** Datos de contacto y enlaces (opcional: PUBLIC_WHATSAPP_E164 en .env para otro número). */
const WA_FROM_TEL = '573218902971';
const waEnv = (import.meta.env.PUBLIC_WHATSAPP_E164 as string | undefined)?.trim();
const whatsappE164Resolved =
  waEnv && /^\d{10,15}$/.test(waEnv) ? waEnv : WA_FROM_TEL;

const RESERVATION_WA_TEXT =
  'Hola 👋 Quiero hacer una reserva en Brasaos Artesana. Fecha, hora y número de personas: ';

export const SITE = {
  name: 'Brasaos Artesana',
  /** Logo oficial (PNG) */
  logoUrl: '/brand/brasaos-artesana-logo.png',
  tagline: 'Pizza artesanal en horno · Manizales',
  city: 'Manizales',
  neighborhood: 'La Estrella',
  /** Dirección según ficha de Google Maps */
  addressLine:
    'Cra. 24A # 59-67, Ed. Portal Estrella, Local 1, Manizales, Caldas',
  /** Teléfono mostrado y enlace tel: (57 + celular sin 0 inicial) */
  phoneDisplay: '321 890 2971',
  phoneTel: '+573218902971',
  instagramUrl: 'https://www.instagram.com/brasaosartesana/',
  /** Mensaje prellenado para reservas por WhatsApp */
  whatsappReservationText: RESERVATION_WA_TEXT,
  /** Enlace wa.me para solicitar mesa */
  whatsappReservationUrl: `https://wa.me/${whatsappE164Resolved}?text=${encodeURIComponent(RESERVATION_WA_TEXT)}`,
  /** Enlace a la ficha en Google Maps (búsqueda del lugar) */
  googleMapsPlaceUrl:
    'https://www.google.com/maps/search/?api=1&query=Brasaos+Artesana+Cra.+24A+59-67+Manizales+Caldas',
  /** iframe embed oficial (mismo lugar que la ficha de Google) */
  googleMapsEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.267992019329!2d-75.488875!3d5.0602504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4765f99e81bffd%3A0x3f05e0263877a1c8!2sBrasaos%20Artesana!5e0!3m2!1ses!2sco!4v1775341358471!5m2!1ses!2sco',
  /** Resumen de reseñas públicas en Google (referencia; puede variar con el tiempo) */
  googleReviews: {
    rating: 4.7,
    reviewCount: 165,
    priceNote: 'Rango estimado en Google: $20.000 – $40.000 COP por persona',
    /** Temas que más nombran los usuarios en la ficha */
    highlights: ['sabor', 'precios', 'música', 'artesanal'] as const,
    testimonials: [
      {
        author: 'Leslie Lorena',
        stars: 5,
        text: 'La pizza Margarita estaba deliciosa; los tomates con mucho sabor. A mi esposo le encantó todo lo que traía la pizza.',
      },
      {
        author: 'Manuela Gaviria Moncada',
        stars: 4,
        text: 'Probé “la pecadora” y la pizza de la casa: una combinación de sabores interesante, con miel entre los ingredientes.',
      },
    ] as const,
  },
  /** Número E.164 sin + para wa.me; por defecto coincide con phoneTel */
  whatsappE164: whatsappE164Resolved,
  hours: [
    { days: 'Lunes a sábado', time: '4:00 p. m. – 10:00 p. m.' },
    { days: 'Domingos y festivos', time: '4:00 p. m. – 9:00 p. m.' },
  ],
} as const;

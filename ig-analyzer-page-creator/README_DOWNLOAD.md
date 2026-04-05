# 📥 Guía de Descarga de Imágenes de Instagram

## 🎯 Funcionalidad

El script `instagram_analyzer.py` ahora incluye un **web scraper** que descarga imágenes de los posts de Instagram y las guarda en la carpeta `img/`.

## 📋 Uso

### Descargar imágenes de un perfil

```bash
# Activar entorno virtual
source venv/bin/activate

# Descargar imágenes (usando flag -d o --download)
python instagram_analyzer.py merchmorbosa -d

# O con el nombre completo del flag
python instagram_analyzer.py merchmorbosa --download
```

### Especificar directorio de salida

```bash
# Guardar imágenes en otro directorio
python instagram_analyzer.py merchmorbosa -d -o mis_imagenes
```

### Solo analizar sin descargar

```bash
# Análisis normal sin descarga
python instagram_analyzer.py merchmorbosa
```

## 📁 Estructura de Archivos

Las imágenes se guardan con el siguiente formato:

```
img/
├── merchmorbosa_ABC123.jpg          # Post individual
├── merchmorbosa_XYZ789_1.jpg        # Primer imagen de sidecar
├── merchmorbosa_XYZ789_2.jpg        # Segunda imagen de sidecar
└── merchmorbosa_DEF456_3.jpg        # Tercera imagen de sidecar
```

**Formato de nombre:**
- `{username}_{shortcode}.jpg` - Para posts con una sola imagen
- `{username}_{shortcode}_{número}.jpg` - Para posts con múltiples imágenes (sidecar)

## ⚙️ Opciones Disponibles

```
python instagram_analyzer.py [username] [opciones]

Opciones:
  -d, --download     Descargar imágenes de los posts
  -o, --output DIR   Directorio para guardar imágenes (default: img)
  -h, --help         Mostrar ayuda
```

## 📊 Información Descargada

El script descarga:
- ✅ **Imágenes de posts individuales** (GraphImage)
- ✅ **Múltiples imágenes de sidecars** (GraphSidecar)
- ❌ **No descarga videos** (se omiten automáticamente)

## 📈 Límites

- **Posts analizados**: Últimos 12 posts del perfil
- **Solo perfiles públicos**: No funciona con perfiles privados
- **Tamaño de imágenes**: Descarga en calidad original

## 🔍 Ejemplo de Salida

```bash
$ python instagram_analyzer.py merchmorbosa -d

🔍 Analizando y descargando imágenes de: @merchmorbosa...

============================================================
📊 ANÁLISIS DE PERFIL DE INSTAGRAM
============================================================

👤 Usuario: @merchmorbosa
📝 Nombre completo: MerchMorbosa
...

📱 Últimas 12 publicaciones:

   1. GraphSidecar
      🔗 https://www.instagram.com/p/DKKjD3iuqkY/
      ❤️  2,397 likes | 💬 32 comentarios
      📅 2025-05-27
      📸 Imágenes descargadas: 3
      📝 El 25 por ciento de ganancias...

  ✅ Descargada: merchmorbosa_DKKjD3iuqkY_1.jpg
  ✅ Descargada: merchmorbosa_DKKjD3iuqkY_2.jpg
  ✅ Descargada: merchmorbosa_DKKjD3iuqkY_3.jpg
  ...

📥 Total de imágenes descargadas: 24
📁 Guardadas en: img
```

## 🛠️ Requisitos

Las dependencias necesarias están en `requirements.txt`:

```bash
pip install -r requirements.txt
```

Dependencias:
- `instaloader>=4.10` - Para acceder a Instagram
- `requests>=2.31.0` - Para descargar imágenes

## ⚠️ Limitaciones y Notas

1. **Rate Limiting**: Instagram puede limitar solicitudes si descargas muchas imágenes muy rápido
2. **Permisos**: Solo funciona con perfiles públicos
3. **Videos**: Los videos no se descargan (solo imágenes)
4. **Términos de uso**: Asegúrate de respetar los términos de servicio de Instagram
5. **Derechos de autor**: Las imágenes pertenecen a sus respectivos dueños

## 🔄 Actualización de Imágenes

Para actualizar las imágenes de un perfil:

```bash
# Eliminar imágenes anteriores (opcional)
rm -rf img/merchmorbosa_*

# Descargar nuevas imágenes
python instagram_analyzer.py merchmorbosa -d
```

## 📝 Integración con la Página Web

Las imágenes descargadas en `img/` pueden ser usadas directamente en la página web de Next.js:

```typescript
// En data/products.ts o componentes
import imagenGorra from '@/img/merchmorbosa_ABC123.jpg';
```

O referenciarlas directamente:

```typescript
image: "/img/merchmorbosa_ABC123.jpg"
```

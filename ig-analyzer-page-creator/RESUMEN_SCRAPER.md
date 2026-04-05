# ✅ Web Scraper de Instagram - Implementado

## 🎉 Funcionalidad Añadida

Se ha implementado exitosamente un **web scraper** en el script `instagram_analyzer.py` que descarga imágenes de los posts de Instagram y las guarda en la carpeta `img/`.

## 📊 Resultados de la Prueba

✅ **70 imágenes descargadas** del perfil `@merchmorbosa`
✅ Todas las imágenes guardadas en `img/` con formato organizado
✅ Funciona correctamente con posts individuales y sidecars (múltiples imágenes)

## 🚀 Cómo Usar

### Comando Básico
```bash
source venv/bin/activate
python instagram_analyzer.py merchmorbosa -d
```

### Opciones Disponibles
```bash
# Solo analizar (sin descargar)
python instagram_analyzer.py merchmorbosa

# Descargar imágenes
python instagram_analyzer.py merchmorbosa -d

# Especificar directorio de salida
python instagram_analyzer.py merchmorbosa -d -o mis_imagenes

# Ver ayuda
python instagram_analyzer.py -h
```

## 📁 Estructura de Archivos Descargados

Las imágenes se guardan con nombres descriptivos:

```
img/
├── merchmorbosa_DKKjD3iuqkY_1.jpg    # Primera imagen del post DKKjD3iuqkY
├── merchmorbosa_DKKjD3iuqkY_2.jpg    # Segunda imagen del post
├── merchmorbosa_DST4csvlRv7.jpg      # Post con imagen única
└── ...
```

**Formato:**
- `{username}_{shortcode}.jpg` - Posts con una sola imagen
- `{username}_{shortcode}_{número}.jpg` - Posts con múltiples imágenes

## 🔧 Características Técnicas

- ✅ Descarga imágenes en calidad original
- ✅ Soporta posts individuales (GraphImage)
- ✅ Soporta múltiples imágenes (GraphSidecar)
- ✅ Omite videos automáticamente
- ✅ Manejo de errores robusto
- ✅ Muestra progreso de descarga
- ✅ Guarda metadatos en JSON

## 📈 Límites y Configuración

- **Posts analizados**: Últimos 12 posts del perfil
- **Solo perfiles públicos**: No funciona con perfiles privados
- **Tiempo de descarga**: Depende de la cantidad de imágenes (promedio ~2-3 minutos)

## 📝 Archivos Modificados

1. **`instagram_analyzer.py`**
   - Añadida funcionalidad de descarga de imágenes
   - Nuevos métodos: `download_post_images()` y `_download_image()`
   - Argumentos de línea de comandos (`-d`, `--download`, `-o`, `--output`)

2. **`requirements.txt`**
   - Añadida dependencia `requests>=2.31.0`

3. **`README_DOWNLOAD.md`**
   - Documentación completa de la funcionalidad

## 🔗 Integración con Next.js

Las imágenes descargadas pueden ser usadas directamente en la página web:

```typescript
// En data/products.ts
{
  image: "/img/merchmorbosa_DST4csvlRv7.jpg"
}
```

O importarlas:

```typescript
import gorraImage from '@/img/merchmorbosa_DST4csvlRv7.jpg';
```

## ⚠️ Notas Importantes

1. **Respetar términos de servicio**: Asegúrate de cumplir con los TOS de Instagram
2. **Derechos de autor**: Las imágenes pertenecen a sus respectivos propietarios
3. **Rate limiting**: Instagram puede limitar solicitudes si se abusa
4. **Uso responsable**: Usa esta herramienta de manera ética y legal

## 🎯 Próximos Pasos Sugeridos

1. Usar las imágenes descargadas en la página web de Next.js
2. Actualizar `data/products.ts` con las imágenes reales
3. Configurar actualización automática (opcional)
4. Optimizar imágenes para web (compresión, formato WebP, etc.)

## 📚 Documentación Adicional

Ver `README_DOWNLOAD.md` para documentación completa y ejemplos detallados.

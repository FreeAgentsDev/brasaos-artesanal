# 📊 Instagram Profile Analyzer

Herramienta completa para analizar perfiles públicos de Instagram, descargar imágenes de posts y generar reportes detallados.

## 🎯 Características

- ✅ Análisis completo de perfiles públicos de Instagram
- ✅ Descarga de imágenes de posts (últimos 12 posts)
- ✅ Exportación de datos en formato JSON
- ✅ Identificación automática de productos en posts
- ✅ Análisis de estadísticas y métricas
- ✅ Soporte para posts individuales y sidecars (múltiples imágenes)

## 📦 Instalación

1. Crea y activa un entorno virtual (recomendado):

```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instala las dependencias:

```bash
pip install -r requirements.txt
```

## 🚀 Uso

### Análisis básico

```bash
python instagram_analyzer.py username
```

Ejemplo:
```bash
python instagram_analyzer.py merchmorbosa
```

### Descargar imágenes

```bash
python instagram_analyzer.py username -d
# o
python instagram_analyzer.py username --download
```

### Opciones avanzadas

```bash
# Especificar directorio de salida
python instagram_analyzer.py username -d -o output_dir

# Ver ayuda
python instagram_analyzer.py -h
```

## 📋 Scripts Adicionales

### Identificar productos en imágenes

```bash
python identify_products.py
```

Analiza los archivos JSON generados para identificar productos específicos (MIPA, MALA, MAMA, etc.) basándose en keywords en los captions.

### Analizar imágenes de productos

```bash
python analyze_product_images.py
```

Genera un reporte de qué imágenes pertenecen a cada producto identificado.

## 📁 Estructura

```
instagram-analyzer/
├── instagram_analyzer.py    # Script principal
├── identify_products.py     # Identificador de productos
├── analyze_product_images.py # Analizador de imágenes
├── requirements.txt          # Dependencias Python
├── venv/                     # Entorno virtual (opcional)
├── *_analysis.json          # Archivos de análisis generados
└── README.md                # Este archivo
```

## 📊 Formato de Salida

El script genera un archivo JSON con la siguiente estructura:

```json
{
  "username": "merchmorbosa",
  "full_name": "MerchMorbosa",
  "biography": "...",
  "followers": 1710,
  "followees": 324,
  "posts_count": 36,
  "posts": [
    {
      "shortcode": "ABC123",
      "url": "https://www.instagram.com/p/ABC123/",
      "caption": "...",
      "likes": 1234,
      "comments": 56,
      "timestamp": "2025-12-20T...",
      "image_urls": ["img/merchmorbosa_ABC123_1.jpg", ...]
    }
  ],
  "downloaded_images_count": 70,
  "images_directory": "public/img"
}
```

## 🔧 Requisitos

- Python 3.8+
- instaloader>=4.10
- requests>=2.31.0

## ⚠️ Limitaciones

- Solo funciona con perfiles **públicos**
- Los perfiles privados solo mostrarán información básica
- Instagram puede limitar solicitudes excesivas (rate limiting)
- Requiere conexión a internet

## 📚 Documentación Adicional

- `README_DOWNLOAD.md` - Guía detallada de descarga de imágenes
- `RESUMEN_SCRAPER.md` - Resumen de la funcionalidad de scraper

## 🔗 Uso del Analyzer en Otros Proyectos

Este analyzer puede ser usado como módulo en otros proyectos:

```python
from instagram_analyzer import InstagramAnalyzer

analyzer = InstagramAnalyzer(download_images=True, output_dir="images")
analysis = analyzer.analyze_profile("username")
```

## 📝 Notas

- Respeta los términos de servicio de Instagram
- Las imágenes descargadas pertenecen a sus respectivos propietarios
- Usa esta herramienta de manera ética y legal
- No se requiere iniciar sesión para perfiles públicos

## 🤝 Contribuciones

Este es un proyecto independiente que puede ser útil para análisis de perfiles de Instagram. Las mejoras y contribuciones son bienvenidas.


#!/usr/bin/env python3
"""
Analiza las imágenes descargadas para identificar productos específicos
"""

import json
import os
from pathlib import Path

def analyze_images():
    """Analiza posts e imágenes para identificar productos"""
    
    with open('merchmorbosa_analysis.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    products_images = {
        'MIPA': [],
        'MALA': [],
        'MAMA': []
    }
    
    # Keywords para identificar productos
    keywords = {
        'MIPA': ['MIPA', 'Make Israel Palestina', 'Israel Palestina', 'Palestina', 'anti sionista'],
        'MALA': ['MALA', 'Make América Latina Again', 'América Latina'],
        'MAMA': ['MAMA', 'Make América México Again', 'México Again', 'verde guerrill']
    }
    
    for post in data.get('posts', []):
        caption = post.get('caption', '').lower()
        shortcode = post.get('shortcode', '')
        images = post.get('image_urls', [])
        
        # Identificar qué productos menciona el post
        post_products = set()
        for product, product_keywords in keywords.items():
            for keyword in product_keywords:
                if keyword.lower() in caption:
                    post_products.add(product)
                    break
        
        # Asignar imágenes a productos identificados
        if images:
            for product in post_products:
                # Agregar todas las imágenes del post a ese producto
                for img_path in images:
                    if img_path not in [item['image'] for item in products_images[product]]:
                        products_images[product].append({
                            'image': img_path,
                            'shortcode': shortcode,
                            'caption_preview': caption[:80]
                        })
    
    return products_images

if __name__ == "__main__":
    images_by_product = analyze_images()
    
    print("=" * 70)
    print("ANÁLISIS DE IMÁGENES POR PRODUCTO")
    print("=" * 70)
    
    for product, images in images_by_product.items():
        print(f"\n🎯 {product}:")
        print(f"   Total de imágenes: {len(images)}")
        for i, img_info in enumerate(images, 1):
            filename = Path(img_info['image']).name
            print(f"   {i}. {filename} (Post: {img_info['shortcode']})")
            print(f"      Preview: {img_info['caption_preview']}...")
    
    print("\n" + "=" * 70)

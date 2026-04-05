#!/usr/bin/env python3
"""
Script para identificar imágenes de productos específicos basándose en los posts de Instagram
"""

import json
import re
from pathlib import Path

def identify_product_images(analysis_file: str = "merchmorbosa_analysis.json"):
    """Identifica imágenes de productos MIPA, MALA y MAMA"""
    
    with open(analysis_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    products = {
        'MIPA': {'keywords': ['MIPA', 'Make Israel Palestina', 'anti sionista', 'Palestina'], 'images': []},
        'MALA': {'keywords': ['MALA', 'Make América Latina Again', 'América Latina'], 'images': []},
        'MAMA': {'keywords': ['MAMA', 'Make América México Again', 'México Again', 'verde guerrill'], 'images': []},
    }
    
    for post in data.get('posts', []):
        caption = post.get('caption', '').lower()
        shortcode = post.get('shortcode', '')
        images = post.get('image_urls', [])
        
        # Identificar productos por keywords en el caption
        for product_name, product_data in products.items():
            for keyword in product_data['keywords']:
                if keyword.lower() in caption:
                    # Agregar la primera imagen del post (la más representativa)
                    if images and images[0] not in product_data['images']:
                        product_data['images'].append({
                            'shortcode': shortcode,
                            'image': images[0],
                            'caption_preview': caption[:100]
                        })
                    break
    
    return products

if __name__ == "__main__":
    products = identify_product_images()
    
    print("=" * 60)
    print("PRODUCTOS IDENTIFICADOS")
    print("=" * 60)
    
    for product_name, product_data in products.items():
        print(f"\n🎯 {product_name}:")
        print(f"   Keywords: {', '.join(product_data['keywords'])}")
        print(f"   Imágenes encontradas: {len(product_data['images'])}")
        for img_info in product_data['images']:
            print(f"   - {img_info['image']} (Post: {img_info['shortcode']})")
    
    print("\n" + "=" * 60)

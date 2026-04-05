#!/usr/bin/env python3
"""
Analizador de perfiles de Instagram
Permite obtener y analizar información de perfiles públicos de Instagram
y descargar imágenes de los posts
"""

import instaloader
import json
from datetime import datetime
from typing import Dict, Any, List
import sys
import os
import shutil
from pathlib import Path


class InstagramAnalyzer:
    """Clase para analizar perfiles de Instagram"""
    
    def __init__(self, download_images: bool = False, output_dir: str = "img"):
        """
        Inicializa el analizador con instaloader
        
        Args:
            download_images: Si es True, descarga imágenes de los posts
            output_dir: Directorio donde guardar las imágenes descargadas
        """
        self.download_images = download_images
        self.output_dir = Path(output_dir)
        self.loader = instaloader.Instaloader(
            download_videos=False,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False
        )
        
        # Crear directorio de salida si se van a descargar imágenes
        if self.download_images:
            self.output_dir.mkdir(exist_ok=True)
    
    def analyze_profile(self, username: str) -> Dict[str, Any]:
        """
        Analiza un perfil de Instagram y retorna información estructurada
        
        Args:
            username: Nombre de usuario de Instagram (sin @)
            
        Returns:
            Diccionario con información del perfil
        """
        try:
            # Obtener el perfil
            profile = instaloader.Profile.from_username(self.loader.context, username)
            
            # Estructurar la información
            analysis = {
                "username": profile.username,
                "full_name": profile.full_name,
                "biography": profile.biography,
                "external_url": profile.external_url,
                "is_verified": profile.is_verified,
                "is_private": profile.is_private,
                "is_business_account": profile.is_business_account,
                "business_category_name": getattr(profile, 'business_category_name', None),
                "followers": profile.followers,
                "followees": profile.followees,
                "profile_pic_url": profile.profile_pic_url,
                "posts_count": profile.mediacount,
                "igtv_count": profile.igtvcount,
                "analyzed_at": datetime.now().isoformat(),
                "posts": []
            }
            
            # Si el perfil es público, obtener información de las publicaciones recientes
            if not profile.is_private:
                posts_info = []
                post_count = 0
                max_posts = 12  # Analizar las últimas 12 publicaciones
                downloaded_images = []
                
                for post in profile.get_posts():
                    if post_count >= max_posts:
                        break
                    
                    post_data = {
                        "shortcode": post.shortcode,
                        "url": f"https://www.instagram.com/p/{post.shortcode}/",
                        "caption": post.caption if post.caption else "",
                        "likes": post.likes,
                        "comments": post.comments,
                        "timestamp": post.date_utc.isoformat(),
                        "is_video": post.is_video,
                        "tagged_users": post.tagged_users,
                        "location": post.location.name if post.location else None,
                        "typename": post.typename,
                        "image_urls": []
                    }
                    
                    # Descargar imágenes si está habilitado
                    if self.download_images and not post.is_video:
                        post_images = self.download_post_images(post, username)
                        post_data["image_urls"] = post_images
                        downloaded_images.extend(post_images)
                    
                    posts_info.append(post_data)
                    post_count += 1
                
                analysis["posts"] = posts_info
                analysis["recent_posts_analyzed"] = post_count
                if self.download_images:
                    analysis["downloaded_images_count"] = len(downloaded_images)
                    analysis["images_directory"] = str(self.output_dir)
            else:
                analysis["note"] = "Perfil privado: no se puede acceder a las publicaciones"
            
            return analysis
            
        except instaloader.exceptions.ProfileNotExistsException:
            return {"error": f"El perfil '{username}' no existe"}
        except instaloader.exceptions.LoginRequiredException:
            return {"error": "Se requiere iniciar sesión para acceder a este perfil"}
        except Exception as e:
            return {"error": f"Error al analizar el perfil: {str(e)}"}
    
    def download_post_images(self, post, username: str) -> List[str]:
        """
        Descarga las imágenes de un post de Instagram
        
        Args:
            post: Objeto Post de instaloader
            username: Nombre de usuario para organizar archivos
            
        Returns:
            Lista de rutas de archivos descargados
        """
        downloaded_files = []
        
        try:
            # Obtener todas las imágenes del post (sidecar o imagen única)
            if post.typename == "GraphSidecar":
                # Post con múltiples imágenes
                sidecar_nodes = list(post.get_sidecar_nodes())
                for idx, node in enumerate(sidecar_nodes):
                    if node.is_video:
                        continue  # Saltar videos
                    
                    image_url = node.display_url
                    filename = f"{username}_{post.shortcode}_{idx+1}.jpg"
                    filepath = self.output_dir / filename
                    
                    if self._download_image(image_url, filepath):
                        downloaded_files.append(str(filepath))
            else:
                # Post con imagen única
                if not post.is_video:
                    # Usar display_url que es más confiable en instaloader
                    image_url = post.display_url if hasattr(post, 'display_url') else getattr(post, 'url', None)
                    if image_url:
                        filename = f"{username}_{post.shortcode}.jpg"
                        filepath = self.output_dir / filename
                        
                        if self._download_image(image_url, filepath):
                            downloaded_files.append(str(filepath))
        except Exception as e:
            print(f"⚠️  Error descargando imágenes del post {post.shortcode}: {str(e)}")
        
        return downloaded_files
    
    def _download_image(self, url: str, filepath: Path) -> bool:
        """
        Descarga una imagen desde una URL
        
        Args:
            url: URL de la imagen
            filepath: Ruta donde guardar el archivo
            
        Returns:
            True si se descargó correctamente, False en caso contrario
        """
        try:
            # Usar instaloader para descargar la imagen
            import requests
            
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                shutil.copyfileobj(response.raw, f)
            
            print(f"  ✅ Descargada: {filepath.name}")
            return True
        except Exception as e:
            print(f"  ❌ Error descargando {filepath.name}: {str(e)}")
            return False
    
    def print_analysis(self, analysis: Dict[str, Any]):
        """Imprime un análisis formateado del perfil"""
        if "error" in analysis:
            print(f"❌ Error: {analysis['error']}")
            return
        
        print("\n" + "="*60)
        print("📊 ANÁLISIS DE PERFIL DE INSTAGRAM")
        print("="*60)
        print(f"\n👤 Usuario: @{analysis['username']}")
        print(f"📝 Nombre completo: {analysis['full_name']}")
        
        if analysis['biography']:
            print(f"\n📖 Biografía:")
            print(f"   {analysis['biography']}")
        
        if analysis['external_url']:
            print(f"\n🔗 Enlace externo: {analysis['external_url']}")
        
        print(f"\n{'✅ Verificado' if analysis['is_verified'] else '❌ No verificado'}")
        print(f"{'🔒 Perfil privado' if analysis['is_private'] else '🌐 Perfil público'}")
        print(f"{'💼 Cuenta comercial' if analysis['is_business_account'] else '👤 Cuenta personal'}")
        
        if analysis['business_category_name']:
            print(f"🏷️  Categoría: {analysis['business_category_name']}")
        
        print(f"\n📈 Estadísticas:")
        print(f"   👥 Seguidores: {analysis['followers']:,}")
        print(f"   👤 Siguiendo: {analysis['followees']:,}")
        print(f"   📸 Publicaciones: {analysis['posts_count']:,}")
        if analysis['igtv_count'] > 0:
            print(f"   📺 Videos IGTV: {analysis['igtv_count']:,}")
        
        # Ratio de seguimiento
        if analysis['followers'] > 0:
            ratio = analysis['followees'] / analysis['followers']
            print(f"   📊 Ratio (siguiendo/seguidores): {ratio:.2f}")
        
        if analysis.get('posts'):
            print(f"\n📱 Últimas {analysis.get('recent_posts_analyzed', 0)} publicaciones:")
            for i, post in enumerate(analysis['posts'], 1):
                print(f"\n   {i}. {post['typename']}")
                print(f"      🔗 https://www.instagram.com/p/{post['shortcode']}/")
                print(f"      ❤️  {post['likes']:,} likes | 💬 {post['comments']:,} comentarios")
                print(f"      📅 {post['timestamp'][:10]}")
                if post.get('image_urls'):
                    print(f"      📸 Imágenes descargadas: {len(post['image_urls'])}")
                if post['caption']:
                    caption_preview = post['caption'][:100].replace('\n', ' ')
                    print(f"      📝 {caption_preview}...")
        
        if analysis.get('downloaded_images_count', 0) > 0:
            print(f"\n📥 Total de imágenes descargadas: {analysis['downloaded_images_count']}")
            print(f"📁 Guardadas en: {analysis.get('images_directory', 'img/')}")
        
        print("\n" + "="*60)
        print(f"⏰ Analizado el: {analysis['analyzed_at']}")
        print("="*60 + "\n")


def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Analiza perfiles de Instagram y descarga imágenes"
    )
    parser.add_argument(
        "username",
        nargs="?",
        help="Nombre de usuario de Instagram (sin @)"
    )
    parser.add_argument(
        "-d", "--download",
        action="store_true",
        help="Descargar imágenes de los posts"
    )
    parser.add_argument(
        "-o", "--output",
        default="img",
        help="Directorio para guardar imágenes (default: img)"
    )
    
    args = parser.parse_args()
    
    # Obtener username si no se proporcionó como argumento
    if not args.username:
        username = input("Ingresa el nombre de usuario de Instagram (sin @): ").strip().lstrip('@')
    else:
        username = args.username.strip().lstrip('@')
    
    if not username:
        print("❌ Error: Debes proporcionar un nombre de usuario")
        sys.exit(1)
    
    download_mode = args.download
    if download_mode:
        print(f"\n🔍 Analizando y descargando imágenes de: @{username}...\n")
    else:
        print(f"\n🔍 Analizando perfil: @{username}...\n")
    
    analyzer = InstagramAnalyzer(
        download_images=download_mode,
        output_dir=args.output
    )
    analysis = analyzer.analyze_profile(username)
    
    # Imprimir análisis
    analyzer.print_analysis(analysis)
    
    # Guardar análisis en JSON
    output_file = f"{username}_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Análisis guardado en: {output_file}\n")


if __name__ == "__main__":
    main()

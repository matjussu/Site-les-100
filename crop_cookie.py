#!/usr/bin/env python3
"""
Recadrage intelligent de photos de cookies pour le site les-100.fr.
Détecte automatiquement le cookie (objet rond), calcule son centre,
et recadre un carré 800x800 avec le cookie bien centré.

Stratégie de détection multi-niveaux :
  1. Hough Circle Transform (détection de cercles)
  2. Détection de contours par Canny edges
  3. Fallback : centre de l'image

Usage:
    python3 crop_cookie.py <input.jpg> <output.webp> [--padding 0.35] [--size 800]
"""

import cv2
import numpy as np
import sys
import argparse
from pathlib import Path


def detect_via_hough_circles(gray, width, height):
    """Détecte des cercles via la transformée de Hough sur image réduite."""
    # Réduire l'image pour améliorer la détection Hough
    scale = 0.25
    small = cv2.resize(gray, (int(width * scale), int(height * scale)))
    sh, sw = small.shape

    # Le cookie fait environ 12-35% de la largeur réduite
    min_radius = int(sw * 0.12)
    max_radius = int(sw * 0.35)

    # Flou pour Hough
    blurred = cv2.GaussianBlur(small, (15, 15), 0)

    # Tester avec param2 décroissant (plus permissif)
    for param2 in [40, 30, 25]:
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1.5,
            minDist=sw // 3,
            param1=80,
            param2=param2,
            minRadius=min_radius,
            maxRadius=max_radius,
        )

        if circles is not None:
            # Prendre le cercle le plus central
            best = None
            best_score = float("inf")
            img_cx, img_cy = sw // 2, sh // 2
            for c in circles[0]:
                cx, cy, r = float(c[0]), float(c[1]), float(c[2])
                dist = np.sqrt((cx - img_cx) ** 2 + (cy - img_cy) ** 2)
                size_bonus = r / max_radius
                score = dist - size_bonus * 200
                if score < best_score:
                    best_score = score
                    best = (cx, cy, r)
            if best:
                # Remettre à l'échelle originale
                return (int(best[0] / scale), int(best[1] / scale), int(best[2] / scale))

    return None


def detect_via_edges(gray, width, height):
    """Détecte le cookie via Canny edges + contours circulaires."""
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)

    # Canny edge detection
    edges = cv2.Canny(blurred, 30, 100)

    # Dilater les edges pour connecter les contours
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    edges = cv2.dilate(edges, kernel, iterations=2)
    edges = cv2.erode(edges, kernel, iterations=1)

    # Trouver les contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return None

    # Filtrer : garder les contours suffisamment grands et circulaires
    min_area = width * height * 0.01
    max_area = width * height * 0.5
    candidates = []

    for c in contours:
        area = cv2.contourArea(c)
        if area < min_area or area > max_area:
            continue

        # Circularité : 4π × area / perimeter²  (1.0 = cercle parfait)
        perimeter = cv2.arcLength(c, True)
        if perimeter == 0:
            continue
        circularity = 4 * np.pi * area / (perimeter * perimeter)

        # Le cookie + sous-verre est assez circulaire (> 0.3)
        if circularity > 0.3:
            (cx, cy), radius = cv2.minEnclosingCircle(c)
            candidates.append((int(cx), int(cy), int(radius), circularity, area))

    if not candidates:
        return None

    # Trier par : circularité × taille (préférer les grands cercles bien ronds)
    candidates.sort(key=lambda x: x[3] * x[4], reverse=True)
    best = candidates[0]
    return (best[0], best[1], best[2])


def detect_cookie_center(img):
    """Détecte le cookie via stratégie multi-niveaux.
    Ajuste le centre vers le bas pour inclure le sous-verre."""
    height, width = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Niveau 1 : Hough Circles
    result = detect_via_hough_circles(gray, width, height)
    if result:
        cx, cy, r = result
        # Décaler le centre vers le bas de 25% du rayon
        # pour centrer cookie + sous-verre (plus de table visible au-dessus)
        cy = cy + int(r * 0.25)
        # Décaler le cookie vers la droite dans l'image de sortie
        # (soustraire de cx = fenêtre de crop va à gauche = cookie apparaît à droite)
        cx = cx - int(r * 0.10)
        print(f"   (méthode: Hough Circles)")
        return (cx, cy, r)

    # Niveau 2 : Canny edges + contours
    result = detect_via_edges(gray, width, height)
    if result:
        print(f"   (méthode: Canny edges)")
        return result

    # Fallback : centre de l'image
    print(f"   (méthode: fallback centre)")
    return width // 2, height // 2, min(width, height) // 4


def crop_and_resize(img, cx, cy, radius, padding=0.35, target_size=800):
    """Recadre un carré centré sur (cx, cy) avec padding, puis redimensionne."""
    height, width = img.shape[:2]

    # Taille du carré de crop : diamètre du cookie + padding
    crop_half = int(radius * (1 + padding))

    # Coordonnées du crop
    x1 = cx - crop_half
    y1 = cy - crop_half
    x2 = cx + crop_half
    y2 = cy + crop_half

    # Ajuster si on dépasse les bords
    if x1 < 0:
        x2 -= x1
        x1 = 0
    if y1 < 0:
        y2 -= y1
        y1 = 0
    if x2 > width:
        x1 -= (x2 - width)
        x2 = width
    if y2 > height:
        y1 -= (y2 - height)
        y2 = height

    # Clamp final
    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(width, x2)
    y2 = min(height, y2)

    # Forcer un carré parfait
    crop_w = x2 - x1
    crop_h = y2 - y1
    side = min(crop_w, crop_h)
    if crop_w > side:
        diff = crop_w - side
        x1 += diff // 2
        x2 = x1 + side
    if crop_h > side:
        diff = crop_h - side
        y1 += diff // 2
        y2 = y1 + side

    # Crop
    cropped = img[y1:y2, x1:x2]

    # Redimensionner
    resized = cv2.resize(cropped, (target_size, target_size), interpolation=cv2.INTER_LANCZOS4)

    return resized


def main():
    parser = argparse.ArgumentParser(description="Recadrage intelligent de photos de cookies")
    parser.add_argument("input", help="Chemin de l'image source")
    parser.add_argument("output", help="Chemin de sortie (webp/jpg/png)")
    parser.add_argument("--padding", type=float, default=1.20,
                        help="Padding autour du cookie (1.20 = 120%%, défaut calibré sur les-100.fr)")
    parser.add_argument("--size", type=int, default=800,
                        help="Taille du carré de sortie (défaut: 800)")
    parser.add_argument("--shift-x", type=float, default=0,
                        help="Décalage horizontal additionnel en %% du rayon (ex: 0.15 = +15%% à droite)")
    parser.add_argument("--shift-y", type=float, default=0,
                        help="Décalage vertical additionnel en %% du rayon (ex: 0.10 = +10%% vers le bas)")
    parser.add_argument("--debug", action="store_true",
                        help="Sauvegarde une image debug avec le cercle détecté")
    args = parser.parse_args()

    # Charger l'image
    img = cv2.imread(args.input)
    if img is None:
        print(f"Impossible de charger : {args.input}")
        sys.exit(1)

    h, w = img.shape[:2]
    print(f"Image source : {w}x{h}")

    # Détecter le cookie
    cx, cy, radius = detect_cookie_center(img)
    # Appliquer les décalages manuels supplémentaires
    if args.shift_x != 0:
        cx = cx - int(radius * args.shift_x)
    if args.shift_y != 0:
        cy = cy + int(radius * args.shift_y)
    print(f"Cookie détecté : centre=({cx}, {cy}), rayon={radius}px")

    # Mode debug : sauvegarder l'image avec le cercle de détection
    if args.debug:
        debug_img = img.copy()
        cv2.circle(debug_img, (cx, cy), radius, (0, 255, 0), 8)
        cv2.circle(debug_img, (cx, cy), 15, (0, 0, 255), -1)
        # Dessiner aussi le carré de crop prévu
        crop_half = int(radius * (1 + args.padding))
        x1, y1 = cx - crop_half, cy - crop_half
        x2, y2 = cx + crop_half, cy + crop_half
        cv2.rectangle(debug_img, (max(0, x1), max(0, y1)), (min(w, x2), min(h, y2)), (255, 0, 0), 8)
        debug_path = str(Path(args.output).parent / (Path(args.output).stem + "_debug.jpg"))
        cv2.imwrite(debug_path, debug_img)
        print(f"Debug sauvegardé : {debug_path}")

    # Recadrer et redimensionner
    result = crop_and_resize(img, cx, cy, radius, args.padding, args.size)

    # Sauvegarder
    if args.output.endswith(".webp"):
        cv2.imwrite(args.output, result, [cv2.IMWRITE_WEBP_QUALITY, 85])
    elif args.output.endswith(".jpg") or args.output.endswith(".jpeg"):
        cv2.imwrite(args.output, result, [cv2.IMWRITE_JPEG_QUALITY, 90])
    else:
        cv2.imwrite(args.output, result)

    print(f"Sauvegardé : {args.output} ({args.size}x{args.size})")


if __name__ == "__main__":
    main()

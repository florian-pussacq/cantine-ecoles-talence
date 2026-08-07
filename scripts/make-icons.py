#!/usr/bin/env python3
"""Produit les icônes de l'application à partir des jetons de la palette.

Elles sont générées plutôt que dessinées à la main pour rester exactement
alignées sur la palette Réfectoire, et régénérables si celle-ci bouge :

    python3 scripts/make-icons.py

Le motif est le plateau compartimenté, comme l'écran du jour. Il ne reprend ni le
logo ni la charte de la Ville de Talence : cette application n'est pas un service
municipal et ne doit pas pouvoir être prise pour tel.
"""

from pathlib import Path

from PIL import Image, ImageDraw

TABLE = (30, 90, 107)  # --table  #1E5A6B
TRAY = (243, 245, 241)  # --tray   #F3F5F1
CELL = (198, 208, 202)  # --edge   #C6D0CA
MAIN = (217, 59, 43)  # --fam-viande #D93B2B

OUT = Path("static/icons")
SUPERSAMPLE = 4


def draw_tray(size: int, safe: float) -> Image.Image:
    """Dessine le plateau. `safe` est la part de l'image qu'il occupe."""
    canvas = size * SUPERSAMPLE
    image = Image.new("RGB", (canvas, canvas), TABLE)
    draw = ImageDraw.Draw(image)

    side = canvas * safe
    left = top = (canvas - side) / 2
    radius = side * 0.14
    draw.rounded_rectangle(
        [left, top, left + side, top + side], radius=radius, fill=TRAY
    )

    pad = side * 0.09
    gap = side * 0.05
    inner_left = left + pad
    inner_right = left + side - pad
    inner_top = top + pad
    width = inner_right - inner_left
    cell_radius = side * 0.05

    # Deux petites alvéoles, puis l'alvéole du plat en pleine largeur.
    small_h = side * 0.24
    half = (width - gap) / 2
    for index in range(2):
        x = inner_left + index * (half + gap)
        draw.rounded_rectangle(
            [x, inner_top, x + half, inner_top + small_h],
            radius=cell_radius,
            fill=CELL,
        )

    main_top = inner_top + small_h + gap
    main_h = side * 0.30
    draw.rounded_rectangle(
        [inner_left, main_top, inner_right, main_top + main_h],
        radius=cell_radius,
        fill=MAIN,
    )

    rest_top = main_top + main_h + gap
    rest_h = (top + side - pad) - rest_top
    for index in range(2):
        x = inner_left + index * (half + gap)
        draw.rounded_rectangle(
            [x, rest_top, x + half, rest_top + rest_h],
            radius=cell_radius,
            fill=CELL,
        )

    return image.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Icônes standard : le plateau occupe presque toute la surface.
    for size in (192, 512):
        draw_tray(size, safe=0.84).save(OUT / f"icone-{size}.png")

    # Icône masquable : le contenu doit tenir dans le cercle de sécurité de 80 %,
    # sans quoi Android en rogne les bords.
    draw_tray(512, safe=0.60).save(OUT / "icone-512-masquable.png")

    # iOS n'utilise pas le manifeste et réclame sa propre icône.
    draw_tray(180, safe=0.84).save(OUT / "apple-touch-icon.png")

    print(f"Icônes écrites dans {OUT}/")


if __name__ == "__main__":
    main()

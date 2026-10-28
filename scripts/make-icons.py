#!/usr/bin/env python3
"""Produit les icônes de l'application à partir des jetons de la palette.

Elles sont générées plutôt que dessinées à la main pour rester exactement
alignées sur la palette, et régénérables si celle-ci bouge :

    python3 scripts/make-icons.py

Le motif est la marque de l'enseigne — un disque, une assiette, deux couverts —
et non plus le plateau compartimenté. Ce plateau était devenu une métaphore
morte : la grille qu'il représentait a disparu avec `hierarchie-du-jour`, puis
l'ardoise qui l'avait remplacée avec `menu-en-cartes`. Une icône ne peut pas
rester la seule trace d'une mise en page que l'application n'a plus.

Il ne reprend ni le logo ni la charte de la Ville de Talence : cette application
n'est pas un service municipal et ne doit pas pouvoir être prise pour tel.
"""

from pathlib import Path

from PIL import Image, ImageDraw

FOND = (242, 243, 240)  # --fond      #F2F3F0
ACCENT = (19, 22, 20)  # --accent    #131614
ON_ACCENT = (255, 255, 255)  # --sur-accent #FFFFFF

OUT = Path("static/icons")
SUPERSAMPLE = 4


def draw_marque(size: int, safe: float) -> Image.Image:
    """Dessine la marque. `safe` est la part de l'image qu'elle occupe."""
    canvas = size * SUPERSAMPLE
    image = Image.new("RGB", (canvas, canvas), FOND)
    draw = ImageDraw.Draw(image)

    side = canvas * safe
    cx = cy = canvas / 2

    # Le disque de l'enseigne.
    r = side / 2
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ACCENT)

    # L'assiette : un anneau plein, percé. Deux ellipses suffisent — la seconde
    # rend au disque sa couleur, ce qui perce sans masque.
    plate = side * 0.30
    draw.ellipse([cx - plate, cy - plate, cx + plate, cy + plate], fill=ON_ACCENT)
    hole = side * 0.15
    draw.ellipse([cx - hole, cy - hole, cx + hole, cy + hole], fill=ACCENT)

    # Les couverts, de part et d'autre. Formes pleines et sans trait fin : c'est
    # la contrainte du sprite, et elle vaut d'autant plus à 192 pixels.
    bar_w = side * 0.055
    bar_h = side * 0.46
    for direction in (-1, 1):
        x = cx + direction * side * 0.40
        draw.rounded_rectangle(
            [x - bar_w, cy - bar_h / 2, x + bar_w, cy + bar_h / 2],
            radius=bar_w,
            fill=ON_ACCENT,
        )

    return image.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Icônes standard : la marque occupe presque toute la surface.
    for size in (192, 512):
        draw_marque(size, safe=0.84).save(OUT / f"icone-{size}.png")

    # Icône masquable : le contenu doit tenir dans le cercle de sécurité de 80 %,
    # sans quoi Android en rogne les bords.
    draw_marque(512, safe=0.60).save(OUT / "icone-512-masquable.png")

    # iOS n'utilise pas le manifeste et réclame sa propre icône.
    draw_marque(180, safe=0.84).save(OUT / "apple-touch-icon.png")

    print(f"Icônes écrites dans {OUT}/")


if __name__ == "__main__":
    main()

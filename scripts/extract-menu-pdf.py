#!/usr/bin/env python3
"""Extrait un mois de menus depuis le PDF de la Ville de Talence.

Le PDF est une grille A3 d'une page : cinq colonnes (lundi→vendredi), une bande
par semaine, et dans chaque cellule une ligne par plat, le libellé à gauche et
les codes allergènes alignés à droite. Le parser exploite cette géométrie plutôt
que le texte à plat : les positions sont stables d'un mois à l'autre, l'ordre de
lecture ne l'est pas.

    python3 scripts/extract-menu-pdf.py sources/pdf/09-MENUS-WEB-SEPTEMBRE-2026.pdf \
        --url https://www.talence.fr/.../09-MENUS-WEB-SEPTEMBRE-2026.pdf \
        --merge static/data/2026-09.json \
        --out static/data/2026-09.json

Ce que le script ne fait pas, et qui reste à la main : le thème « ZOOM SUR » et
sa note, éditoriaux et rattachés à un jour par jugement humain. --merge les
reprend du fichier existant. Il n'invente pas non plus de substitution sans
porc : le champ reste absent quand le document n'en imprime pas.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field

try:
    import fitz  # PyMuPDF
except ImportError:  # pragma: no cover
    sys.exit("PyMuPDF manquant : pip install pymupdf")

# --- géométrie de la grille -------------------------------------------------
#
# Les proportions sont stables, l'échelle ne l'est pas : d'un mois à l'autre la
# Ville exporte la même grille à des tailles différentes (septembre 2026 tient
# sur 842 pt de large, octobre sur 1190). Tout se mesure donc en fractions de la
# largeur d'une colonne, elle-même déduite de l'écart entre deux dates.

COLUMN_LEFT_RATIO = 0.30  # du bord gauche de la colonne jusqu'à sa date
ALLERGEN_MIN_RATIO = 0.38  # au-delà, à droite de la date, c'est la colonne des codes
LINE_PITCH_RATIO = 0.046  # hauteur d'une ligne de plat
LINE_TOLERANCE_RATIO = 0.36  # d'une ligne ; le code allergène retombe légèrement plus bas
WEEK_ROWS = 7.9  # hauteur d'une bande hebdomadaire, en lignes, pied de page exclu

DATE_RE = re.compile(r"^(\d{2})/(\d{2})/(\d{4})$")
ALLERGEN_RE = re.compile(r"^\d{1,2}(?:\+\d{1,2})*\+?$")

# --- vocabulaire du document ------------------------------------------------

# Les sept lignes d'une cellule, dans l'ordre de service imprimé. C'est la
# position dans la bande hebdomadaire qui donne le rôle : le document laisse des
# lignes vides — un jour sans laitage garde la ligne du laitage vide — et c'est
# précisément ce que la géométrie sait lire et qu'un comptage ne saurait pas.
SLOT_ROWS = ["pain", "entree", "plat", "accompagnement", "laitage", "dessert", "gouter"]

FLAG_TOKENS = {
    "bio": "bio",
    "vbf": "vbf",
    "vpf": "vpf",
    "vf": "vf",
    "pf": "pf",
    "msc": "msc",
    "igp": "igp",
    "bbc": "bbc",
}

PAIN_LABELS = {
    "PAIN BIO": ("Pain", ["bio"]),
    "PAIN LABEL ROUGE": ("Pain", ["label-rouge"]),
    "PAIN DU MOIS": ("Pain du mois", []),
    "PAIN": ("Pain", []),
}

ALLERGEN_LEGEND = {
    "1": "Gluten (blé, seigle, orge, avoine, épeautre, kamut)",
    "2": "Crustacés",
    "3": "Œufs",
    "4": "Poisson",
    "5": "Arachides",
    "6": "Soja",
    "7": "Lait",
    "8": "Fruits à coques (amandes, noisettes, noix, pistaches)",
    "9": "Céleri",
    "10": "Moutarde",
    "11": "Graines de sésame",
    "12": "Anhydride sulfureux et sulfites",
    "13": "Lupin",
    "14": "Mollusques",
}

MOIS = {
    "janvier": 1, "fevrier": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
    "juillet": 7, "aout": 8, "septembre": 9, "octobre": 10, "novembre": 11,
    "decembre": 12,
}

# Le libellé est repris mot pour mot — « Menus mis à jour le 25 août 2026 » —
# parce que c'est ce que le document affirme ; la date qu'on en extrait n'est
# qu'une commodité de tri.
UPDATED_RE = re.compile(
    r"(?:menus\s+)?mis(?:e)?\s+à\s+jour\s+le\s+(\d{1,2})\s+([a-zéûôû]+)\s+(\d{4})",
    re.IGNORECASE,
)


def unaccent(text: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )


# L'export du PDF perd la ligature « œ » et la recompose en deux lettres. La
# rétablir n'est pas un embellissement : « boeuf » et « bœuf » ne se cherchent
# ni ne se lisent pareil.
LIGATURES = [
    (re.compile(r"\bboeuf", re.IGNORECASE), "bœuf"),
    (re.compile(r"\boeuf", re.IGNORECASE), "œuf"),
    (re.compile(r"\bcoeur", re.IGNORECASE), "cœur"),
    (re.compile(r"\bvoeu", re.IGNORECASE), "vœu"),
]


def restore_case(replacement: str, matched: str) -> str:
    return replacement.capitalize() if matched[0].isupper() else replacement


def clean(text: str) -> str:
    """Normalise ce que le PDF encode de travers : apostrophes typographiques,
    espaces insécables et multiples, ligatures perdues."""
    text = re.sub(r"\s+", " ", text.replace("\u2019", "'").replace("\xa0", " ")).strip()
    for pattern, replacement in LIGATURES:
        text = pattern.sub(lambda m: restore_case(replacement, m.group(0)), text)
    return text


@dataclass
class Line:
    y: float
    label_words: list[tuple[float, str]] = field(default_factory=list)
    allergens: str = ""

    @property
    def label(self) -> str:
        return clean(" ".join(w for _, w in sorted(self.label_words)))


# Le bandeau de semaine et le pied de page tombent dans les mêmes colonnes que
# les plats ; rien ne les en distingue sinon ce qu'ils disent.
FURNITURE_RE = re.compile(r"^(semaine du |les cuisines municipales|zoom sur)", re.IGNORECASE)


def is_furniture(label: str) -> bool:
    return bool(FURNITURE_RE.match(label)) or len(label) > 60


def parse_allergens(raw: str) -> list[int]:
    codes = [int(c) for c in raw.split("+") if c]
    return sorted(set(c for c in codes if 1 <= c <= 14))


def split_flags(label: str) -> tuple[str, list[str]]:
    """Sépare les labels de qualité imprimés dans le libellé.

    « Concombre Bio vinaigrette » vaut « Concombre vinaigrette » plus le label
    bio : le libellé décrit le plat, le label le qualifie, et l'interface les
    rend différemment."""
    flags: list[str] = []
    if re.search(r"\blabel\s+rouge\b", label, re.IGNORECASE):
        flags.append("label-rouge")
        label = re.sub(r"\blabel\s+rouge\b", " ", label, flags=re.IGNORECASE)
    kept: list[str] = []
    for word in label.split():
        flag = FLAG_TOKENS.get(unaccent(word).lower().strip(".,"))
        if flag:
            if flag not in flags:
                flags.append(flag)
        else:
            kept.append(word)
    order = ["bio", "label-rouge", "vbf", "vpf", "vf", "pf", "msc", "igp", "bbc"]
    return clean(" ".join(kept)), sorted(flags, key=order.index)


def assign_slots(lines: list[Line], week_y: float, pitch: float) -> tuple[list[tuple[str, Line]], bool]:
    """Attribue un rôle à chaque ligne d'une cellule d'après sa hauteur.

    Les sept lignes d'un jour sont imprimées à des ordonnées fixes, partagées par
    toute la semaine. Le rang d'une ligne dans cette bande est donc son rôle, et
    une ligne absente est un rôle non servi — ce qu'aucun comptage ne dirait,
    puisque rien ne distingue un jour sans laitage d'un jour sans
    accompagnement."""
    slots: list[tuple[str, Line]] = []
    taken: set[str] = set()
    reliable = True
    for line in lines:
        rank = round((line.y - week_y) / pitch)
        if not 1 <= rank <= len(SLOT_ROWS):
            reliable = False
            continue
        slot = SLOT_ROWS[rank - 1]
        if slot in taken:
            reliable = False
            continue
        taken.add(slot)
        slots.append((slot, line))
    if not {"pain", "gouter"} <= taken:
        reliable = False
    return slots, reliable


def course(slot: str, line: Line) -> dict:
    raw = line.label
    if slot == "pain":
        label, flags = PAIN_LABELS.get(raw.upper(), (raw.title(), []))
    elif slot == "gouter":
        # Le goûter est recopié tel quel : « Pain au lait Bio + Lingotin » est un
        # assemblage, pas un plat qualifié — en extraire un label bio mentirait
        # sur ce qui est bio dedans.
        label = clean(re.sub(r"^go[uû]ter\s*:?\s*", "", raw, flags=re.IGNORECASE))
        # « Goûter : . » : le document imprime un point là où il n'a rien à dire.
        if not label.strip(" .-"):
            label = "Goûter"
        flags = []
    else:
        label, flags = split_flags(raw)
    return {
        "slot": slot,
        "label": label[:80],
        "allergens": parse_allergens(line.allergens),
        "flags": flags,
    }


def extract_cells(page) -> dict[str, tuple[list[Line], float, float]]:
    words = page.get_text("words")
    dates = [(w[0], w[1], w[4]) for w in words if DATE_RE.match(w[4])]
    if not dates:
        sys.exit("Aucune date trouvée : le gabarit du PDF a changé.")

    columns = sorted({round(x, 1) for x, _, _ in dates})
    weeks = sorted({round(y, 1) for _, y, _ in dates})
    if len(columns) < 2:
        sys.exit("Une seule colonne de dates : le gabarit du PDF a changé.")
    gaps = sorted(b - a for a, b in zip(columns, columns[1:]))
    width = gaps[len(gaps) // 2]
    left_margin = width * COLUMN_LEFT_RATIO
    allergen_offset = width * ALLERGEN_MIN_RATIO
    pitch = width * LINE_PITCH_RATIO
    tolerance = pitch * LINE_TOLERANCE_RATIO
    bounds = [(x - left_margin, x + width - left_margin) for x in columns]

    cells: dict[str, tuple[list[Line], float, float]] = {}
    for x, y, raw in dates:
        col = min(range(len(columns)), key=lambda i: abs(columns[i] - x))
        left, right = bounds[col]
        top, bottom = y + pitch * 0.4, y + pitch * WEEK_ROWS
        nxt = [w for w in weeks if w > y + 1]
        if nxt:
            bottom = min(bottom, nxt[0] - pitch * 0.5)

        inside = [w for w in words if left <= w[0] < right and top <= w[1] < bottom]
        inside.sort(key=lambda w: (w[1], w[0]))

        lines: list[Line] = []
        last_y = None
        for wx, wy, _, _, text, *_ in inside:
            if last_y is None or wy - last_y > tolerance:
                lines.append(Line(y=wy))
                last_y = wy
            line = lines[-1]
            if ALLERGEN_RE.match(text) and wx > x + allergen_offset:
                line.allergens += text
            else:
                line.label_words.append((wx, text))

        # Un code allergène trop long déborde sur la ligne suivante : il s'y
        # retrouve seul, et se recolle à celui qu'il continue.
        merged: list[Line] = []
        for line in lines:
            if not line.label_words and line.allergens and merged:
                merged[-1].allergens += line.allergens
            elif line.label_words and not is_furniture(line.label):
                merged.append(line)
        d, m, yr = DATE_RE.match(raw).groups()
        cells[f"{yr}-{m}-{d}"] = (merged, y, pitch)
    return cells


def find_updated(page) -> tuple[str | None, str | None]:
    match = UPDATED_RE.search(clean(page.get_text()))
    if not match:
        return None, None
    day, month_name, year = match.groups()
    month = MOIS.get(unaccent(month_name).lower())
    if not month:
        return match.group(0), None
    return match.group(0), f"{year}-{month:02d}-{int(day):02d}"


def serialize(document: dict) -> str:
    """Sérialise en gardant un plat par ligne.

    Un plat est une unité de lecture : l'éclater sur six lignes rendrait chaque
    diff de menu illisible, alors que la ligne unique montre d'un coup d'œil ce
    qui a changé. Prettier reformate ensuite les lignes trop longues."""
    inline: dict[str, str] = {}
    for day in document["days"]:
        courses = []
        for c in day["courses"]:
            token = f"@@{len(inline)}@@"
            inline[f'"{token}"'] = json.dumps(c, ensure_ascii=False)
            courses.append(token)
        day["courses"] = courses
    text = json.dumps(document, ensure_ascii=False, indent=2)
    for token, course_json in inline.items():
        text = text.replace(token, course_json)
    return text + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pdf")
    ap.add_argument("--url", required=True, help="URL officielle du PDF")
    ap.add_argument("--month", help="AAAA-MM ; déduit du mois majoritaire sinon")
    ap.add_argument("--merge", help="fichier existant dont reprendre thème et note")
    ap.add_argument("--out", help="fichier de sortie ; stdout sinon")
    args = ap.parse_args()

    blob = open(args.pdf, "rb").read()
    page = fitz.open(stream=blob, filetype="pdf")[0]
    cells = extract_cells(page)

    days = []
    warnings = []
    for date in sorted(cells):
        lines, week_y, pitch = cells[date]
        slots, reliable = assign_slots(lines, week_y, pitch)
        day = {
            "date": date,
            "kind": "school",
            "confidence": "high" if reliable else "low",
            "courses": [course(slot, line) for slot, line in slots],
        }
        if not reliable:
            warnings.append(f"{date} : {len(slots)} plats, structure inhabituelle")
        days.append(day)

    month = args.month
    if not month:
        counts: dict[str, int] = {}
        for d in days:
            counts[d["date"][:7]] = counts.get(d["date"][:7], 0) + 1
        month = max(counts, key=counts.get)

    label, updated_at = find_updated(page)
    if not updated_at:
        warnings.append("date de mise à jour absente du document")

    themes = {}
    if args.merge:
        try:
            for d in json.load(open(args.merge))["days"]:
                if d.get("theme") or d.get("note"):
                    themes[d["date"]] = (d.get("theme"), d.get("note"))
        except FileNotFoundError:
            pass
    # Le thème se lit avant les plats qu'il qualifie ; l'ordre des clés suit
    # celui du schéma pour que les diffs restent lisibles d'une reprise à l'autre.
    for i, day in enumerate(days):
        theme, note = themes.get(day["date"], (None, None))
        ordered = {"date": day["date"], "kind": day["kind"]}
        if theme:
            ordered["theme"] = theme
        if note:
            ordered["note"] = note
        ordered["confidence"] = day["confidence"]
        ordered["courses"] = day["courses"]
        days[i] = ordered

    out = {
        "schemaVersion": 1,
        "month": month,
        "source": {
            "pdfUrl": args.url,
            "pdfSha256": hashlib.sha256(blob).hexdigest(),
            "updatedLabel": label,
            "updatedAt": updated_at,
            "fetchedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "producerVersion": "extract-menu-pdf/1",
        },
        "allergenLegend": ALLERGEN_LEGEND,
        "days": days,
    }

    text = serialize(out)
    if args.out:
        open(args.out, "w").write(text)
        print(f"{args.out} : {len(days)} jours, {days[0]['date']} → {days[-1]['date']}", file=sys.stderr)
    else:
        sys.stdout.write(text)
    for w in warnings:
        print(f"  ⚠ {w}", file=sys.stderr)


if __name__ == "__main__":
    main()

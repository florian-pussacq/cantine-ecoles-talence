#!/usr/bin/env python3
"""Les menus publiés se reproduisent depuis leur PDF (extraction-reproductible).

    python3 scripts/test_extraction.py

Chaque fichier de `static/data/` nomme son PDF dans `source.pdfUrl`, et ce PDF
est conservé dans `sources/pdf/`. Le test relance l'extracteur sur chacun et
exige le document publié à l'identique, l'heure d'extraction exceptée (D3).

La référence est la donnée publiée elle-même, et non un fichier attendu à part :
aucun plat ne se saisit à la main, si bien qu'une donnée publiée est par
construction ce que le script a produit. Une seconde copie ferait deux vérités
à tenir alignées.

Le script est lancé comme un processus, par sa ligne de commande, et sa sortie
lue sur la sortie standard : c'est ainsi qu'un workflow s'en servira, et c'est
là qu'une bibliothèque bavarde corromprait le JSON (D2, D4).
"""

from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path
from urllib.parse import urlparse

RACINE = Path(__file__).resolve().parent.parent
SCRIPT = RACINE / "scripts" / "extract-menu-pdf.py"
DONNEES = RACINE / "static" / "data"
PDF = RACINE / "sources" / "pdf"

# Un mensuel, un menu de vacances ou le menu de grève ; le manifeste n'est pas
# un menu, et n'a pas de PDF.
PUBLIES = sorted(
    chemin for chemin in DONNEES.glob("*.json") if chemin.name != "index.json"
)


def pdf_cite(publie: dict) -> Path:
    """Le PDF conservé que cite une donnée, retrouvé par le nom de son URL."""
    return PDF / Path(urlparse(publie["source"]["pdfUrl"]).path).name


def sans_horodatage(document: dict) -> dict:
    """Le document sans `fetchedAt`, seule valeur que l'extraction ne fixe pas."""
    source = {k: v for k, v in document["source"].items() if k != "fetchedAt"}
    return {**document, "source": source}


def premier_ecart(publie: object, produit: object, chemin: str = "") -> str | None:
    """Le premier endroit où deux documents divergent, par son chemin.

    Un diff entier d'un mois fait des dizaines de milliers de caractères ; ce
    qu'il faut à qui retouche le parser, c'est le plat qui a bougé.
    """
    if isinstance(publie, dict) and isinstance(produit, dict):
        for cle in sorted(publie.keys() | produit.keys()):
            ecart = premier_ecart(publie.get(cle), produit.get(cle), f"{chemin}.{cle}")
            if ecart:
                return ecart
        return None
    if isinstance(publie, list) and isinstance(produit, list):
        for i, (a, b) in enumerate(zip(publie, produit)):
            ecart = premier_ecart(a, b, f"{chemin}[{i}]")
            if ecart:
                return ecart
        if len(publie) != len(produit):
            return f"{chemin} : {len(publie)} éléments publiés, {len(produit)} produits"
        return None
    if publie != produit:
        return f"{chemin} : publié {publie!r}, produit {produit!r}"
    return None


def extraire(chemin: Path, publie: dict) -> subprocess.CompletedProcess[str]:
    """Relance l'extracteur avec les options de la procédure (skill menus-talence)."""
    commande = [
        sys.executable,
        str(SCRIPT),
        str(pdf_cite(publie)),
        "--url",
        publie["source"]["pdfUrl"],
    ]
    if chemin.name == "greve.json":
        commande.append("--greve")
    else:
        # Le thème et sa note sont éditoriaux : la procédure les reprend du
        # fichier existant, le test aussi.
        commande += ["--merge", str(chemin)]
    return subprocess.run(commande, capture_output=True, text=True, cwd=RACINE)


class Reproduction(unittest.TestCase):
    def test_lit_reellement_des_menus(self) -> None:
        # Un test qui ne trouverait aucune donnée passerait sans rien garder.
        self.assertGreaterEqual(len(PUBLIES), 2)
        self.assertIn("greve.json", [chemin.name for chemin in PUBLIES])

    def test_chaque_menu_publie_se_reproduit(self) -> None:
        for chemin in PUBLIES:
            with self.subTest(chemin.name):
                publie = json.loads(chemin.read_text(encoding="utf-8"))
                resultat = extraire(chemin, publie)
                self.assertEqual(resultat.returncode, 0, resultat.stderr)
                try:
                    produit = json.loads(resultat.stdout)
                except json.JSONDecodeError as erreur:
                    self.fail(
                        f"la sortie standard n'est pas un JSON valide ({erreur}) : "
                        f"{resultat.stdout[:120]!r}"
                    )
                ecart = premier_ecart(sans_horodatage(publie), sans_horodatage(produit))
                if ecart:
                    self.fail(
                        f"{chemin.name} ne se reproduit plus depuis "
                        f"{pdf_cite(publie).name} — premier écart {ecart}"
                    )


class Completude(unittest.TestCase):
    def test_chaque_donnee_a_son_pdf(self) -> None:
        for chemin in PUBLIES:
            with self.subTest(chemin.name):
                publie = json.loads(chemin.read_text(encoding="utf-8"))
                self.assertTrue(pdf_cite(publie).is_file(), f"{pdf_cite(publie).name} absent")

    def test_chaque_pdf_est_cite(self) -> None:
        cites = {
            pdf_cite(json.loads(chemin.read_text(encoding="utf-8"))).name for chemin in PUBLIES
        }
        orphelins = sorted(p.name for p in PDF.glob("*.pdf") if p.name not in cites)
        self.assertEqual(orphelins, [], "PDF conservés qu'aucune donnée ne cite")


if __name__ == "__main__":
    unittest.main(verbosity=2)

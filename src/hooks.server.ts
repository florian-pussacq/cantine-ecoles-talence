import { readFileSync } from 'node:fs';
import type { Handle } from '@sveltejs/kit';
import { horloge } from '$lib/data/horloge.svelte.js';
import { parisDate } from '$lib/data/resolve.js';

/**
 * Pose la bibliothèque de formes dans la coque HTML (design.md, D57).
 *
 * Elle vivait dans un composant monté par le layout, ce qui la faisait payer
 * deux fois : une fois dans le bundle JavaScript envoyé au navigateur, une fois
 * dans chaque page pré-rendue. Le budget JS était à 92 % avant d'avoir ajouté un
 * seul dessin — la bibliothèque était donc devenue impossible à agrandir, ce qui
 * est le contraire de ce qu'on attend d'une bibliothèque.
 *
 * Rien dans ce fichier n'a d'état ni de réactivité : c'est du décor statique, et
 * il n'a aucune raison de traverser Svelte. Injecté ici, il ne coûte plus que
 * des octets de HTML — dont le budget a, lui, largement de la marge.
 *
 * **Pourquoi un hook serveur et non un greffon Vite.** `transformIndexHtml` ne
 * s'applique pas à `app.html` : SvelteKit lit ce fichier lui-même, hors du
 * traitement des points d'entrée HTML de Vite. Un greffon écrit ainsi ne
 * s'exécute jamais, et le pré-rendu échoue en signalant que `#marque` n'existe
 * pas — ce qui est la bonne erreur, au bon moment, mais pas la bonne solution.
 *
 * Ce module est du code serveur : le site étant entièrement pré-rendu, il tourne
 * à la construction et n'est jamais livré. Le sprite n'apparaît donc dans aucun
 * fichier téléchargé par le navigateur, hormis le HTML lui-même.
 *
 * La lecture est faite une fois, au chargement du module. Une retouche du dessin
 * demande une reconstruction, ce que le pré-rendu impose de toute façon.
 */
const SPRITE = readFileSync('src/lib/illustrations/sprite.svg', 'utf8');

/**
 * Le jour civil de Paris pour lequel la page est rendue (jour-au-premier-rendu,
 * D2).
 *
 * C'est l'instant même que les écrans ont lu pour résoudre leur jour : une seule
 * source, de sorte que `CANTINE_INSTANT`, s'il fixe le rendu, fixe aussi cet
 * attribut. Le script de `app.html` le compare au jour du navigateur avant la
 * première peinture.
 */
const JOUR_RENDU = `<html lang="fr" data-jour-rendu="${parisDate(horloge.instant)}">`;

export const handle: Handle = async ({ event, resolve }) =>
  resolve(event, {
    // Une fonction de remplacement, et non la chaîne : un `$&` ou un `$1` qui
    // apparaîtrait un jour dans un chemin SVG serait autrement interprété comme
    // un motif de substitution.
    transformPageChunk: ({ html }) =>
      html.replace('<html lang="fr">', () => JOUR_RENDU).replace('<!--sprite-->', () => SPRITE)
  });

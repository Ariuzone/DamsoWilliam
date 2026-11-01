# WILLIAM — expérience interactive

Site statique : aucun build ni dépendance serveur n'est nécessaire pour le déployer.

## Fichiers

- `index.html` : structure de la page
- `styles.css` : styles
- `app.js` : interactions et animations
- `william.mp4` : vidéo de fond
- `favicon.*` : icônes du site

## Tester en local

Depuis la racine du projet, lancer `python serve.py`, puis ouvrir l'adresse affichée dans le terminal. Ce serveur prend en charge les requêtes HTTP Range utilisées pour la lecture et la navigation dans la vidéo.

## Déployer

Publier **tous les fichiers de la racine** sur un hébergement de site statique, sans commande de build. Par exemple :

- **GitHub Pages** : sélectionner la branche et le dossier racine dans *Settings → Pages*.
- **Netlify** : connecter le dépôt et définir `.` comme dossier de publication ; aucune commande de build.
- **Cloudflare Pages** : sélectionner le dépôt, laisser la commande de build vide et définir `.` comme dossier de sortie.

Conserver les chemins relatifs des ressources (`styles.css`, `app.js`, `william.mp4` et les favicons), ainsi que le fichier vidéo lors de la publication. Le fichier vidéo doit être publié uniquement si vous disposez des droits nécessaires à sa diffusion.

Les polices et GSAP sont chargés depuis des CDN : leur chargement nécessite une connexion Internet.

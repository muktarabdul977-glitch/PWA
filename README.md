# Test News App (PWA version)

A small news-feed app used for a PWA vs native comparison. The articles and images are placeholder content (not real news).

## Files
- index.html, styles.css, app.js: the app (list of 30 articles, tap one to read it)
- manifest.webmanifest: tells the phone how to install the app
- sw.js: the service worker (caching)
- articles.json and images/: the content, shared with the native app
- icons/: app icons

## Put it online with GitHub Pages
1. Create a free account at github.com and click New repository. Name it pwa-test and make it Public.
2. Click "uploading an existing file" and drag in ALL the files and folders from this project (index.html, app.js, sw.js, styles.css, manifest.webmanifest, articles.json, the icons folder and the images folder). Click Commit changes.
3. Go to Settings > Pages. Under Build and deployment choose Deploy from a branch, branch main, folder /(root), then Save.
4. After a minute the site is live at https://YOUR-USERNAME.github.io/pwa-test/

## Measurement panel
Add ?metrics=1 to the address (for example https://YOUR-USERNAME.github.io/pwa-test/?metrics=1) to show a panel with the ready time, network bytes and storage use. Leave it off for normal timing runs.

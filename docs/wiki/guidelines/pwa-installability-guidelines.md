# PWA Installability Guidelines

This guide outlines the requirements and implementation steps to make a web application installable as a Progressive Web App (PWA), following the standards defined by [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

## 1. Core Requirements

For a web application to be "installable" by modern browsers, it must meet the following criteria:

- **HTTPS**: The site must be served over HTTPS (except for `localhost`).
- **Web App Manifest**: A JSON file providing metadata about the application.
- **Service Worker**: A registered background script to handle offline capabilities.
- **Icons**: At least two square icons (192x192 and 512x512 pixels).

---

## 2. Web App Manifest (`manifest.webmanifest`)

The manifest file defines how the app looks and behaves when installed on a device. It should be placed in the `public/` directory.

### Essential Fields:
```json
{
  "name": "Full Application Name",
  "short_name": "Short Name",
  "description": "A brief description of the application.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#028af8",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- **`display: standalone`**: Removes the browser address bar and navigation buttons.
- **`purpose: maskable`**: Allows the icon to be cropped into various shapes (circles, squares, squircles) on Android.

---

## 3. Service Worker (`sw.js`)

A Service Worker is required to handle network requests and allow for offline functionality. Even a minimal service worker is enough to satisfy the installability criteria.

### Minimal Implementation:
Place `sw.js` in the `public/` directory.

```javascript
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Required to satisfy PWA criteria. 
    // Can be expanded with caching strategies.
    event.respondWith(fetch(event.request));
});
```

---

## 4. Integration

### Linking the Manifest
Add the following tag to the `<head>` of your `index.html`:

```html
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#028af8">
```

### Registering the Service Worker
Add the registration script before the closing `</body>` tag:

```javascript
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('PWA Service Worker registered'))
        .catch(error => console.error('PWA Service Worker registration failed:', error));
    });
  }
</script>
```

---

## 5. Verification

To verify that your application is correctly configured as a PWA:

1.  **Chrome DevTools**:
    - Open the **Application** tab.
    - Click **Manifest** to check if the manifest is detected and valid.
    - Click **Service Workers** to ensure it is registered and running.
2.  **Lighthouse**:
    - Run a Lighthouse report in Chrome DevTools.
    - Check the **PWA** section; it will explicitly list any missing requirements for installability.

---

## Best Practices
- **Testing on Mobile**: Use Chrome's Remote Debugging or serve the site over your local network to test the "Add to Home Screen" prompt on a real phone.
- **Icon Quality**: Ensure icons have no transparency (unless intended for maskable purposes) and important elements are centered within the "safe zone" (middle 80%).

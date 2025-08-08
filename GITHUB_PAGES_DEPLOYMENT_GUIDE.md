# GitHub Pages Deployment & iframe Embedding Guide

## 🚀 Quick Setup (3 Steps)

### 1. Deploy to GitHub Pages

1. **Push your files to GitHub:**
   ```bash
   git add .
   git commit -m "Add SEA AI People List iframe version"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo: `https://github.com/ductran2918/sea_ai_people_list`
   - Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` / `(root)`
   - Save

3. **Your app will be live at:**
   ```
   https://ductran2918.github.io/sea_ai_people_list/iframe-embed.html
   ```

### 2. Embed in WordPress

#### Method 1: Direct iframe (Easiest)
```html
<iframe 
    src="https://ductran2918.github.io/sea_ai_people_list/iframe-embed.html"
    width="100%" 
    height="800"
    frameborder="0"
    scrolling="auto"
    style="border: none; border-radius: 8px;"
    title="SEA AI People Directory">
</iframe>
```

#### Method 2: Responsive iframe with auto-height
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 600px;">
    <iframe 
        src="https://ductran2918.github.io/sea_ai_people_list/iframe-embed.html"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
        frameborder="0"
        scrolling="auto"
        title="SEA AI People Directory">
    </iframe>
</div>
```

#### Method 3: WordPress Shortcode (Advanced)
```php
// Add to functions.php
function sea_ai_iframe_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '800',
        'width' => '100%'
    ), $atts);
    
    return '<iframe 
        src="https://ductran2918.github.io/sea_ai_people_list/iframe-embed.html"
        width="' . esc_attr($atts['width']) . '" 
        height="' . esc_attr($atts['height']) . '"
        frameborder="0"
        scrolling="auto"
        style="border: none; border-radius: 8px; max-width: 100%;"
        title="SEA AI People Directory">
    </iframe>';
}
add_shortcode('sea_ai_people', 'sea_ai_iframe_shortcode');
```

**Usage:** `[sea_ai_people height="1000"]`

### 3. Test & Optimize

## 📱 Mobile Responsiveness

The iframe version includes:
- **Responsive grid**: 1→2→3 columns based on screen width
- **Touch-friendly controls**: 44px+ touch targets
- **Mobile typography**: Readable fonts that prevent zoom
- **Optimized spacing**: Reduced padding on small screens

## 🎛️ iframe Customization Options

### Height Adjustment
```html
<!-- Fixed height -->
<iframe height="600">...</iframe>

<!-- Auto-resize with container -->
<div style="height: 80vh;">
    <iframe style="height: 100%;">...</iframe>
</div>

<!-- Minimum height with scroll -->
<iframe height="400" style="min-height: 400px;">...</iframe>
```

### Styling the iframe Container
```css
.people-iframe-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.people-iframe-container iframe {
    width: 100%;
    height: 800px;
    border: none;
    border-radius: 8px;
}
```

### Loading State
```html
<div id="iframe-container">
    <div id="iframe-loading" style="text-align: center; padding: 40px; color: #666;">
        Loading People Directory...
    </div>
    <iframe 
        src="https://ductran2918.github.io/sea_ai_people_list/iframe-embed.html"
        onload="document.getElementById('iframe-loading').style.display='none'"
        style="display: none; width: 100%; height: 800px; border: none;">
    </iframe>
</div>

<script>
document.querySelector('iframe').onload = function() {
    this.style.display = 'block';
    document.getElementById('iframe-loading').style.display = 'none';
};
</script>
```

## 🔧 Advanced Configuration

### Custom Domain (Optional)
If you have a custom domain:
1. Add `CNAME` file to your repo with your domain
2. Update GitHub Pages settings
3. Update iframe `src` to your custom URL

### HTTPS & Security
- ✅ GitHub Pages provides HTTPS automatically
- ✅ CORS is properly configured
- ✅ External resources use HTTPS
- ✅ CSP-friendly implementation

### Performance Optimization
```html
<!-- Preload the iframe -->
<link rel="preload" href="https://ductran2918.github.io/sea_ai_people_list/iframe-embed.html" as="document">

<!-- Lazy load iframe (for below-fold placement) -->
<iframe loading="lazy" src="..."></iframe>
```

## 🌐 Cross-Origin Considerations

### If you need communication between parent and iframe:
```javascript
// In your WordPress page
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://ductran2918.github.io') return;
    
    // Handle messages from iframe
    if (event.data.type === 'height-change') {
        document.querySelector('iframe').style.height = event.data.height + 'px';
    }
});

// In iframe-app.js (add this to send height updates)
function sendHeightToParent() {
    const height = document.body.scrollHeight;
    window.parent.postMessage({
        type: 'height-change',
        height: height
    }, '*');
}

// Call after rendering
window.addEventListener('load', sendHeightToParent);
new ResizeObserver(sendHeightToParent).observe(document.body);
```

## 🎨 Styling Integration

### Match Your Site's Design
You can modify the CSS in `iframe-app.js` to match your site:

```javascript
// In the injectStyles() function, modify:
const cssText = `
    :root {
        --main-font: 'Your-Site-Font', sans-serif;  /* Match your site font */
        --primary-color: #your-brand-color;          /* Use your brand colors */
        --background: transparent;                    /* Keep transparent */
    }
    
    .expand-btn {
        background: var(--primary-color);            /* Use your brand color */
    }
    
    /* Add any custom styles here */
`;
```

## 📊 Analytics & Tracking

### Google Analytics in iframe:
```html
<!-- Add to iframe-embed.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Track interactions:
```javascript
// Add to iframe-app.js
function trackEvent(action, data) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'custom_parameter': data
        });
    }
}

// Use in event handlers
searchInput.addEventListener('input', () => {
    trackEvent('search', searchInput.value);
});
```

## 🚨 Troubleshooting

### Common Issues:

1. **iframe not loading:**
   - Check GitHub Pages is enabled
   - Verify the URL is correct
   - Check browser console for errors

2. **Styling issues:**
   - iframe inherits some parent styles
   - Add `style="all: revert"` to iframe if needed

3. **Height problems:**
   - Use `scrolling="auto"` for mobile
   - Consider auto-resize script above

4. **CORS errors:**
   - GitHub Pages handles CORS correctly
   - External APIs (Google Sheets CSV) work fine

5. **Mobile responsiveness:**
   - Test on actual devices
   - Check viewport meta tag is present

### Debug iframe content:
```javascript
// Access iframe content (same-origin only)
const iframe = document.querySelector('iframe');
iframe.onload = function() {
    console.log('iframe loaded:', this.contentDocument);
};
```

## 📱 Flutter Mobile App Integration

If you also want to embed in your Flutter app:

```dart
import 'package:webview_flutter/webview_flutter.dart';

class PeopleDirectoryWebView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return WebView(
      initialUrl: 'https://ductran2918.github.io/sea_ai_people_list/iframe-embed.html',
      javascriptMode: JavascriptMode.unrestricted,
      gestureNavigationEnabled: true,
      zoomEnabled: false,
    );
  }
}
```

## 🔄 Updates & Maintenance

### To update the data or design:
1. Modify files in your local repo
2. `git push` to GitHub
3. Changes appear automatically on GitHub Pages
4. iframe will load the updated version

### Cache considerations:
- GitHub Pages has CDN caching
- Add `?v=timestamp` to iframe src for cache busting if needed
- Browser cache usually respects cache headers

---

**🎉 That's it! Your people directory is now deployable as an iframe anywhere on the web.**

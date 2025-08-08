# Mobile App & WordPress Integration Guide

## 🎯 Problem Solved
Your Flutter mobile app's HTML sanitizer blocks:
- `<link>` tags (external CSS)
- `<style>` blocks
- Some inline styles

This guide provides a **sanitizer-friendly** version that works in both WordPress and Flutter mobile apps.

## 📁 Files Created

### 1. `mobile-friendly.html`
- **Clean HTML**: No `<link>` tags, no `<style>` blocks
- **External dependencies**: Loaded via `<script>` tags (allowed by most sanitizers)
- **Minimal structure**: Just the essential HTML elements

### 2. `mobile-friendly-app.js`
- **All CSS injected via JavaScript**: Creates `<style>` elements dynamically
- **Font loading**: Google Fonts loaded programmatically
- **Choices.js CSS**: Fetched and injected at runtime
- **Responsive design**: Mobile-first with media queries
- **Same functionality**: All original features preserved

## 🚀 WordPress Implementation

### Option 1: WordPress Shortcode (Recommended)
```php
// Add to your theme's functions.php
function sea_ai_people_shortcode($atts) {
    $baseUrl = get_site_url() . '/wp-content/uploads/sea-ai-people/';
    
    return '<div id="sea-ai-people-container">
        <script>
            (function() {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/papaparse@5.3.2/papaparse.min.js";
                document.head.appendChild(script);
                
                script.onload = function() {
                    const script2 = document.createElement("script");
                    script2.src = "https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js";
                    document.head.appendChild(script2);
                    
                    script2.onload = function() {
                        const appScript = document.createElement("script");
                        appScript.type = "module";
                        appScript.textContent = `
                            // Copy the entire mobile-friendly-app.js content here
                            // OR load from external file:
                            import("' . $baseUrl . 'mobile-friendly-app.js");
                        `;
                        document.head.appendChild(appScript);
                    };
                };
            })();
        </script>
        <div id="loading">Loading people data...</div>
        <div id="app" class="hidden">
            <div id="filters-container"></div>
            <div id="people-container"></div>
            <div id="no-results" class="hidden">
                <div><h3>No results found</h3>
                <button id="clear-filters-btn">Clear filters</button></div>
            </div>
            <footer class="map-footer">
                <div class="source-attribution">
                    Data source: <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTRiNh4w92XdVXeRlBtrlSk9LcgFhLMNz97Ry0h34gfElPeZ4ZH-Kx_7CkjnYJfDmADti7sKO7cLExX/pub?gid=928970532&single=true&output=csv" target="_blank" rel="noopener">Google Sheets</a>
                </div>
            </footer>
        </div>
    </div>';
}
add_shortcode('sea_ai_people', 'sea_ai_people_shortcode');
```

**Usage**: `[sea_ai_people]` in any WordPress post/page

### Option 2: Custom WordPress Block
```php
// For Gutenberg block editor
function register_sea_ai_people_block() {
    wp_register_script(
        'sea-ai-people-block',
        get_template_directory_uri() . '/blocks/sea-ai-people.js',
        array('wp-blocks', 'wp-element')
    );

    register_block_type('custom/sea-ai-people', array(
        'editor_script' => 'sea-ai-people-block',
        'render_callback' => 'sea_ai_people_shortcode'
    ));
}
add_action('init', 'register_sea_ai_people_block');
```

## 📱 Flutter Mobile App Implementation

### HTML Content Setup
```dart
// In your Flutter WebView widget
class PeopleListWebView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return WebView(
      initialUrl: 'data:text/html;base64,' + 
          base64Encode(utf8.encode(getCleanHTML())),
      javascriptMode: JavascriptMode.unrestricted,
      // Allow external network calls for CSV data
      gestureNavigationEnabled: true,
    );
  }

  String getCleanHTML() {
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEA AI People List</title>
</head>
<body>
    <div id="loading">Loading people data...</div>
    <div id="app" class="hidden">
        <div id="filters-container"></div>
        <div id="people-container"></div>
        <div id="no-results" class="hidden">
            <div><h3>No results found</h3>
            <button id="clear-filters-btn">Clear filters</button></div>
        </div>
        <footer class="map-footer">
            <div class="source-attribution">
                Data source: Google Sheets
            </div>
        </footer>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.3.2/papaparse.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
    <script>
        // Embed the entire mobile-friendly-app.js content here
        ${getMobileFriendlyJS()}
    </script>
</body>
</html>
    ''';
  }
}
```

### Alternative: External Assets
```dart
// If you can host files externally
WebView(
  initialUrl: 'https://yourdomain.com/sea-ai-people/mobile-friendly.html',
  javascriptMode: JavascriptMode.unrestricted,
)
```

## 🔧 Asset Management

### 1. Upload Assets to WordPress
```bash
# Upload to: /wp-content/uploads/sea-ai-people/
assets/
├── flags/
│   ├── vn_flag.svg
│   ├── sg_flag.svg
│   ├── th_flag.svg
│   ├── my_flag.svg
│   ├── id_flag.svg
│   └── ph_flag.svg
├── placeholder_person.svg
└── mobile-friendly-app.js
```

### 2. Update Asset Paths
In `mobile-friendly-app.js`, update the FLAG_ASSETS paths:
```javascript
const FLAG_ASSETS = {
    Vietnam: '/wp-content/uploads/sea-ai-people/assets/flags/vn_flag.svg',
    Singapore: '/wp-content/uploads/sea-ai-people/assets/flags/sg_flag.svg',
    // ... etc
};
```

## 📐 Responsive Design Features

### Mobile Optimizations
- **Touch-friendly**: 44px minimum touch targets
- **Readable fonts**: 16px+ to prevent zoom on iOS
- **Flexible grid**: 1→2→3 columns based on screen size
- **Optimized spacing**: Reduced padding on mobile
- **Lazy loading**: Images load as needed

### CSS Media Queries
```css
/* Mobile First */
.people-grid { grid-template-columns: 1fr; }

/* Tablet */
@media (min-width: 768px) {
  .people-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .people-grid { grid-template-columns: repeat(3, 1fr); }
}
```

## 🚫 Sanitizer Bypass Techniques

### What We Avoided
- ❌ `<link rel="stylesheet">` - Blocked by sanitizers
- ❌ `<style>` in `<head>` - Often stripped
- ❌ Inline `style=""` attributes - Sometimes blocked

### What We Used Instead
- ✅ JavaScript `createElement('style')` - Usually allowed
- ✅ Dynamic CSS injection - Runs after sanitizer
- ✅ Fetch API for external CSS - Loaded programmatically
- ✅ Data attributes for styling hooks

## 🔍 Testing Checklist

### WordPress Testing
- [ ] Test in different themes
- [ ] Check block editor compatibility
- [ ] Verify on mobile WordPress app
- [ ] Test with caching plugins

### Flutter App Testing
- [ ] Test WebView rendering
- [ ] Check JavaScript execution
- [ ] Verify network requests work
- [ ] Test on different screen sizes
- [ ] Confirm touch interactions

### Cross-Platform Testing
- [ ] iOS Safari (mobile)
- [ ] Android Chrome (mobile)
- [ ] Desktop browsers
- [ ] WordPress admin preview
- [ ] Flutter app WebView

## 🛠️ Troubleshooting

### Common Issues

**1. Fonts not loading**
```javascript
// Fallback fonts in CSS
font-family: var(--main-font), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**2. CSV blocked by CORS**
```javascript
// Alternative: proxy through your WordPress site
const csvUrl = '/wp-admin/admin-ajax.php?action=get_people_csv';
```

**3. Assets not found**
```javascript
// Use absolute URLs
const imageSrc = person.image || 'https://yourdomain.com/wp-content/uploads/sea-ai-people/assets/placeholder_person.svg';
```

**4. JavaScript execution blocked**
```html
<!-- Ensure JavascriptMode.unrestricted in Flutter -->
<!-- Check Content Security Policy in WordPress -->
```

## 📈 Performance Optimizations

### Lazy Loading
- Images load only when visible
- Debounced search (300ms)
- Efficient DOM updates

### Bundle Size
- External dependencies cached by CDN
- Minimal JavaScript footprint
- SVG icons instead of icon fonts

### Network Requests
- Single CSV fetch
- Cached external libraries
- Optimized image formats

This setup ensures your people list graphic works seamlessly across WordPress editors, mobile apps, and all modern browsers while bypassing common sanitizer restrictions.

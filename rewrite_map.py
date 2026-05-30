import re

with open(r'd:\road-sos\frontend\src\screens\LiveTrackingScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
content = re.sub(
    r"import MapView, { Marker, UrlTile } from 'react-native-maps';",
    r"import { WebView } from 'react-native-webview';",
    content
)

# Replace mapRef type
content = re.sub(
    r"const mapRef = useRef<MapView>\(null\);",
    r"const mapRef = useRef<WebView>(null);",
    content
)

# Replace animateCamera calls in useEffect
content = re.sub(
    r"mapRef.current.animateCamera\(\{.*?\}\);",
    r"mapRef.current.injectJavaScript(`\n                if (window.marker && window.map) {\n                  var newLatLng = new L.LatLng(${newLocation.coords.latitude}, ${newLocation.coords.longitude});\n                  window.marker.setLatLng(newLatLng);\n                  window.map.setView(newLatLng, window.map.getZoom());\n                }\n              `);",
    content,
    flags=re.DOTALL
)

# Replace recenterMap logic
content = re.sub(
    r"const recenterMap = \(\) => \{.*?^\s*\}\s*;",
    r"""const recenterMap = () => {
    setIsTracking(true);
    if (location && mapRef.current) {
      mapRef.current.injectJavaScript(`
        if (window.marker && window.map) {
          var newLatLng = new L.LatLng(${location.coords.latitude}, ${location.coords.longitude});
          window.marker.setLatLng(newLatLng);
          window.map.setView(newLatLng, 17);
        }
      `);
    }
  };""",
    content,
    flags=re.DOTALL | re.MULTILINE
)

# Build leaflet html string
leaflet_code = """
  const getLeafletHTML = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
        .leaflet-control-attribution { display: none; }
        
        /* Custom Marker CSS */
        .custom-marker {
            width: 32px;
            height: 32px;
            background-color: rgba(239, 68, 68, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(239, 68, 68, 0.5);
            animation: pulse 2s infinite;
        }
        .custom-marker-core {
            width: 12px;
            height: 12px;
            background-color: #ef4444;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        window.map = L.map('map', {zoomControl: false}).setView([${lat}, ${lng}], 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(window.map);
        
        var customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='custom-marker'><div class='custom-marker-core'></div></div>",
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        window.marker = L.marker([${lat}, ${lng}], {icon: customIcon}).addTo(window.map);
        
        window.map.on('dragstart', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DRAG' }));
        });
    </script>
</body>
</html>
  `;
"""

# Insert leaflet string before return
content = content.replace("const isLight = colorScheme === 'light';", leaflet_code + "\n  const isLight = colorScheme === 'light';")

# Replace MapView with WebView
mapview_regex = r"<MapView.*?</MapView>"
webview_code = """<WebView
            ref={mapRef}
            style={styles.map}
            source={{ html: getLeafletHTML(location.coords.latitude, location.coords.longitude) }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'DRAG') setIsTracking(false);
              } catch(e) {}
            }}
            scrollEnabled={false}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
          />"""
content = re.sub(mapview_regex, webview_code, content, flags=re.DOTALL)

with open(r'd:\road-sos\frontend\src\screens\LiveTrackingScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

requirejs.config({
    'baseUrl': 'leaflet',
    'paths': {
        'leaflet.wms': '../../dist/leaflet.wms'
    }
});

define(['leaflet', 'leaflet.wms'],
function(L, wms) {

var overlayMap = createMap('overlay-map', false);
var tiledMap = createMap('tiled-map', true);

function createMap(div, tiled) {
    // Map configuration
    var map = L.map(div);
    map.setView([21.80,-82.80], 12);

    var basemaps = {
        'OSM Basemap': basemap().addTo(map),
        'Google Cache': googlecache(),
        'OSM Geoserver': osmGeoserver(),
        '<span style="color: red">Blank</span>': blank()
    };
    // Agregar capas WMS a la fuente
    var source = wms.source(
        "https://idevida.geocuba.cu/geoserver/ij/wms?",
        {
            "format": "image/png",
            "transparent": "true",
            "attribution": "<a href='https://idevida.geocuba.cu/geoserver/web/'>Geoserver</a>",
            "info_format": "text/html",
            "tiled": tiled
        }
    );

    var layers = {
        'Manzanas': source.getLayer("ij:manzanas").addTo(map),
        'Construcciones': source.getLayer("ij:cat_construcciones").addTo(map),
        'Subparcelas': source.getLayer("ij:cat_subparcelas").addTo(map),
        'Curvas nivel': source.getLayer("ij:curvas_nivel").addTo(map)
    };

    // Crear el control de capas
    L.control.layers(basemaps, layers).addTo(map);

    // Opacity slider
    var slider = L.DomUtil.get('range-' + div);
    L.DomEvent.addListener(slider, 'change', function() {
        source.setOpacity(this.value);
    });
    return map;
}

function basemap() {
    var attr = 'Mapa y Datos de: <a href="https://cig.geocuba.cu/">OSM</a>';
    return L.tileLayer("https://mapas.geocuba.cu/osm_tiles/{z}/{x}/{y}.png", {
        opacity: 1,
        attribution: attr
    });
}

function googlecache() {
    return L.tileLayer.wms("https://idevida.geocuba.cu/geoserver/gmx/wms?",
        {
            version: "1.1.0",
            request: "GetMap",
            layers: "gmx:google",
            srs: "EPSG:3857",
            format: "image/png",
            transparent: false
        }
    );
}

function osmGeoserver() {
        var attr = '<a href="http://localhost/wms.leaflet/">OSM-Geoserver</a>';
        return L.tileLayer.wms("https://idevida.geocuba.cu/geoserver/osm/wms?", {
            version: "1.1.0",
            request: "GetMap",
            layers: "osm:osm",
            srs: "EPSG:4326",
            format: "image/jpeg",
            opacity: 1,
            attribution: attr
        });
    }

function blank() {
    var layer = new L.Layer();
    layer.onAdd = layer.onRemove = function() {};
    return layer;
}
// Export maps for console experimentation
return {
    'maps': {
        'overlay': overlayMap, 'tiled': tiledMap
        //L.control.sideBySide(basemap, googlecache).addTo(map);
    }
};

});


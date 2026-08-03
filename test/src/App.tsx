import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, readVersionFromLocation } from './TestProvider';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PAGES } from './config';
import './style.css';

// 框架 & 基础
import { CapabilitiesPage } from './pages/CapabilitiesPage';
import { UnsupportedPage } from './pages/UnsupportedPage';
import { MapTestPage } from './pages/MapTestPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

// 覆盖物
import * as OverlayPages from './pages/overlay';

// 控件
import * as ControlPages from './pages/control';

// 图层
import * as LayerPages from './pages/layer';

// 服务
import * as ServicePages from './pages/service';

// 其他
import { ContextMenuTestPage } from './pages/ContextMenuTestPage';
import { PanoramaTestPage } from './pages/PanoramaTestPage';

// 映射 id → 组件
const PAGE_MAP: Record<string, React.ComponentType> = {
  capabilities: CapabilitiesPage,
  unsupported: UnsupportedPage,
  map: MapTestPage,
  // 覆盖物
  marker: OverlayPages.MarkerPage,
  'place-detail-overlay': OverlayPages.PlaceDetailPage,
  label: OverlayPages.LabelPage,
  polyline: OverlayPages.PolylinePage,
  polygon: OverlayPages.PolygonPage,
  circle: OverlayPages.CirclePage,
  rectangle: OverlayPages.RectanglePage,
  'bezier-curve': OverlayPages.BezierCurvePage,
  prism: OverlayPages.PrismPage,
  'ground-overlay': OverlayPages.GroundOverlayPage,
  'ground-point': OverlayPages.GroundPointPage,
  'point-collection': OverlayPages.PointCollectionPage,
  'info-window': OverlayPages.InfoWindowPage,
  symbol: OverlayPages.SymbolPage,
  icon: OverlayPages.IconPage,
  'icon-sequence': OverlayPages.IconSequencePage,
  hotspot: OverlayPages.HotspotPage,
  'custom-overlay': OverlayPages.CustomOverlayPage,
  // 控件
  'navigation-control': ControlPages.NavigationControlPage,
  'navigation-control-3d': ControlPages.NavigationControl3DPage,
  'scale-control': ControlPages.ScaleControlPage,
  'overview-map-control': ControlPages.OverviewMapControlPage,
  'map-type-control': ControlPages.MapTypeControlPage,
  'copyright-control': ControlPages.CopyrightControlPage,
  'geolocation-control': ControlPages.GeolocationControlPage,
  'panorama-control': ControlPages.PanoramaControlPage,
  'zoom-control': ControlPages.ZoomControlPage,
  'city-list-control': ControlPages.CityListControlPage,
  'logo-control': ControlPages.LogoControlPage,
  // 图层
  'tile-layer': LayerPages.TileLayerPage,
  'normal-layer': LayerPages.NormalLayerPage,
  'geojson-layer': LayerPages.GeoJSONLayerPage,
  'district-layer': LayerPages.DistrictLayerPage,
  'traffic-layer': LayerPages.TrafficLayerPage,
  'custom-layer': LayerPages.CustomLayerPage,
  'canvas-layer': LayerPages.CanvasLayerPage,
  'raster-tile-layer': LayerPages.RasterTileLayerPage,
  'wms-layer': LayerPages.WMSLayerPage,
  'wmts-layer': LayerPages.WMTSLayerPage,
  'xyz-layer': LayerPages.XYZLayerPage,
  'mvt-layer': LayerPages.MVTLayerPage,
  'feature-layer': LayerPages.FeatureLayerPage,
  'fill-layer': LayerPages.FillLayerPage,
  'dom-layer': LayerPages.DOMLayerPage,
  'point-icon-layer': LayerPages.PointIconLayerPage,
  'point-shape-layer': LayerPages.PointShapeLayerPage,
  'panorama-coverage-layer': LayerPages.PanoramaCoverageLayerPage,
  // 服务
  'local-search': ServicePages.LocalSearchPage,
  geocoder: ServicePages.GeocoderPage,
  'driving-route': ServicePages.DrivingRoutePage,
  'walking-route': ServicePages.WalkingRoutePage,
  'riding-route': ServicePages.RidingRoutePage,
  'transit-route': ServicePages.TransitRoutePage,
  'bus-line-search': ServicePages.BusLineSearchPage,
  autocomplete: ServicePages.AutocompletePage,
  boundary: ServicePages.BoundaryPage,
  geolocation: ServicePages.GeolocationPage,
  'local-city': ServicePages.LocalCityPage,
  'place-detail': ServicePages.PlaceDetailPage,
  convertor: ServicePages.ConvertorPage,
  'panorama-service': ServicePages.PanoramaServicePage,
  // 其他
  'context-menu': ContextMenuTestPage,
  panorama: PanoramaTestPage,
};

function Layout() {
  const version = readVersionFromLocation();
  return (
    <div className="app-layout">
      <Header current={version} pages={PAGES} />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/capabilities" replace />} />
            {PAGES.map((p) => (
              <Route
                key={p.id}
                path={`/${p.id}`}
                element={
                  p.ready && PAGE_MAP[p.id]
                    ? React.createElement(PAGE_MAP[p.id])
                    : <PlaceholderPage name={p.name} />
                }
              />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const version = readVersionFromLocation();
  return (
    <AppProvider version={version}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  );
}

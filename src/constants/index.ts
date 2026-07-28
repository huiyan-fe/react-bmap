/**
 * 全量 BMAP_* 常量 — 从 bmap-jsapi-dts/src/const/*.d.ts 转录。
 */

// ─── ControlAnchor ───
export const BMAP_ANCHOR_TOP_LEFT = 0;
export const BMAP_ANCHOR_TOP_RIGHT = 1;
export const BMAP_ANCHOR_BOTTOM_LEFT = 2;
export const BMAP_ANCHOR_BOTTOM_RIGHT = 3;
export const BMAP_ANCHOR_TOP_CENTER = 4;
export const BMAP_ANCHOR_BOTTOM_CENTER = 5;
export const BMAP_ANCHOR_LEFT_CENTER = 6;
export const BMAP_ANCHOR_RIGHT_CENTER = 7;
export const BMAP_ANCHOR_CENTER = 8;
export type ControlAnchor = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ─── MapTypeId ───
export const BMAP_NORMAL_MAP = 'B_NORMAL_MAP';
export const BMAP_SATELLITE_MAP = 'B_SATELLITE_MAP';
export const BMAP_HYBRID_MAP = 'B_HYBRID_MAP';
export const BMAP_EARTH_MAP = 'B_EARTH_MAP';
export type MapTypeId = string;

// ─── NavigationControlType ───
export const BMAP_NAVIGATION_CONTROL_LARGE = 0;
export const BMAP_NAVIGATION_CONTROL_SMALL = 1;
export const BMAP_NAVIGATION_CONTROL_PAN = 2;
export const BMAP_NAVIGATION_CONTROL_ZOOM = 3;
export type NavigationControlType = 0 | 1 | 2 | 3;

// ─── MapTypeControlType ───
export const BMAP_MAPTYPE_CONTROL_HORIZONTAL = 0;
export const BMAP_MAPTYPE_CONTROL_DROPDOWN = 1;
export const BMAP_MAPTYPE_CONTROL_MAP = 2;
export type MapTypeControlType = 0 | 1 | 2;

// ─── Animation ───
export const BMAP_ANIMATION_DROP = 1;
export const BMAP_ANIMATION_BOUNCE = 2;
export type MarkerAnimation = 1 | 2;

// ─── StatusCodes ───
export const BMAP_STATUS_SUCCESS = 0;
export const BMAP_STATUS_CITY_LIST = 1;
export const BMAP_STATUS_UNKNOWN_LOCATION = 2;
export const BMAP_STATUS_UNKNOWN_ROUTE = 3;
export const BMAP_STATUS_INVALID_KEY = 4;
export const BMAP_STATUS_INVALID_REQUEST = 5;
export const BMAP_STATUS_PERMISSION_DENIED = 6;
export const BMAP_STATUS_SERVICE_UNAVAILABLE = 7;
export const BMAP_STATUS_TIMEOUT = 8;
export type ServiceStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ─── DrivingPolicy ───
export const BMAP_DRIVING_POLICY_DEFAULT = 0;
export const BMAP_DRIVING_POLICY_DESTANCE = 2;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS = 3;
export const BMAP_DRIVING_POLICY_FIRST_HIGHWAYS = 4;
export const BMAP_DRIVING_POLICY_AVOID_CONGESTION = 5;
export const BMAP_DRIVING_POLICY_AVOID_PAY = 6;
export const BMAP_DRIVING_POLICY_HIGHWAYS_AVOID_CONGESTION = 7;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_CONGESTION = 8;
export const BMAP_DRIVING_POLICY_AVOID_CONGESTION_PAY = 9;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_CONGESTION_PAY = 10;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_PAY = 11;
export const BMAP_DRIVING_POLICY_DISTANCE_PRIORITY = 12;
export const BMAP_DRIVING_POLICY_TIME_PRIORITY = 13;
export type DrivingPolicy = 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

// ─── TransitPolicy ───
export const BMAP_TRANSIT_POLICY_RECOMMEND = 0;
export const BMAP_TRANSIT_POLICY_LEAST_TRANSFER = 1;
export const BMAP_TRANSIT_POLICY_LEAST_WALKING = 2;
export const BMAP_TRANSIT_POLICY_AVOID_SUBWAYS = 3;
export const BMAP_TRANSIT_POLICY_LEAST_TIME = 4;
export const BMAP_TRANSIT_POLICY_FIRST_SUBWAYS = 5;
export type TransitPolicy = 0 | 1 | 2 | 3 | 4 | 5;

// ─── TransitType ───
export const BMAP_TRANSIT_TYPE_IN_CITY = 0;
export const BMAP_TRANSIT_TYPE_CROSS_CITY = 1;
export type TransitType = 0 | 1;

// ─── TransitVehicleType ───
export const BMAP_TRANSIT_TYPE_POLICY_TRAIN = 0;
export const BMAP_TRANSIT_TYPE_POLICY_AIRPLANE = 1;
export const BMAP_TRANSIT_TYPE_POLICY_COACH = 2;
export type TransitVehicleType = 0 | 1 | 2;

// ─── TransitPlanType ───
export const BMAP_TRANSIT_PLAN_TYPE_ROUTE = 0;
export const BMAP_TRANSIT_PLAN_TYPE_LINE = 1;
export type TransitPlanType = 0 | 1;

// ─── IntercityPolicy ───
export const BMAP_INTERCITY_POLICY_LEAST_TIME = 0;
export const BMAP_INTERCITY_POLICY_EARLY_START = 1;
export const BMAP_INTERCITY_POLICY_CHEAP_PRICE = 2;
export type IntercityPolicy = 0 | 1 | 2;

// ─── Language ───
export const BMAP_LANGUAGE_ZH = 'zh';
export const BMAP_LANGUAGE_EN = 'en';
export const BMAP_LANGUAGE_ZH_TW = 'zh-TW';
export const BMAP_LANGUAGE_ES = 'es';
export const BMAP_LANGUAGE_PT = 'pt';
export const BMAP_LANGUAGE_FR = 'fr';
export const BMAP_LANGUAGE_DE = 'de';
export const BMAP_LANGUAGE_TH = 'th';
export const BMAP_LANGUAGE_JA = 'ja';
export const BMAP_LANGUAGE_KO = 'ko';
export const BMAP_LANGUAGE_TR = 'tr';
export const BMAP_LANGUAGE_IT = 'it';
export const BMAP_LANGUAGE_RU = 'ru';
export const BMAP_LANGUAGE_MS = 'ms';
export const BMAP_LANGUAGE_VI = 'vi';
export const BMAP_LANGUAGE_ID = 'id';
export type Language = string;

// ─── LengthUnit ───
export const BMAP_UNIT_METRIC = 'metric';
export const BMAP_UNIT_IMPERIAL = 'us';
export type LengthUnit = 'metric' | 'us';

// ─── CoordType ───
export const BMAP_COORD_MERCATOR = 'BMAP_COORD_MERCATOR';
export const BMAP_COORD_GCJ02 = 'BMAP_COORD_GCJ02';
export const BMAP_COORD_BD09 = 'BMAP_COORD_BD09';
export const BMAP_COORD_GCJ02MERCATOR = 'BMAP_COORD_GCJ02MERCATOR';
export const BMAP_COORD_WGS84 = 'BMAP_COORD_WGS84';
export const BMAP_COORD_EPSG3857 = 'BMAP_COORD_EPSG3857';
export type CoordType = string;

// ─── SymbolShapeType ───
export const BMap_Symbol_SHAPE_CIRCLE = 1;
export const BMap_Symbol_SHAPE_RECTANGLE = 2;
export const BMap_Symbol_SHAPE_RHOMBUS = 3;
export const BMap_Symbol_SHAPE_STAR = 4;
export const BMap_Symbol_SHAPE_BACKWARD_CLOSED_ARROW = 5;
export const BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW = 6;
export const BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW = 7;
export const BMap_Symbol_SHAPE_FORWARD_OPEN_ARROW = 8;
export const BMap_Symbol_SHAPE_POINT = 9;
export const BMap_Symbol_SHAPE_PLANE = 10;
export const BMap_Symbol_SHAPE_CAMERA = 11;
export const BMap_Symbol_SHAPE_WARNING = 12;
export const BMap_Symbol_SHAPE_SMILE = 13;
export const BMap_Symbol_SHAPE_CLOCK = 14;
export type SymbolShapeType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

// ─── ShapeType (PointCollection) ───
export const BMAP_POINT_SHAPE_STAR = 1;
export const BMAP_POINT_SHAPE_WATERDROP = 2;
export const BMAP_POINT_SHAPE_CIRCLE = 3;
export const BMAP_POINT_SHAPE_SQUARE = 4;
export const BMAP_POINT_SHAPE_RHOMBUS = 5;
export type ShapeType = 1 | 2 | 3 | 4 | 5;

// ─── SizeType (PointCollection) ───
export const BMAP_POINT_SIZE_TINY = 1;
export const BMAP_POINT_SIZE_SMALLER = 2;
export const BMAP_POINT_SIZE_SMALL = 3;
export const BMAP_POINT_SIZE_NORMAL = 4;
export const BMAP_POINT_SIZE_BIG = 5;
export const BMAP_POINT_SIZE_BIGGER = 6;
export const BMAP_POINT_SIZE_HUGE = 7;
export type SizeType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ─── Marker3DShapeType ───
export const BMAP_SHAPE_CIRCLE = 1;
export const BMAP_SHAPE_RECT = 2;
export type Marker3DShapeType = 1 | 2;

// ─── HighlightModes ───
export const BMAP_HIGHLIGHT_STEP = 1;
export const BMAP_HIGHLIGHT_ROUTE = 2;
export type HighlightMode = 1 | 2;

// ─── POIType ───
export const BMAP_POI_TYPE_NORMAL = 0;
export const BMAP_POI_TYPE_BUSSTOP = 1;
export const BMAP_POI_TYPE_BUSLINE = 2;
export const BMAP_POI_TYPE_SUBSTOP = 3;
export const BMAP_POI_TYPE_SUBLINE = 4;
export type POIType = 0 | 1 | 2 | 3 | 4;

// ─── Mode ───
export const BMAP_MODE_DRIVING = 'driving';
export const BMAP_MODE_TRANSIT = 'transit';
export const BMAP_MODE_WALKING = 'walking';
export const BMAP_MODE_NAVIGATION = 'navigation';
export type Mode = 'driving' | 'transit' | 'walking' | 'navigation';

// ─── RouteStatus ───
export const BMAP_ROUTE_STATUS_NORMAL = 0;
export const BMAP_ROUTE_STATUS_EMPTY = 1;
export const BMAP_ROUTE_STATUS_ADDRESS = 2;
export type RouteStatus = 0 | 1 | 2;

// ─── RouteType ───
export const BMAP_ROUTE_TYPE_WALKING = 2;
export const BMAP_ROUTE_TYPE_DRIVING = 3;
export const BMAP_ROUTE_TYPE_RIDING = 6;
export type RouteType = 2 | 3 | 6;

// ─── TrafficStatus ───
export const BMAP_TRAFFICE_STATUS_NONE = 0;
export const BMAP_TRAFFICE_STATUS_NORMAL = 1;
export const BMAP_TRAFFICE_STATUS_SLOW = 2;
export const BMAP_TRAFFICE_STATUS_JAM = 3;
export type TrafficStatus = 0 | 1 | 2 | 3;

// ─── PointDensityType ───
export const BMAP_POINT_DENSITY_HIGH = 200;
export const BMAP_POINT_DENSITY_MEDIUM = 100;
export const BMAP_POINT_DENSITY_LOW = 50;
export type PointDensityType = 200 | 100 | 50;

// ─── ContextMenuIcon ───
export const BMAP_CONTEXT_MENU_ICON_ZOOMIN: string = 'BMAP_CONTEXT_MENU_ICON_ZOOMIN';
export const BMAP_CONTEXT_MENU_ICON_ZOOMOUT: string = 'BMAP_CONTEXT_MENU_ICON_ZOOMOUT';
export type ContextMenuIcon = string;

// ─── LineType ───
export const BMAP_LINE_TYPE_BUS = 0;
export const BMAP_LINE_TYPE_SUBWAY = 1;
export const BMAP_LINE_TYPE_FERRY = 2;
export const BMAP_LINE_TYPE_TRAIN = 3;
export const BMAP_LINE_TYPE_AIRPLANE = 4;
export const BMAP_LINE_TYPE_COACH = 5;
export type LineType = 0 | 1 | 2 | 3 | 4 | 5;

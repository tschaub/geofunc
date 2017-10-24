const arrayOf = (length, func) => Array.from({length}, func);

const coordinate = () => [
  Math.round(Math.random() * 360) - 180,
  Math.round(Math.random() * 180) - 90
];

const point = () => ({
  type: 'Point',
  coordinates: coordinate()
});

const multiPoint = length => ({
  type: 'MultiPoint',
  coordinates: arrayOf(length, coordinate)
});

const lineString = length => ({
  type: 'LineString',
  coordinates: arrayOf(length, coordinate)
});

const multiLineString = length => ({
  type: 'MultiLineString',
  coordinates: arrayOf(length, () => arrayOf(length, coordinate))
});

const polygon = length => ({
  type: 'Polygon',
  coordinates: arrayOf(length, () => arrayOf(length, coordinate))
});

const multiPolygon = length => ({
  type: 'MultiPolygon',
  coordinates: arrayOf(length, () =>
    arrayOf(length, () => arrayOf(length, coordinate))
  )
});

const geometryCollection = geometries => ({
  type: 'GeometryCollection',
  geometries: geometries
});

const feature = geometry => ({
  type: 'Feature',
  geometry: geometry
});

const featureCollection = features => ({
  type: 'FeatureCollection',
  features: features
});

exports.point = point;
exports.multiPoint = multiPoint;
exports.lineString = lineString;
exports.multiLineString = multiLineString;
exports.polygon = polygon;
exports.multiPolygon = multiPolygon;
exports.geometryCollection = geometryCollection;
exports.feature = feature;
exports.featureCollection = featureCollection;
exports.arrayOf = arrayOf;

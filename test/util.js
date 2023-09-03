export const arrayOf = (length, func) => Array.from({length}, func);

const coordinate = () => [
  Math.round(Math.random() * 360) - 180,
  Math.round(Math.random() * 180) - 90,
];

export const point = () => ({
  type: 'Point',
  coordinates: coordinate(),
});

export const multiPoint = (length) => ({
  type: 'MultiPoint',
  coordinates: arrayOf(length, coordinate),
});

export const lineString = (length) => ({
  type: 'LineString',
  coordinates: arrayOf(length, coordinate),
});

export const multiLineString = (length) => ({
  type: 'MultiLineString',
  coordinates: arrayOf(length, () => arrayOf(length, coordinate)),
});

export const polygon = (length) => ({
  type: 'Polygon',
  coordinates: arrayOf(length, () => arrayOf(length, coordinate)),
});

export const multiPolygon = (length) => ({
  type: 'MultiPolygon',
  coordinates: arrayOf(length, () =>
    arrayOf(length, () => arrayOf(length, coordinate))
  ),
});

export const geometryCollection = (geometries) => ({
  type: 'GeometryCollection',
  geometries: geometries,
});

export const feature = (geometry) => ({
  type: 'Feature',
  geometry: geometry,
});

export const featureCollection = (features) => ({
  type: 'FeatureCollection',
  features: features,
});

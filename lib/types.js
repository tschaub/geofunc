var types = {
  FeatureCollection: 'FeatureCollection',
  Feature: 'Feature',
  GeometryCollection: 'GeometryCollection',
  Geometry: 'Geometry',
  MultiPolygon: 'MultiPolygon',
  MultiLineString: 'MultiLineString',
  MultiPoint: 'MultiPoint',
  Polygon: 'Polygon',
  LineString: 'LineString',
  LinearRing: 'LinearRing',
  Point: 'Point',
  Coordinate: 'Coordinate'
};

function isGeometry(type) {
  return type === types.MultiPolygon ||
      type === types.MultiLineString ||
      type === types.MultiPoint ||
      type === types.Polygon ||
      type === types.LineString ||
      type === types.Point;
}

function contains(parent, child) {
  var contained = false;
  switch (parent) {
    case types.FeatureCollection: {
      contained = child === types.Feature || contains(types.Feature, child);
      break;
    }
    case types.Feature: {
      contained = child === types.GeometryCollection || contains(types.GeometryCollection, child);
      break;
    }
    case types.GeometryCollection: {
      contained = child === types.Geometry ||
          isGeometry(child) ||
          child === types.LinearRing ||
          child === types.Coordinate;
      break;
    }
    case types.MultiPolygon:
    case types.Polygon: {
      contained = child === types.LinearRing || child === types.Coordinate;
      break;
    }
    case types.MultiLineString:
    case types.MultiPoint:
    case types.LineString:
    case types.Point: {
      contained = child === types.Coordinate;
      break;
    }
    default: {
      throw new Error('Unsupported GeoJSON type: ' + parent);
    }
  }
  return contained;
}

exports = module.exports = types;
exports.contains = contains;

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

function contains(parent, children) {
  var contained = false;
  switch (parent) {
    case types.FeatureCollection: {
      contained =
        types.Feature in children || contains(types.Feature, children);
      break;
    }
    case types.Feature: {
      contained =
        types.GeometryCollection in children ||
        contains(types.GeometryCollection, children);
      break;
    }
    case types.GeometryCollection: {
      contained =
        types.Geometry in children ||
        types.MultiPolygon in children ||
        types.MultiLineString in children ||
        types.MultiPoint in children ||
        types.Polygon in children ||
        types.LineString in children ||
        types.Point in children ||
        types.LinearRing in children ||
        types.Coordinate in children;
      break;
    }
    case types.MultiPolygon:
    case types.Polygon: {
      contained = types.LinearRing in children || types.Coordinate in children;
      break;
    }
    case types.MultiLineString:
    case types.MultiPoint:
    case types.LineString:
    case types.Point: {
      contained = types.Coordinate in children;
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

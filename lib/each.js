var types = require('./types');

function visit(json, type, visitor) {
  if (json.type === type) {
    visitor(json);
  } else {
    var i, ii;
    switch (json.type) {
      case types.FeatureCollection: {
        if (types.contains(types.FeatureCollection, type)) {
          visitEach(json.features, type, visitor);
        }
        break;
      }
      case types.Feature: {
        if (types.contains(types.Feature, type)) {
          visit(json.geometry, type, visitor);
        }
        break;
      }
      case types.GeometryCollection: {
        if (types.contains(types.GeometryCollection, type)) {
          visitEach(json.geometries, type, visitor);
        }
        break;
      }
      case types.MultiPolygon: {
        if (type === types.Geometry) {
          visitor(json);
        } else if (type === types.LinearRing) {
          for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
            visitEachItem(json.coordinates[i], visitor);
          }
        } else if (type === types.Coordinate) {
          for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
            var polygonCoordinates = json.coordinates[i];
            for (var j = 0, jj = polygonCoordinates.length; j < jj; ++j) {
              visitEachItem(polygonCoordinates[j], visitor);
            }
          }
        }
        break;
      }
      case types.MultiLineString: {
        if (type === types.Geometry) {
          visitor(json);
        } else if (type === types.Coordinate) {
          for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
            visitEachItem(json.coordinates[i], visitor);
          }
        }
        break;
      }
      case types.Polygon: {
        if (type === types.Geometry) {
          visitor(json);
        } else if (type === types.LinearRing) {
          visitEachItem(json.coordinates, visitor);
        } else if (type === types.Coordinate) {
          for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
            visitEachItem(json.coordinates[i], visitor);
          }
        }
        break;
      }
      case types.MultiPoint: {
        if (type === types.Geometry) {
          visitor(json);
        } else if (type === types.Coordinate) {
          visitEachItem(json.coordinates, visitor);
        }
        break;
      }
      case types.LineString: {
        if (type === types.Geometry) {
          visitor(json);
        } else if (type === types.Coordinate) {
          visitEachItem(json.coordinates, visitor);
        }
        break;
      }
      case types.Point: {
        if (type === types.Geometry) {
          visitor(json);
        } else if (type === types.Coordinate) {
          visitor(json.coordinates);
        }
        break;
      }
      default: {
        throw new Error('Unrecognized GeoJSON type: ' + json.type);
      }
    }
  }
}

function visitEachItem(coordinates, visitor) {
  for (var i = 0, ii = coordinates.length; i < ii; ++i) {
    visitor(coordinates[i]);
  }
}

function visitEach(array, type, visitor) {
  for (var i = 0, ii = array.length; i < ii; ++i) {
    visit(array[i], type, visitor);
  }
}

module.exports = function(type, visitor) {
  return function(json) {
    visit(json, type, visitor);
  };
};

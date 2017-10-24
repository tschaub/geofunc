var types = require('./types');

function visit(json, visitors) {
  if (json.type in visitors) {
    visitors[json.type](json);
  }
  var i, ii;
  switch (json.type) {
    case types.FeatureCollection: {
      if (types.contains(types.FeatureCollection, visitors)) {
        visitEach(json.features, visitors);
      }
      break;
    }
    case types.Feature: {
      if (types.contains(types.Feature, visitors)) {
        visit(json.geometry, visitors);
      }
      break;
    }
    case types.GeometryCollection: {
      if (types.contains(types.GeometryCollection, visitors)) {
        visitEach(json.geometries, visitors);
      }
      break;
    }
    case types.MultiPolygon: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](json);
      }
      if (types.LinearRing in visitors) {
        for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
          visitEachItem(json.coordinates[i], visitors[types.LinearRing]);
        }
      }
      if (types.Coordinate in visitors) {
        for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
          var polygonCoordinates = json.coordinates[i];
          for (var j = 0, jj = polygonCoordinates.length; j < jj; ++j) {
            visitEachItem(polygonCoordinates[j], visitors[types.Coordinate]);
          }
        }
      }
      break;
    }
    case types.MultiLineString: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](json);
      }
      if (types.Coordinate in visitors) {
        for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
          visitEachItem(json.coordinates[i], visitors[types.Coordinate]);
        }
      }
      break;
    }
    case types.Polygon: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](json);
      }
      if (types.LinearRing in visitors) {
        visitEachItem(json.coordinates, visitors[types.LinearRing]);
      }
      if (types.Coordinate in visitors) {
        for (i = 0, ii = json.coordinates.length; i < ii; ++i) {
          visitEachItem(json.coordinates[i], visitors[types.Coordinate]);
        }
      }
      break;
    }
    case types.MultiPoint: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](json);
      }
      if (types.Coordinate in visitors) {
        visitEachItem(json.coordinates, visitors[types.Coordinate]);
      }
      break;
    }
    case types.LineString: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](json);
      }
      if (types.Coordinate in visitors) {
        visitEachItem(json.coordinates, visitors[types.Coordinate]);
      }
      break;
    }
    case types.Point: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](json);
      }
      if (types.Coordinate in visitors) {
        visitors[types.Coordinate](json.coordinates);
      }
      break;
    }
    default: {
      throw new Error('Unrecognized GeoJSON type: ' + json.type);
    }
  }
}

function visitEachItem(coordinates, visitor) {
  for (var i = 0, ii = coordinates.length; i < ii; ++i) {
    visitor(coordinates[i]);
  }
}

function visitEach(array, visitors) {
  for (var i = 0, ii = array.length; i < ii; ++i) {
    visit(array[i], visitors);
  }
}

module.exports = function(visitors) {
  if (arguments.length === 2) {
    var type = arguments[0];
    var visitor = arguments[1];
    visitors = {};
    visitors[type] = visitor;
  }
  return function(json) {
    visit(json, visitors);
  };
};

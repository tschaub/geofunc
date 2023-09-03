import {contains, types} from './types.js';

function visit(data, visitors) {
  if (data.type in visitors) {
    visitors[data.type](data);
  }
  let i, ii;
  switch (data.type) {
    case types.FeatureCollection: {
      if (contains(types.FeatureCollection, visitors)) {
        visitEach(data.features, visitors);
      }
      break;
    }
    case types.Feature: {
      if (contains(types.Feature, visitors)) {
        visit(data.geometry, visitors);
      }
      break;
    }
    case types.GeometryCollection: {
      if (contains(types.GeometryCollection, visitors)) {
        visitEach(data.geometries, visitors);
      }
      break;
    }
    case types.MultiPolygon: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](data);
      }
      if (types.LinearRing in visitors) {
        for (i = 0, ii = data.coordinates.length; i < ii; ++i) {
          visitEachItem(data.coordinates[i], visitors[types.LinearRing]);
        }
      }
      if (types.Coordinate in visitors) {
        for (i = 0, ii = data.coordinates.length; i < ii; ++i) {
          const polygonCoordinates = data.coordinates[i];
          for (let j = 0, jj = polygonCoordinates.length; j < jj; ++j) {
            visitEachItem(polygonCoordinates[j], visitors[types.Coordinate]);
          }
        }
      }
      break;
    }
    case types.MultiLineString: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](data);
      }
      if (types.Coordinate in visitors) {
        for (i = 0, ii = data.coordinates.length; i < ii; ++i) {
          visitEachItem(data.coordinates[i], visitors[types.Coordinate]);
        }
      }
      break;
    }
    case types.Polygon: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](data);
      }
      if (types.LinearRing in visitors) {
        visitEachItem(data.coordinates, visitors[types.LinearRing]);
      }
      if (types.Coordinate in visitors) {
        for (i = 0, ii = data.coordinates.length; i < ii; ++i) {
          visitEachItem(data.coordinates[i], visitors[types.Coordinate]);
        }
      }
      break;
    }
    case types.MultiPoint: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](data);
      }
      if (types.Coordinate in visitors) {
        visitEachItem(data.coordinates, visitors[types.Coordinate]);
      }
      break;
    }
    case types.LineString: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](data);
      }
      if (types.Coordinate in visitors) {
        visitEachItem(data.coordinates, visitors[types.Coordinate]);
      }
      break;
    }
    case types.Point: {
      if (types.Geometry in visitors) {
        visitors[types.Geometry](data);
      }
      if (types.Coordinate in visitors) {
        visitors[types.Coordinate](data.coordinates);
      }
      break;
    }
    default: {
      throw new Error('Unrecognized GeoJSON type: ' + data.type);
    }
  }
}

function visitEachItem(coordinates, visitor) {
  for (let i = 0, ii = coordinates.length; i < ii; ++i) {
    visitor(coordinates[i]);
  }
}

function visitEach(array, visitors) {
  for (let i = 0, ii = array.length; i < ii; ++i) {
    visit(array[i], visitors);
  }
}

export function each(visitors) {
  if (arguments.length === 2) {
    const type = arguments[0];
    const visitor = arguments[1];
    visitors = {};
    visitors[type] = visitor;
  }
  return function (json) {
    visit(json, visitors);
  };
}

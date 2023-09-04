import {beforeEach, describe, expect, it} from '@jest/globals';
import {
  eachCoordinate,
  eachGeometry,
  eachLineString,
  eachPoint,
  eachPolygon,
} from './main.js';

/**
 * @param {number} length The length of the array.
 * @param {function(number): any} func A function that generates the array values.
 * @return {Array<any>} An array of the given length.
 */
function arrayOf(length, func) {
  return Array.from({length}, func);
}

/**
 * @return {Array<number>} A random coordinate.
 */
function coordinate() {
  return [
    Math.round(Math.random() * 360) - 180,
    Math.round(Math.random() * 180) - 90,
  ];
}

/**
 * @return {import("geojson").Point} A random point.
 */
function point() {
  return {type: 'Point', coordinates: coordinate()};
}

/**
 * @param {number} length The number of points in the multi-point.
 * @return {import("geojson").MultiPoint} A random multi-point.
 */
function multiPoint(length) {
  return {
    type: 'MultiPoint',
    coordinates: arrayOf(length, coordinate),
  };
}

/**
 * @param {number} length The number of points in the linestring.
 * @return {import("geojson").LineString} A random linestring.
 */
function lineString(length) {
  return {
    type: 'LineString',
    coordinates: arrayOf(length, coordinate),
  };
}

/**
 * @param {number} length The number of parts in the multi-linestring.
 * @return {import("geojson").MultiLineString} A random multi-linestring.
 */
function multiLineString(length) {
  return {
    type: 'MultiLineString',
    coordinates: arrayOf(length, () => arrayOf(length, coordinate)),
  };
}

/**
 * @param {number} length The number of rings in the polygon.
 * @return {import("geojson").Polygon} A random polygon.
 */
function polygon(length) {
  return {
    type: 'Polygon',
    coordinates: arrayOf(length, () => arrayOf(length, coordinate)),
  };
}

/**
 * @param {number} length The number of parts in the multi-polygon.
 * @return {import("geojson").MultiPolygon} A random multi-polygon.
 */
function multiPolygon(length) {
  return {
    type: 'MultiPolygon',
    coordinates: arrayOf(length, () =>
      arrayOf(length, () => arrayOf(length, coordinate))
    ),
  };
}

/**
 * @param {Array<import("geojson").Geometry>} geometries The geometries in the collection.
 * @return {import("geojson").GeometryCollection} A geometry collection.
 */
function geometryCollection(geometries) {
  return {
    type: 'GeometryCollection',
    geometries: geometries,
  };
}

/**
 * @param {import("geojson").Geometry} geometry The geometry.
 * @return {import("geojson").Feature} A feature.
 */
function feature(geometry) {
  return {
    type: 'Feature',
    geometry: geometry,
    properties: {},
  };
}

/**
 * @param {Array<import("geojson").Feature>} features The features.
 * @return {import("geojson").FeatureCollection} A feature collection.
 */
function featureCollection(features) {
  return {
    type: 'FeatureCollection',
    features: features,
  };
}

describe('eachPoint()', () => {
  it('creates a visitor for Point geometries in a GeometryCollection', () => {
    const firstPoint = point();
    const secondPoint = point();
    const collection = geometryCollection([
      firstPoint,
      lineString(10),
      secondPoint,
    ]);

    /**
     * @type {Array<import("geojson").Point>}
     */
    const args = [];

    let count = 0;
    const countPoints = eachPoint((point) => {
      ++count;
      args.push(point);
    });

    expect(countPoints).toBeInstanceOf(Function);

    countPoints(collection);
    expect(count).toBe(2);
    expect(args).toEqual([secondPoint, firstPoint]);
  });

  it('creates a visitor for Point geometries in a Feature', () => {
    let count = 0;
    const countPoints = eachPoint(() => {
      ++count;
    });

    countPoints(feature(point()));
    expect(count).toBe(1);
    count = 0;

    countPoints(feature(lineString(10)));
    expect(count).toBe(0);
  });

  it('does not visit parts of a MultiPoint', () => {
    let count = 0;
    const countPoints = eachPoint(() => {
      ++count;
    });

    countPoints(multiPoint(10));
    expect(count).toBe(0);
  });

  it('creates a visitor for Point geometries in a FeatureCollection', () => {
    /**
     * @type {Array<import("geojson").Point>}
     */
    const args = [];

    let count = 0;
    const countPoints = eachPoint((point) => {
      ++count;
      args.push(point);
    });

    const firstPoint = point();
    const secondPoint = point();

    const collection = featureCollection([
      feature(firstPoint),
      feature(polygon(3)),
      feature(secondPoint),
      feature(lineString(10)),
    ]);

    countPoints(collection);
    expect(count).toBe(2);
    expect(args).toEqual([secondPoint, firstPoint]);
  });
});

describe('eachLineString()', () => {
  let count = 0;
  const countLines = eachLineString((line) => {
    ++count;
  });
  beforeEach(() => {
    count = 0;
  });

  it('creates a visitor for LineString geometries in a GeometryCollection', () => {
    const lines = arrayOf(10, () => lineString(5));

    /**
     * @type {Array<import("geojson").Geometry>}
     */
    const geometries = [];

    lines.forEach((line) => {
      geometries.push(line);
      geometries.push(point());
      geometries.push(polygon(3));
    });

    const collection = geometryCollection(geometries);

    countLines(collection);
    expect(count).toBe(lines.length);
  });

  it('does not visit parts of a MultiLinestring', () => {
    countLines(multiLineString(3));
    expect(count).toBe(0);
  });
});

describe('eachPolygon()', () => {
  let count = 0;
  const countPolygons = eachPolygon((polygon) => {
    ++count;
  });
  beforeEach(() => {
    count = 0;
  });

  it('creates a visitor for Polygon geometries in a GeometryCollection', () => {
    const collection = geometryCollection([
      point(),
      polygon(3),
      lineString(10),
      polygon(2),
      point(),
      polygon(1),
    ]);

    countPolygons(collection);
    expect(count).toBe(3);
  });

  it('does not visit parts of a MultiPolygon', () => {
    countPolygons(multiPolygon(3));
    expect(count).toBe(0);
  });
});

describe('eachGeometry()', () => {
  let count = 0;
  const countGeometries = eachGeometry((geometry) => {
    ++count;
  });
  beforeEach(() => {
    count = 0;
  });

  it('creates a visitor for all geometry types in a FeatureCollection', () => {
    const collection = featureCollection([
      feature(point()),
      feature(polygon(3)),
      feature(point()),
      feature(lineString(10)),
      feature(point()),
      feature(polygon(2)),
      feature(point()),
      feature(point()),
      feature(polygon(1)),
    ]);

    countGeometries(collection);
    expect(count).toBe(collection.features.length);
  });

  it('only visits GeometryCollection once', () => {
    const collection = geometryCollection([
      point(),
      polygon(3),
      lineString(10),
    ]);

    countGeometries(collection);
    expect(count).toBe(3);
  });
});

describe('eachCoordinate()', () => {
  it('creates a visitor for all coordintes in a LineString', () => {
    let count = 0;
    const countCoordinates = eachCoordinate((coordinate) => {
      ++count;
      expect(coordinate).toBeInstanceOf(Array);
      expect(coordinate.length).toBe(2);
    });

    const length = 10;
    countCoordinates(lineString(length));
    expect(count).toBe(length);
  });

  it('creates a visitor for all coordintes in a FeatureCollection', () => {
    let count = 0;
    const countCoordinates = eachCoordinate((coordinate) => {
      ++count;
      expect(coordinate).toBeInstanceOf(Array);
      expect(coordinate.length).toBe(2);
    });

    const features = featureCollection([
      feature(point()), // 1 coordinate
      feature(lineString(10)), // 10 coordinates
      feature(polygon(4)), // 16 coordinates
    ]);
    countCoordinates(features);
    expect(count).toBe(27);
  });
});

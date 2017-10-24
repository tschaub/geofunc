const {
  point,
  multiPoint,
  lineString,
  multiLineString,
  polygon,
  multiPolygon,
  geometryCollection,
  feature,
  featureCollection
} = require('./util');

describe('point()', () => {
  it('creates a GeoJSON Point', () => {
    const obj = point();
    expect(obj.type).toBe('Point');
    expect(Array.isArray(obj.coordinates)).toBe(true);
    expect(obj.coordinates.length).toBe(2);
  });
});

describe('multiPoint()', () => {
  it('creates a GeoJSON MultiPoint', () => {
    const length = 10;
    const obj = multiPoint(length);
    expect(obj.type).toBe('MultiPoint');
    expect(Array.isArray(obj.coordinates)).toBe(true);
    expect(obj.coordinates.length).toBe(length);
    obj.coordinates.forEach(coordinate => {
      expect(coordinate.length).toBe(2);
    });
  });
});

describe('lineString()', () => {
  it('creates a GeoJSON LineString', () => {
    const length = 15;
    const obj = lineString(length);
    expect(obj.type).toBe('LineString');
    expect(Array.isArray(obj.coordinates)).toBe(true);
    expect(obj.coordinates.length).toBe(length);
    obj.coordinates.forEach(coordinate => {
      expect(coordinate.length).toBe(2);
    });
  });
});

describe('multiLineString()', () => {
  it('creates a GeoJSON MultiLineString', () => {
    const length = 20;
    const obj = multiLineString(length);
    expect(obj.type).toBe('MultiLineString');
    expect(Array.isArray(obj.coordinates)).toBe(true);
    expect(obj.coordinates.length).toBe(length);
    obj.coordinates.forEach(lineCoordinates => {
      lineCoordinates.forEach(coordinate => {
        expect(coordinate.length).toBe(2);
      });
    });
  });
});

describe('polygon()', () => {
  it('creates a GeoJSON Polygon', () => {
    const length = 3;
    const obj = polygon(length);
    expect(obj.type).toBe('Polygon');
    expect(Array.isArray(obj.coordinates)).toBe(true);
    expect(obj.coordinates.length).toBe(length);
    obj.coordinates.forEach(ringCoordinates => {
      ringCoordinates.forEach(coordinate => {
        expect(coordinate.length).toBe(2);
      });
    });
  });
});

describe('multiPolygon()', () => {
  it('creates a GeoJSON MultiPolygon', () => {
    const length = 3;
    const obj = multiPolygon(length);
    expect(obj.type).toBe('MultiPolygon');
    expect(Array.isArray(obj.coordinates)).toBe(true);
    expect(obj.coordinates.length).toBe(length);
    obj.coordinates.forEach(polyCoordinates => {
      polyCoordinates.forEach(ringCoordinates => {
        ringCoordinates.forEach(coordinate => {
          expect(coordinate.length).toBe(2);
        });
      });
    });
  });
});

describe('geometryCollection()', () => {
  it('creates a GeoJSON GeometryCollection', () => {
    const geometries = [point(), lineString(10), polygon(2)];
    const collection = geometryCollection(geometries);
    expect(collection.type).toBe('GeometryCollection');
    expect(collection.geometries).toEqual(geometries);
  });
});

describe('feature()', () => {
  it('creates a GeoJSON Feature', () => {
    const geometry = point();
    const obj = feature(geometry);
    expect(obj.type).toBe('Feature');
    expect(obj.geometry).toEqual(geometry);
  });
});

describe('featureCollection()', () => {
  it('creates a GeoJSON FeatureCollection', () => {
    const features = [
      feature(point()),
      feature(lineString()),
      feature(polygon())
    ];
    const collection = featureCollection(features);
    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toEqual(features);
  });
});

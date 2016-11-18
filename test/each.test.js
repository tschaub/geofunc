const each = require('../lib/each');
const util = require('./util');

describe('each()', () => {

  it('creates a visitor for Point geometries in a GeometryCollection', () => {
    const collection = util.geometryCollection([
      util.point(),
      util.lineString(10),
      util.point()
    ]);

    let count = 0;
    const args = [];
    const eachPoint = each('Point', point => {
      ++count;
      args.push(point);
    });

    expect(eachPoint).toBeInstanceOf(Function);

    eachPoint(collection);
    expect(count).toBe(2);
    expect(args).toEqual([collection.geometries[0], collection.geometries[2]]);
  });

  it('creates a visitor for Point geometries in a Feature', () => {
    let count = 0;
    const eachPoint = each('Point', point => ++count);

    eachPoint(util.feature(util.point()));
    expect(count).toBe(1);

    eachPoint(util.feature(util.lineString()));
    expect(count).toBe(1);
  });

  it('creates a visitor for Point geometries in a FeatureCollection', () => {
    let count = 0;
    const args = [];
    const eachPoint = each('Point', point => {
      ++count;
      args.push(point);
    });

    const collection = util.featureCollection([
      util.feature(util.point()),
      util.feature(util.polygon(3)),
      util.feature(util.point()),
      util.feature(util.lineString(10))
    ]);

    eachPoint(collection);
    expect(count).toBe(2);
    expect(args).toEqual([
      collection.features[0].geometry,
      collection.features[2].geometry
    ]);
  });

  it('creates a visitor for LineString geometries in a GeometryCollection', () => {
    const count = 10;
    const lines = util.arrayOf(count, () => util.lineString(5));
    const geometries = [];
    lines.forEach(line => {
      geometries.push(line);
      geometries.push(util.point());
      geometries.push(util.polygon(3));
    });

    const collection = util.geometryCollection(geometries);

    let got = 0;
    const eachLine = each('LineString', line => ++got);

    eachLine(collection);
    expect(got).toBe(count);
  });

  it('creates a visitor for Polygon geometries in a GeometryCollection', () => {
    let count = 0;
    const eachPolygon = each('Polygon', polygon => ++count);

    const collection = util.geometryCollection([
      util.point(),
      util.polygon(3),
      util.lineString(10),
      util.polygon(2),
      util.point(),
      util.polygon(1)
    ]);

    eachPolygon(collection);
    expect(count).toBe(3);
  });

  it('creates a visitor for all geometry types in a GeometryCollection', () => {
    let count = 0;
    const eachGeometry = each('Geometry', geometry => ++count);

    const collection = util.geometryCollection([
      util.point(),
      util.polygon(3),
      util.point(),
      util.lineString(10),
      util.point(),
      util.polygon(2),
      util.point(),
      util.point(),
      util.polygon(1)
    ]);

    eachGeometry(collection);
    expect(count).toBe(collection.geometries.length);
  });

  it('creates a visitor for all geometry types', () => {
    let count = 0;
    const eachGeometry = each('Geometry', geometry => ++count);

    eachGeometry(util.point());
    expect(count).toBe(1);
  });

  it('creates a visitor for all coordintes in a LineString', () => {
    let count = 0;
    const eachCoordinate = each('Coordinate', coordinate => {
      ++count;
      expect(coordinate).toBeInstanceOf(Array);
      expect(coordinate.length).toBe(2);
    });

    const length = 10;
    eachCoordinate(util.lineString(length));
    expect(count).toBe(length);
  });

  it('creates a visitor for all coordintes in a FeatureCollection', () => {
    let count = 0;
    const eachCoordinate = each('Coordinate', coordinate => {
      ++count;
      expect(coordinate).toBeInstanceOf(Array);
      expect(coordinate.length).toBe(2);
    });

    const features = util.featureCollection([
      util.point(), // 1 coordinate
      util.lineString(10), // 10 coordinates
      util.polygon(4) // 16 coordinates
    ]);
    eachCoordinate(features);
    expect(count).toBe(27);
  });

});

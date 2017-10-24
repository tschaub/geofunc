# geofunc

The `geofunc` package provides functions for processing GeoJSON.

## Supported Types

Visitors can be registered for any of the [GeoJSON](http://geojson.org/) object types.  In addition, you can register a generic `Geometry` visitor, a visitor for `LinearRing`, and a visitor for `Coordinate`.  Where "type" is used in the API, you can provide one of the following strings:

 * `FeatureCollection`
 * `Feature`
 * `GeometryCollection`
 * `MultiPolygon`
 * `MultiLineString`
 * `MultiPoint`
 * `Polygon`
 * `LineString`
 * `Point`
 * `Geometry`
 * `LinearRing`
 * `Coordinate`

## `each(visitors)`

Call a function for each object of a certain type.  Properties in the `visitors` object can be any of the supported types, and values are functions to be called with the corresponding objects.  The `each` function returns a function that can be called with any GeoJSON object.

For example:

```js
const geofunc = require('geofunc');

let count = 0;
const countPoints = geofunc.each({
  Point: function(point) {
    ++count;
  }
});

// this will count all the Point geometries
countPoints(collection);
```

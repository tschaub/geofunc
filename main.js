/**
 * @typedef {import("geojson").GeoJSON} GeoJSON
 * @typedef {import("geojson").Feature} Feature
 * @typedef {import("geojson").FeatureCollection} FeatureCollection
 * @typedef {import("geojson").Geometry} Geometry
 * @typedef {import("geojson").Point} Point
 * @typedef {import("geojson").LineString} LineString
 * @typedef {import("geojson").Polygon} Polygon
 * @typedef {import("geojson").MultiPoint} MultiPoint
 * @typedef {import("geojson").MultiLineString} MultiLineString
 * @typedef {import("geojson").MultiPolygon} MultiPolygon
 * @typedef {import("geojson").GeometryCollection} GeometryCollection
 */

const Point = 'Point';
const LineString = 'LineString';
const Polygon = 'Polygon';
const MultiPoint = 'MultiPoint';
const MultiLineString = 'MultiLineString';
const MultiPolygon = 'MultiPolygon';
const GeometryCollection = 'GeometryCollection';
const Feature = 'Feature';
const FeatureCollection = 'FeatureCollection';

/**
 * @template {GeoJSON} O
 * @typedef {function(O): O|null|false|void} Callback
 */

/**
 * @typedef {function(Array<number>): false|void} CoordinateCallback
 */

/**
 * @typedef {Object} Callbacks
 * @property {Callback<Point>} [Point] The function to call for each Point.
 * @property {Callback<LineString>} [LineString] The function to call for each LineString.
 * @property {Callback<Polygon>} [Polygon] The function to call for each Polygon.
 * @property {Callback<MultiPoint>} [MultiPoint] The function to call for each MultiPoint.
 * @property {Callback<MultiLineString>} [MultiLineString] The function to call for each MultiLineString.
 * @property {Callback<MultiPolygon>} [MultiPolygon] The function to call for each MultiPolygon.
 * @property {Callback<GeometryCollection>} [GeometryCollection] The function to call for each GeometryCollection.
 * @property {Callback<Geometry>} [Geometry] The function to call for each geometry.
 * @property {Callback<Feature>} [Feature] The function to call for each Feature.
 * @property {CoordinateCallback} [Coordinate] The function to call for each coordinate.
 */

/**
 * @template {Geometry} G
 * @typedef {function(GeoJSON, Callback<G>): G|null|false|void} GeometryVisitor
 */

/**
 * @param {GeoJSON} data The data to visit.
 * @param {Callbacks} callbacks The functions to call while traversing the data.
 * @return {Geometry|Feature|null|false|void} The callback return value.
 */
function visit(data, callbacks) {
  if (
    data.type === Point ||
    data.type === LineString ||
    data.type === Polygon ||
    data.type === MultiPoint ||
    data.type === MultiLineString ||
    data.type === MultiPolygon
  ) {
    return visitSimpleGeometry(data, callbacks);
  }
  if (data.type === GeometryCollection) {
    for (let i = data.geometries.length - 1; i >= 0; --i) {
      const v = visit(data.geometries[i], callbacks);
      if (v === false) {
        return v;
      }
      if (v === null) {
        data.geometries.splice(i, 1);
      } else if (v) {
        data.geometries[i] = /** @type {Geometry} */ (v);
      }
    }
    if (callbacks.GeometryCollection) {
      return callbacks.GeometryCollection(data);
    }
    return;
  }
  if (data.type === Feature) {
    const v = visit(data.geometry, callbacks);
    if (v === false) {
      return v;
    }
    if (v === null || v) {
      data.geometry = /** @type {Geometry} */ (v);
    }
    if (callbacks.Feature) {
      const v = callbacks.Feature(data);
      if (v === false || v === null) {
        return v;
      }
      if (v) {
        return v;
      }
    }
    return;
  }
  if (data.type !== FeatureCollection) {
    throw new Error('Unexpected GeoJSON type: ' + data['type']);
  }
  for (let i = data.features.length - 1; i >= 0; --i) {
    const v = visit(data.features[i], callbacks);
    if (v === false) {
      return v;
    }
    if (v === null) {
      data.features.splice(i, 1);
    } else if (v) {
      data.features[i] = /** @type {Feature} */ (v);
    }
  }
}

/**
 * @template {Point|LineString|Polygon|MultiPoint|MultiLineString|MultiPolygon} G
 * @param {G} data The data to visit.
 * @param {Callbacks} callbacks The functions to call while traversing the data.
 * @return {G|null|false|void} The callback return value.
 */
function visitSimpleGeometry(data, callbacks) {
  if (callbacks.Coordinate) {
    const v = visitCoordinates(data, callbacks.Coordinate);
    if (v === false) {
      return v;
    }
  }
  /**
   * @type {G|undefined}
   */
  let replaced;
  const callback = /** @type {Callback<G>|undefined} */ (callbacks[data.type]);
  if (callback) {
    const v = callback(data);
    if (v === false || v === null) {
      return v;
    }
    if (v) {
      replaced = v;
    }
  }
  if (callbacks.Geometry) {
    const v = callbacks.Geometry(replaced || data);
    if (v === false || v === null) {
      return v;
    }
    if (v) {
      if (v.type !== data.type) {
        throw new Error('Expected Geometry callback to return a ' + data.type);
      }
      replaced = /** @type {G} */ (v);
    }
  }
  return replaced;
}

/**
 * @param {GeoJSON} data The data to visit.
 * @param {CoordinateCallback} callback The function to call for each coordinate.
 * @return {false|void} The callback return value.
 */
function visitCoordinates(data, callback) {
  if (data.type === Point) {
    return callback(data.coordinates);
  }
  if (data.type === LineString || data.type === MultiPoint) {
    for (let i = data.coordinates.length - 1; i >= 0; --i) {
      const v = callback(data.coordinates[i]);
      if (v === false) {
        return v;
      }
    }
    return;
  }
  if (data.type === Polygon || data.type === MultiLineString) {
    for (let i = data.coordinates.length - 1; i >= 0; --i) {
      const positions = data.coordinates[i];
      for (let j = positions.length - 1; j >= 0; --j) {
        const v = callback(positions[j]);
        if (v === false) {
          return v;
        }
      }
    }
    return;
  }
  if (data.type === MultiPolygon) {
    for (let i = data.coordinates.length - 1; i >= 0; --i) {
      const parts = data.coordinates[i];
      for (let j = parts.length - 1; j >= 0; --j) {
        const rings = parts[j];
        for (let k = rings.length - 1; k >= 0; --k) {
          const v = callback(rings[k]);
          if (v === false) {
            return v;
          }
        }
      }
    }
    return;
  }
  if (data.type === GeometryCollection) {
    for (let i = data.geometries.length - 1; i >= 0; --i) {
      const v = visitCoordinates(data.geometries[i], callback);
      if (v === false) {
        return v;
      }
    }
    return;
  }
  if (data.type === Feature) {
    return visitCoordinates(data.geometry, callback);
  }
  if (data.type === FeatureCollection) {
    for (let i = data.features.length - 1; i >= 0; --i) {
      const v = visitCoordinates(data.features[i], callback);
      if (v === false) {
        return v;
      }
    }
    return;
  }
}

/**
 * @param {Callback<Point>} callback The function to call for each Point.
 * @return {function(GeoJSON): void} A function that can be used to visit each Point in a GeoJSON object.
 */
export function eachPoint(callback) {
  const callbacks = {Point: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<LineString>} callback The function to call for each LineString.
 * @return {function(GeoJSON): void} A function that can be used to visit each LineString in a GeoJSON object.
 */
export function eachLineString(callback) {
  const callbacks = {LineString: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<Polygon>} callback The function to call for each Polygon.
 * @return {function(GeoJSON): void} A function that can be used to visit each Polygon in a GeoJSON object.
 */
export function eachPolygon(callback) {
  const callbacks = {Polygon: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<MultiPoint>} callback The function to call for each MultiPoint.
 * @return {function(GeoJSON): void} A function that can be used to visit each MultiPoint in a GeoJSON object.
 */
export function eachMultiPoint(callback) {
  const callbacks = {MultiPoint: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<MultiLineString>} callback The function to call for each MultiLineString.
 * @return {function(GeoJSON): void} A function that can be used to visit each MultiLineString in a GeoJSON object.
 */
export function eachMultiLineString(callback) {
  const callbacks = {MultiLineString: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<MultiPolygon>} callback The function to call for each MultiPolygon.
 * @return {function(GeoJSON): void} A function that can be used to visit each MultiPolygon in a GeoJSON object.
 */
export function eachMultiPolygon(callback) {
  const callbacks = {MultiPolygon: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<GeometryCollection>} callback The function to call for each GeometryCollection.
 * @return {function(GeoJSON): void} A function that can be used to visit each GeometryCollection in a GeoJSON object.
 */
export function eachGeometryCollection(callback) {
  const callbacks = {GeometryCollection: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<Geometry>} callback The function to call for each geometry.
 * @return {function(GeoJSON): void} A function that can be used to visit each geometry in a GeoJSON object.
 */
export function eachGeometry(callback) {
  const callbacks = {Geometry: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {CoordinateCallback} callback The function to call for each coordinate.
 * @return {function(GeoJSON): void} A function that can be used to visit each coordinate in a GeoJSON object.
 */
export function eachCoordinate(callback) {
  const callbacks = {Coordinate: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callback<Feature>} callback The function to call for each Feature.
 * @return {function(GeoJSON): void} A function that can be used to visit each Feature in a GeoJSON object.
 */
export function eachFeature(callback) {
  const callbacks = {Feature: callback};
  return function (data) {
    visit(data, callbacks);
  };
}

/**
 * @param {Callbacks} callbacks The functions to call while traversing the data.
 * @return {function(GeoJSON): void} A function that can be used to traverse a GeoJSON object.
 */
export function each(callbacks) {
  return function (data) {
    visit(data, callbacks);
  };
}

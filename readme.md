# geofunc

The `geofunc` package provides functions for processing GeoJSON.

For example:

```js
import {eachPoint} from 'geofunc';

let count = 0;
const countPoints = eachPoint((point) => {
  ++count;
});

// this will count all the Point geometries
countPoints(collection);
```

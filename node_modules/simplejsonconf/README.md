# simplejsonconf

> Use JSON as a configuration file

For more information, see `index.js`

```javascript
const m = require('simplejsonconf');

m.getJSON({foo: {bar: 'baz'}}, 'foo.bar') // => 'baz'

m.setJSON({foo: {bar: 'baz'}}, 'foo.bar', 'jazz') // => {foo: {bar: 'jazz'}}

m.setJSON({foo: {bar: 'baz'}}, 'foo.bar', 'true', {
  guess: true // Guess value type
}) // => {foo: {bar: true}}

m.setJSON({foo: {bar: 'baz', something: null}}, 'foo.bar', 'value', {
  prune: true // Remove nulls and prune objects
}) // => {foo: {bar: 'value'}}


// or with a proxy:

m.from({foo: {bar: 'baz'}})
 .setJSON('foo.bar', 'value') // => {foo: {bar: 'value'}}
```

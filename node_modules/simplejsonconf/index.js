/*!
 * Module: simplejsonconf
 *
 * Use JSON as a configuration file
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

'use strict';

/*
 * Check if this is an "Object"
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

/*
 * Merges the two objects together
 */
function mergeDeep(target, source) {
  if ( isObject(target) && isObject(source) ) {
    for ( const key in source ) {
      if ( isObject(source[key]) ) {
        if ( !target[key] || typeof target[key] !== typeof source[key] ) {
          Object.assign(target, {
            [key]: {}
          });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }

  return target;
}

/**
 * Creates a new proxy object with getJSON/setJSON methods for given JSON object.
 *
 * @param {Object}  obj       The JSON object
 *
 * @memberof simplejsonconf
 * @function from
 * @return {Object} A proxy object
 */
module.exports.from = (obj) => {
  return {
    getJSON: (path, defaultValue) => {
      return module.exports.getJSON(obj, path, defaultValue);
    },
    setJSON: (path, value, opts) => {
      return module.exports.setJSON(obj, path, value, opts);
    }
  };
};

/**
 * Resolves the given path in JSON object and returns value
 *
 * @example .getJSON({foo: {bar: 'baz'}}, 'foo.bar') => 'baz'
 *
 * @param {Object}  json          The JSON object
 * @param {String}  [path=null]   The path to seek. If empty, the entire tree is returned
 *
 * @memberof simplejsonconf
 * @function getJSON
 * @return {Mixed} Result for the path
 */
module.exports.getJSON = (json, path, defaultValue) => {
  if ( typeof path === 'string' ) {
    let result = null;
    let ns = json;

    path.split(/\./).forEach((k, i, queue) => {
      if ( i >= queue.length - 1 ) {
        result = ns[k];
      } else {
        ns = ns[k];
      }
    });

    return typeof result === 'undefined' ? defaultValue : result;
  }

  return json;
};


/**
 * Resolves the given path in JSON object and returns value
 *
 * @example .setJSON({foo: {bar: 'baz'}}, 'foo.bar', 'jazz') => {foo: {bar: 'jazz'}}
 *
 * @param {Object}          json                      The JSON object
 * @param {String}          path                      The path to seek. If you set this as 'null' you can define the value as a tree
 * @param {Mixed}           value                     The value to set on the path
 * @param {Object}          [options]                 A set of options
 * @param {Boolean}         [options.prune=false]     Remove 'null' from the tree (this also prunes empty objects)
 * @param {Boolean}         [options.guess=false]     Try to guess what kind of type this value is
 *
 * @memberof simplejsonconf
 * @function setJSON
 * @return {Object} The new JSON object
 */
module.exports.setJSON = (() => {

  function removeNulls(obj) {
    const isArray = obj instanceof Array;

    for ( let k in obj ) {
      if ( obj[k] === null ) {
        if ( isArray ) {
          obj.splice(k, 1);
        } else {
          delete obj[k];
        }
      } else if ( typeof obj[k] === 'object') {
        removeNulls(obj[k]);
      }
    }
  }

  function getNewTree(key, value) {
    const queue = key.split(/\./);

    let resulted = {};
    let ns = resulted;

    queue.forEach((k, i) => {
      if ( i >= queue.length - 1 ) {
        ns[k] = value;
      } else {
        if ( typeof ns[k] === 'undefined' ) {
          ns[k] = {};
        }
        ns = ns[k];
      }
    });

    return resulted;
  }

  function guessValue(value) {
    value = String(value);

    if ( value === 'true' ) {
      return true;
    } else if ( value === 'false' ) {
      return false;
    } else if ( value === 'null' ) {
      return null;
    } else {
      if ( value.match(/^\d+$/) && !value.match(/^0/) ) {
        return parseInt(value, 10);
      } else if ( value.match(/^\d{0,2}(\.\d{0,2}){0,1}$/) ) {
        return parseFloat(value);
      }
    }
    return value;
  }

  return function(json, path, value, opts) {
    const isTree = !path;
    const options = Object.assign({
      prune: false,
      guess: false,
      value: null,
    }, opts || {});

    if ( !isTree && options.guess ) {
      value = guessValue(value);
    }

    let newTree = isTree ? value : getNewTree(path, value);
    let result = mergeDeep(json, newTree);

    if ( options.prune ) {
      removeNulls(result);
    }

    return result;
  };
})();

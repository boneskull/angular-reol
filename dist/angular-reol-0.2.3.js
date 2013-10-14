/*global angular*/
(function () {
    'use strict';

    angular.module('reol', []).factory('reol', ['$parse', function ($parse) {

        /**
         * Reol
         *
         * An array with multiple user-specified indexes. Slower to write, faster to read.
         * Made for the cases where you initialize a huge array of objects and frequently
         * whish to find those with a specific property and value.
         *
         * @param fields (object) List of fields you whish to index
         * @return (Object) this
         */

        var reol = function reol(fields) {
            var ret = [];
            var that = ret;
            fields = fields || {};

            ret.index = {};
            ret.indexes = {};

            // Define indexes
            angular.forEach(fields, function (_, field) {
                that.index[field] = {};
                that.indexes[field] = fields[field];
            });

            return ret;
        };

        var fns = {};

        /* Public methods
         ============================================================================= */

        /**
         * .add()
         *
         * Add an element. Currently only supports a special kind of unique index which
         * will only reject duplicates from the violating index, but keep the element
         * in other indexes and in the list.
         *
         * @param element (Object) Object to be indexed
         * @param [callback] (Function) Optional callback
         * @return (reol) this
         */

        fns.add = function add(element, callback) {
            var that = this, i, l;

            callback = callback || function (e) {
                if (angular.isDefined(e)) {
                    throw e;
                }
            };

            if (!angular.isObject(element) && !angular.isArray(element)) {
                callback(new Error('add() requires an object or array of objects'));
                return this;
            }

            // Removed merge() in favor of this; if "element" is an Array,
            // add everything in it.  If you want to merge two reol objects,
            // do this instead:
            //   reol1.merge(reol2.toArray());
            if (angular.isArray(element)) {
                for (i = 0, l = element.length; i < l; i++) {
                    this.add(element[i]);
                }
                return this;
            }

            // Add to list
            this.push(element);

            // Add to indexes
            angular.forEach(this.indexes, function (_, field) {
                that._addToIndex(field, element);
            });

            callback();

            return this;
        };

        /**
         * .merge()
         *
         * Adds all elements in an Array or another instance of reol.
         *
         * @param elements (reol|Array) Elements to merge
         * @param [callback] (Function) Optional callback
         * @return (Object) this
         */

        fns.merge = function merge(elements, callback) {
            return this.add(elements, callback);
        };


        /**
         * .find()
         *
         * Find all elements matching the conditions.
         * an array with one element.
         *
         * @param conditions (String|Object) One (1!) condition to match. Multiple conditions will
         *  be supported later.
         * @param [callback] (Function) Optional callback
         * @param [one] (Boolean) If true will only return one element
         * @return (Array|Object|undefined) The found elements
         */

        fns.find = function find(conditions, callback, one) {
            var key, condition, result;

            callback = callback || angular.noop;

            if (angular.isString(conditions)) {
                key = conditions;
            }
            else if (angular.isObject(conditions)) {
                // Extract property name
                for (condition in conditions) {
                    if (conditions.hasOwnProperty(condition)) {
                        key = condition;
                        break;
                    }
                }
            } else if (angular.isDefined(conditions)) {
                throw new Error('find() expects a string, an object as the first parameter, or no parameters');
            }

            // Return everything
            if (!key) {
                callback(this.toArray());
                return this.toArray();
            }

            // Find in index
            if (this.index[key]) {
                result = this.findInIndex(key, conditions[key]);
            }
            // Find in list
            else {
                result = this.findInList(key, conditions[key], one);
            }

            if (!angular.isArray(result)) {
                result = [result];
            }

            callback(null, result);
            return result;
        };


        /**
         * .findOne()
         *
         * Find exactly zero or one element. Should be a tiny bit faster than .find().
         *
         * @param conditions (Object) One (1!) condition to match. Multiple conditions will
         *  be supported later.
         * @param [callback] (Function) Optional callback
         * @return (Object|undefined) The element found if found
         */

        fns.findOne = function findOne(conditions, callback) {
            callback = callback || angular.noop;
            return this.find(conditions, function (err, result) {
                callback(err, result[0]);
            }, true)[0];
        };

        /**
         * Clears out the entire list.  Use remove() to call this.
         */
        fns._clear = function _clear(callback) {
            var index = {};
            angular.forEach(this.indexes, function (_, field) {
                index[field] = {};
            });

            this.index = index;
            this.length = 0;

            callback = callback || angular.noop;
            callback();
        };

        /**
         * Grabs the index of the key/value pair in the list.
         * @param key
         * @param value
         * @returns {number} Index, -1 if not found
         */
        fns._findIndexInList = function findInList(key, value) {
            var i, l, list = this;

            for (i = 0, l = list.length; i < l; i++) {
                if (list[i].hasOwnProperty(key) && list[i][key] === value) {
                    return i;
                }
            }

            return -1;
        };

        /**
         * Removes something.  By default remove everything.
         * @param conditions Condition object
         * @param callback Callback
         * @param {boolean} one Whether to only remove one thing
         */
        fns.remove = function remove(conditions, callback, one) {
            var condition, key, that = this;

            callback = callback || angular.noop;
            if (!angular.isObject(conditions) || conditions === null) {
                if (one && this.length > 1) {
                    throw new Error('attempt to remove everything from a length > 1 array while specifying to remove only one item');
                }
                this._clear(callback);
                return;
            }

            function removeFromIndex(_, field) {
                that._removeFromIndex(field, conditions);
            }

            for (condition in conditions) {
                if (conditions.hasOwnProperty(condition)) {
                    key = condition;
                    angular.forEach(this.indexes, removeFromIndex);
                    this.splice(this._findIndexInList(key, conditions[key]), 1);
                }
            }

            callback();
        };

        /**
         * .findInIndex()
         *
         * Find an element in a specified index. Use this without being sure that the
         * index exists and the sky will fall on your head.
         *
         * @param key (string) The name of the index/field to match
         * @param value (string) The value to match
         * @return (Array) Found elements.
         */

        fns.findInIndex = function findInIndex(key, value) {
            return this.index[key][angular.toJson(value)];
        };


        /**
         * .findInList()
         *
         * Just a naive search through all elements until a match is found
         *
         * @param key (string) The name of the index/field to match
         * @param value (string) The value to match
         * @param [one] (string) If true will return on first match
         * @return (Array) Found elements.
         */

        fns.findInList = function findInList(key, value, one) {
            var i, l, result = [], list = this;

            for (i = 0, l = list.length; i < l; i++) {
                if (list[i].hasOwnProperty(key) && list[i][key] === value) {
                    result.push(list[i]);
                    if (one) {
                        break;
                    }
                }
            }

            return result;
        };


        /**
         * .toArray()
         *
         * Returns this.
         *
         * @return (Array) Everything
         */

        fns.toArray = function toArray() {
            return [].slice.call(this);
        };


        /* "Private" helper; exposed for testing
         ============================================================================= */
        fns._addToIndex = function _addToIndex(field, element) {
            var indexedValue;

            if (element[field]) {
                indexedValue = angular.toJson(element[field]);
            }
            else if (field.indexOf('.')) {
                indexedValue = angular.toJson($parse(field)(element));
            }
            if (angular.isUndefined(indexedValue)) {
                return false;
            }
            if (!this.index[field].hasOwnProperty(indexedValue)) {
                this.index[field][indexedValue] = element;
                return true;
            }

            return false;
        };

        fns._removeFromIndex = function _removeFromIndex(field, element) {
            var indexedValue;

            if (element[field]) {
                indexedValue = angular.toJson(element[field]);
            }

            else if (field.indexOf('.')) {
                indexedValue = angular.toJson($parse(field)(element));
            }

            if (angular.isUndefined(indexedValue)) {
                return false;
            }

            if (this.index[field].hasOwnProperty(indexedValue)) {
                delete this.index[field][indexedValue];
                return true;
            }

            return false;
        };

        return function (o) {
            var ret = reol(o);
            return angular.extend(ret, fns);
        };

    }]);

}());

/*global angular*/
(function () {
    'use strict';

    angular.module('reol', []).factory('Reol', ['$parse', function ($parse) {

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

        function Reol(fields) {
            var that = this;

            this.index = {};
            this.indexes = {};

            // Define indexes
            angular.forEach(fields, function (field) {
                that.index[field] = {};
                that.indexes[field] = fields[field];
            });
        }

        Reol.prototype = Array.prototype;

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
         * @return (Reol) this
         */

        Reol.prototype.add = function (element, callback) {
            var err, that = this;
            callback = callback || angular.noop;

            if (!angular.isObject(element)) {
                err = new Error('Sorry, this class only works with objects.');
                if (callback) {
                    callback(err);
                }
                else {
                    throw err;
                }
            }

            // Add to list
            this.push(element);

            // Add to indexes
            angular.forEach(this.indexes, function(field) {
                addToIndexe.call(that, field, element);
            });

            return this;
        };


        /**
         * .merge()
         *
         * Adds all elements in an Array or another instance of Reol.
         *
         * @param elements (Reol|Array) Elements to merge
         * @param [callback] (Function) Optional callback
         * @return (Object) this
         */

        Reol.prototype.merge = function (elements, callback) {
            var i, l;

            for (i = 0, l = elements.length; i < l; i++) {
                this.add(elements[i]);
            }

            if (callback) {
                callback();
            }

            return this;
        };


        /**
         * .find()
         *
         * Find all elements matching the conditions.
         * an array with one element.
         *
         * @param conditions (object) One (1!) condition to match. Multiple conditions will
         *  be supported later.
         * @param [callback] (Function) Optional callback
         * @param [one] (Boolean) If true will only return one element
         * @return (Array|Object|undefined) The found elements
         */

        Reol.prototype.find = function (conditions, callback, one) {
            var key, condition, result;

            callback = callback || angular.noop;

            // Extract property name
            for (condition in conditions) {
                if (conditions.hasOwnProperty(condition)) {
                    key = condition;
                    break;
                }
            }

            // Return eveything
            if (!key) {
                callback(this.toArray());
                return this.toArray();
            }

            // Find in index
            if (this.index[key]) {
                result = this.findInIndex(key, conditions[key]) || [];
            }
            // Find in list
            else {
                result = this.findInList(key, conditions[key], one);
            }

            result = !result && [] || angular.isUndefined(result.length) && result || [result];

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

        Reol.prototype.findOne = function (conditions, callback) {
            return this.find(conditions, function (err, result) {
                if (callback) {
                    callback(err, result[0]);
                }
            }, true)[0];
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

        Reol.prototype.findInIndex = function (key, value) {
            return this.index[key][angular.toJson(value)];
        };


        /**
         * .findInList()
         *
         * Justa naive search through all elements until a match is found
         *
         * @param key (string) The name of the index/field to match
         * @param value (string) The value to match
         * @param [one] (string) If true will return on first match
         * @return (Array) Found elements.
         */

        Reol.prototype.findInList = function (key, value, one) {
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
         * Basically just returns this, but use this anyway in case of API changes
         *
         * @return (Array) Everything
         */

        Reol.prototype.toArray = function () {
            return this;
        };


        /* Private helpers (must be .call()ed)
         ============================================================================= */

        function addToIndexe(field, element) {
            var indexedValue = '';

            if (element[field]) {
                indexedValue = angular.toJson(element[field]);
            }
            else if (field.indexOf('.')) {
                indexedValue = angular.toJson($parse(field)(element));
            }

            /*jshint validthis:true */
            if (!this.index[field].hasOwnProperty(indexedValue)) {
                this.index[field][indexedValue] = element;
                return true;
            }

            return false;
        }

        return function (o) {
            return new Reol(o);
        };

    }]);

})();
/*global describe, module, beforeEach, inject, it, expect, angular, spyOn*/
describe('angular-reol', function () {
    'use strict';

    var reol, r,
        testObj = {
            label1: 'test',
            unIndexedField: 'meow',
            nested: {
                child: 'eek'
            }
        };

    beforeEach(module('reol'));
    beforeEach(inject(function ($injector) {
        reol = $injector.get('reol');

        r = reol({
            label1: true,
            'nested.child': true
        });

    }));

    describe('constructor', function () {
        it('should initialize its properties', function () {
            var r;
            expect(function () {
                r = reol();
            }).not.toThrow();

            expect(r.index).toEqual({});
            expect(r.indexes).toEqual({});

            r = reol({foo: true});
            expect(r.index).toEqual({foo: {}});
            expect(r.indexes).toEqual({foo: true});

        });
    });

    describe('add function', function () {
        it('should throw upon non-object addition', function () {
            expect(function () {
                r.add('foo');
            }).toThrow();
        });
        it('should add to indices', function () {
            r.add(testObj);
            expect(r.index).toEqual({
                label1: {
                    '"test"': testObj
                },
                'nested.child': {
                    '"eek"': testObj
                }
            });
        });
        it('should add multiples', function () {
            var testObj2 = {
                label1: 'test2'
            }, testObj3 = {
                label1: 'test3'
            }, r2;
            r.add([testObj, {label1: 'test2'}]);
            expect(r.index).toEqual({
                label1: {
                    '"test"': testObj,
                    '"test2"': testObj2
                },
                'nested.child': {
                    '"eek"': testObj
                }
            });
            r2 = reol({'label1': true});
            r2.add(testObj3);
            r.add(r2.toArray());
            expect(r.index).toEqual({
                label1: {
                    '"test"': testObj,
                    '"test2"': testObj2,
                    '"test3"': testObj3
                },
                'nested.child': {
                    '"eek"': testObj
                }
            });
        });
    });

    describe('merge function', function () {
        it('should call add()', function () {
            var testObj2 = {
                label1: 'test2'
            };
            spyOn(r, 'add');
            r.merge([testObj2]);
            expect(r.add).toHaveBeenCalled();
            // this is very weird and I think it's a spy/jasmine issue I can't figure out
            expect(r.add).toHaveBeenCalledWith([testObj2], undefined);
        });
    });

    describe('toArray', function() {
        it('should return a real array', function() {
            expect(angular.isArray(r)).toBe(false);
            expect(angular.isArray(r.toArray())).toBe(true);
        });
    });

});
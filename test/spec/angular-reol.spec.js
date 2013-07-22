/*global describe, module, beforeEach, inject, it, expect, angular, spyOn*/
describe('angular-reol', function () {
    'use strict';

    var reol, r,
        testObj;

    beforeEach(module('reol'));
    beforeEach(inject(function ($injector) {
        reol = $injector.get('reol');

        r = reol({
            label1: true,
            'nested.child': true
        });

        testObj = {
            label1: 'test',
            unIndexedField: 'meow',
            nested: {
                child: 'eek'
            }
        };

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

    describe('array behavior', function () {
        it('should iterate like an array', function () {
            var i;
            r.add(testObj);
            i = r.length;
            while (i--) {
                expect(r[i]).toBeDefined();
            }
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

    describe('findOne function', function () {
        it('should find something', function () {
            expect(r.findOne({label1: 'test'}));
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

    describe('toArray', function () {
        it('should return a real array', function () {
            expect(angular.isArray(r)).toBe(false);
            expect(angular.isArray(r.toArray())).toBe(true);
        });
    });

    describe('_clear', function () {
        it('should decimate the list', function () {
            r.add(testObj);
            r.add(testObj);
            r._clear();
            expect(r.index).toEqual({});
            expect(r.toArray()).toEqual([]);
        });
    });

    describe('remove', function () {
        it('should call clear', function () {
            r.add(testObj);
            r.add(testObj);
            expect(function () {
                r.remove(null, null, true);
            }).toThrow();
            spyOn(r, '_clear');
            r.remove();
            expect(r._clear).toHaveBeenCalled();
        });
        it('should remove a thing', function () {
            r.add(testObj);
            r.remove(testObj);
            expect(r.index).toEqual({ 'nested.child': {}, label1: {} });
            expect(r.toArray()).toEqual([]);
        });
    });

});
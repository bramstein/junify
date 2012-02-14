var junify = require('../lib/unification'),
    vows = require('vows'),
    assert = require('assert'),
    $ = junify.variable,
    _ = junify._,
    u = junify.unify;

vows.describe('Junify').addBatch({
    'unify': {
        topic: function () {
            return u;
        },
        'array': function (u) {
            assert.ok(u([], []));
            assert.ok(u([1],[1]));
            assert.isFalse(u([1],[2]));
            assert.isFalse(u([], [1, 2, 3]));
            assert.isFalse(u([1], [1, 2, 3]));
            assert.ok(u([1, [3, 4], 5], [1, [3, 4], 5]));
        },
        'object': function (u) {
            assert.ok(u({}, {}));
            assert.ok(u({hello: 'world'}, {hello: 'world'}));
            assert.ok(u({hello: 'world', key: 'value'}, {key: 'value', hello: 'world'}));
            assert.isFalse(u({hello: 'world', key: 'value'}, {hello: 'world'}));
            assert.isFalse(u({hello: 'world'}, {hello: 'world', key: 'value'}));
        },
        'function': function(u) {
            var f = function() {},
                g = function() {};

            assert.ok(u(f, f));
            assert.ok(!u(f, g));
        },
        'variable': function (u) {
            assert.equal(u($('a'), 1).a, 1);
            assert.equal(u(1, $('a')).a, 1);
            assert.equal(u({hello: $('a')}, {hello: 'world'}).a, 'world');

            assert.isFalse(u([$('a'), $('a')], [1, 2]));
            assert.isFalse(u($('a'), $('a')));
            assert.isFalse(u([$('a'), 2], [1, $('a')]));
            assert.equal(u([[$('a')],$('b')], [[1],2]).a, 1);
            assert.equal(u($('n'), function () { return 10; }()).n, 10);
        },
        'type': function (u) {
            assert.ok(u($('d', Date), new Date()));
            assert.ok(u($('d', String), 'hello'));
            assert.ok(u($('d', Function), function() {}));
            assert.ok(u(String, _));
        },
        'wildcard': function (u) {
            assert.ok(u(_, _));
            assert.ok(u(_, 1));
            assert.ok(u(1, _));
        },
        'wildcard array': function (u) {
            assert.ok(u(_, [1, 2]));
            assert.ok(u([1, 2], _));
        },
        'wildcard variable': function (u) {
            assert.isUndefined(u($('a'), _).a);
            assert.isUndefined(u(_, $('a')).a);
        },
        'wildcard object': function (u) {
            assert.ok(u({_ : _}, {_ : _}));
            assert.isFalse(u({_ : _}, {}));
            assert.isFalse(u({}, {_ : _}));

            assert.ok(u(_, {hello: 'world'}));
            assert.ok(u({hello: 'world'}, _));
            assert.ok(u({hello: 'world', _: _}, {key: 'value', _ : _ }));
            assert.ok(u({hello: 'world', _: _}, {key: 'value', hello: 'world'}));
            assert.ok(u({hello: 'world', key: _}, {key: 'value', hello: 'world'}));
        }
    }
}).export(module);

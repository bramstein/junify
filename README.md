# JUnify ― JavaScript Unification Library

JUnify is a JavaScript library for performing [unification](http://en.wikipedia.org/wiki/Unification) on objects and arrays. It works on both the browser and Node.js. Unification is an algorithm to determine the substitutions needed to make two expressions match. If the expressions contain variables, these will need to be bound to values in order for the match to succeed. If two expressions are not identical or the variables can not be bound, the match fails. In the following example unification is used to extract values from a [JSON](http://www.json.org/) object using an pattern object:

    var point = {
        coords: [12, 10, 80], 
        color:  [255, 0, 0]
    };
    
    var pattern = {
        coords: [variable('x'), variable('y'), _], 
        color:  variable('color')
    };
    
    // a.x = 12, a.y = 10, a.color = [255, 0, 0]
    var a = unify(pattern, point);

The syntax and use-case in this example is similar to [destructuring assignment in JavaScript 1.7](http://developer.mozilla.org/en/docs/New_in_JavaScript_1.7#Destructuring_assignment). Its use is however not limited to extracting fields. Unification can, for example, also be used to implement pattern matching or an expert system (Artificial Intelligence, Structures and Strategies for Complex Problem Solving, by George F. Luger. Addison Wesley, ISBN: 0-201-64866-0, page 68.) The following articles give some examples of the features that could be implemented using the JUnify library.

* [Extracting values from JavaScript objects](../../articles/extracting-object-values.html) 
* [Pattern matching in JavaScript](../../articles/pattern-matching.html) 
* [Advanced pattern matching in JavaScript](../../articles/advanced-pattern-matching.html) 

## Installation

Use npm to install `junify`:

    > npm install junify

You can then `require('junify')` and get access to the API explained below.

## API

All code in the library is contained in the `junify` package. To keep the examples in this section simple, the package name is left out, but it should be present in any real code. The package exposes three public methods and one constant. The two most important methods are `unify` and `variable`.

<dl>
    <dt>unify(pattern1, pattern2)</dt>
    <dd>Unifies pattern1 with pattern2. Returns `false` if the unification fails, otherwise it returns an object containing the variable bindings necessary for the unification.</dd>
    
    <dt>variable(name, type)</dt>
    <dd>Creates a new named variable with an optionally specified type. The returned variable can be used in the patterns when calling `unify`.</dd>
</dl>

Both the unify and variable methods were demonstrated in the introduction. Note however that the unification works both ways, that is, both patterns can contain variables:

    var a = { text: 'Hello', name: variable('name') };
    var b = { text: variable('text'), name: 'World!' };
    
    var c = unify(a, b); // c.text = 'Hello', c.name = 'World!'

Variable names can however occur only once per pattern; they must be unique.

JUnify can only perform unification on objects and arrays, not on atoms. The following types are considered atoms: `Boolean`, `Number`, `String`, `Function`, `NaN`, `Infinity`, `undefined` and `null`. Variables can also be typed, so they only match if the types are identical in both patterns.

    var a = new Date();
    var b = new Boolean(true);
    var c = unify(variable('date', Date), a);  // c.date = Mon Jun 23 2008 (…)
    var d = unify(variable('date', Date), b);  // d = false

The introduction also demonstrated the use of the wildcard constant `_`, which can be used to match an item (atom, array, or object) but does not create a binding.

<dl>
    <dt>_</dt>
    <dd>Wildcard variable which matches any atom, array or object, but does not create any binding.</dd>
</dl>

The wildcard constant can also be used instead of an object property name, effectively matching any other object against it (but again, not creating a binding.) It is important that the wildcard symbol is *not* renamed (i.e. assigned another variable name,) as the library uses it internally to identify wildcard object property names. An example of both uses:

    var a = { text: 'Hello', name: 'World!' };
    var b = { text: _, name: variable('name') };
    var c = { text: _, var: _ };
    var d = { text: _, _:_ };
    
    var r = unify(a, a);   // r = {}
    var r = unify(a, b);   // r.name = 'World!'
    var r = unify(a, c);   // r = false (no match)
    var r = unify(a, d);   // r = {} (d can be matched against any object with 
                           //         two properties, one of them being "text")

The last method is `visit_pattern`, which is used to traverse a pattern using a visitor object with callbacks. This can be used to rewrite custom pattern syntax before passing it to the `unify` method.

<dl>
    <dt>visit_pattern(pattern, visitor)</dt>
    <dd>Traverse the pattern using thevisitor. The visitor should be an object containing callback functions for variables, wildcards, functions, objects and atoms. None of these are required; if a callback function is not available the item under inspection is returned unmodified. All callback functions should return a value if implemented, which is then inserted at its original position in the pattern. The following callback functions are available:

    <dl>
        <dt>variable(value)</dt>
        <dd>Called when the pattern visitor encounters a variable. The variable is supplied as a parameter.</dd>
        <dt>wildcard()</dt>
        <dd>Called when the pattern visitor encounters a wildcard variable.</dd>
        <dt>func(value)</dt>
        <dd>Called when the pattern visitor encounters a function. The function is supplied as a parameter.</dd>
        <dt>object(name, value)</dt>
        <dd>Called when the pattern visitor encounters an object. The property name and value are supplied as parameters. The value parameter is visited *after* calling the object callback. The callback function should only return the value. It can not modify the key.</dd>
        
        <dt>atom(value)</dt>
        <dd>Called when the pattern visitor encounters an atom. The atom is supplied as a parameter.</dd>
    </dl></dd>
</dl>

An example of using the `visit_pattern` method can be found in [the article on extracting values from JavaScript objects](../../articles/extracting-object-values.html), where it is used to implement a simplified syntax for extracting object properties.

## Example

In this example we set up some variable names for convenience (you can also use the fully qualified names without any problems―I would actually recommend it.) Remember that the wildcard constant `_` must be an underscore. The methods can be renamed freely. We also create a function to display the results. If the unification succeeds this function will display all the variables and their bindings, or if the unification fails, display an error message.

    var _ = unification._;
    var $ = unification.variable;
    var unify = unification.unify;
    
    function display(value) {
        var name;
    
        if (value) {
            for (name in value) {
                if (value.hasOwnProperty(name)) {
                    alert(name + " = " + value[name]);
                }
            }
        }
        else {
            alert("no match!");
        }
    }

It is then possible to use the library to either unify two patterns or extract values from objects.

    
    var a = [1, $('k'), 5, 7, 11];
    var b = [1, 3, $('i'), 7, $('j')];
    
    display(unify(a, b)); // i = 5, j = 11, k = 3
    
    var json = {
        article: {
            title: 'Pattern Matching in JavaScript',
            date: new Date(), 
            author: 'Bram Stein'
        }, 
        refid: '12480E'
    };
    
    var pattern = { 
        article: { 
            title: $('title'), 
            date: $('date', Date), 
            author: $('author') 
        },
        _ : _ 
    };
    
    display(unify(pattern, json)); // title  = 'Pattern Matching in JavaScript',
                                   // date   = 'Mon Jun 23 2008 (…)', 
                                   // author = 'Bram Stein'

In the first example we unify two arrays, both containing variables. The returned object contains binding for all variables, from both arrays. The second example extracts the title, date and author properties from an article object if the date property has a type of `Date`. It returns an object with those properties if the match is succesfull.

# Angular Keyboard

Keyboard behavior for AngularJS Webapps.

(But the directives also respond to touch & mouse events)

## Goals

 * Bring desktop-class keyboard navigation to webapps.
 * Add behavior without adding styling or new scopes.
 * No additional plugins required. (jQuery is optional)

## Demos

* [kbList modes demo](http://bfanger.github.io/angular-keyboard/Examples/modes.html)
* [Scroll and orientation demo](http://bfanger.github.io/angular-keyboard/Examples/orientation.html)
* [kbFocus demo](http://bfanger.github.io/angular-keyboard/Examples/focus.html)

## Installation

Download or install via bower:
`bower install angular-keyboard`

Include the `dist/keyboard.min.js` script and add 'keyboard' as dependancy.

```js
angular.module('myApp', ['keyboard']);
```

## Directives

### kbList

A kb-item in a kb-list can selected using the arrow keys and by clicking on the kb-item.

#### Example

```html
    <div kb-list ng-model="selectedItem" ng-repeat="item in items">
        <div kb-item="item">{{item.title}}</div>
    </div>
```

Example styling

```css
[kb-item] {
    cursor: pointer;
}
[kb-item].kb-selected {
    background: lightblue;
}
```

### kbSelect

A kb-item in a kb-select can activated using the arrow keys but is selected (and deselected) by pressing 'space' or 'enter' keys or clicking an the kb-item.

#### Example

```html
    <div kb-select ng-model="selectedItem" ng-repeat="item in items">
        <div kb-item="item">{{item.title}}</div>
    </div>
```

### kbFocus

Setting or reading the focus via a service.

```html
    <input type="email" kb-focus="label">
```

```js
app.controller('MyCtrl', function($scope, $kbFocus) {
    $scope.someAction = function() {
        kbFocus('label');
    };
});
```

### kbAutofocus
Set the autofocus attribute based on an expression.

```html
    <input type="password" kb-autofocus="email != ''">
```

## Development

* Install [node.js](http://nodejs.org/)
* Install global dev dependencies: `npm install -g bower gulp`
* Install local dev dependencies: `npm install && bower install` in repository directory
* `gulp build` to build
* `gulp watch` for building & livereload on every change.

## Contributing

When issuing a pull request, please exclude changes from the "dist" folder to avoid merge conflicts.
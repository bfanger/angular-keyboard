# Angular Keyboard

Keyboard behavior for AngularJS Webapps.

(But the directives also respond to touch & mouse events)

## Goals

 * Bring desktop-class keyboard navigation to webapps.
 * Add behavior without adding styling or new scopes.
 * No additional plugins required. (jQuery is optional)

## Demos

* [kbList & kbSelect demo](http://angular-keyboard.herokuapp.com/example-modes.html)
* [Scroll and orientation demo](http://angular-keyboard.herokuapp.com/example-orientation.html)
* [kbFocus demo](http://angular-keyboard.herokuapp.com/example-focus.html)
* [kbInvoke demo](http://angular-keyboard.herokuapp.com/example-menu.html)

## Installation

### bower

```shell
bower install angular-keyboard --save
```

Then add a `<script>` to your `index.html`:

```html
<script src="/bower_components/angular-keyboard/angular-keyboard.min.js"></script>
```

And add the 'keyboard' module as dependency.

```js
angular.module('myApp', ['keyboard']);
```

## Directives

### kbList

A `kb-item` in a `kb-list` can selected using the arrow keys and by clicking on the `kb-item`.

#### Example

```html
<div kb-list ng-model="vm.selected">
  <div ng-repeat="item in items" kb-item="item">{{item.title}}</div>
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

A `kb-item` in a `kb-select` can activated using the arrow keys but is selected (and deselected) by pressing 'space' or 'enter' keys or clicking an the `kb-item`.

#### Example

```html
<div kb-select ng-model="vm.selected">
  <div ng-repeat="item in items" kb-item="item">{{item.title}}</div>
</div>
```

### kbFocus

Setting or reading the focus via a service.

```html
<input type="email" kb-focus="label">
```

```js
app.controller('MyCtrl', function($scope, kbFocus) {
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

### kbInvoke

An event handler for `kb-item`. Triggered when clicked or (when focused) with space and enter keys.

```html
<ul kb-list>
  <li ng-repeat="item in items" kb-item kb-invoke="openPopup(item.href)">{{item.title}}</li>
</ul>
```

## Development

* Install [node.js](http://nodejs.org/)
* Install gulp: `npm install -g bower gulp`
* Install dependencies: `npm install` in the repository directory.
* `gulp build` to build
* `gulp watch` for building & livereload on every change.

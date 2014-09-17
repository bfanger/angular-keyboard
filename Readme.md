# ngKeyboard

Keyboard behavior for AngularJS WebApps.

## Goals

 * Bring desktop-class keyboard navigation to webapps.
 * Add behavior without adding styling or new scopes.
 * No additional plugins required. (jQuery is optional)

## Demos

* [kbList modes demo](http://bfanger.github.io/ng-keyboard/Examples/modes.html)
* [Scroll and orientation demo](http://bfanger.github.io/ng-keyboard/Examples/orientation.html)

## Installation

Download or install via bower:
`bower install ng-keyboard`

Add 'keyboard' as dependancy.

```js
angular.module('myApp', ['keyboard']);
```

## Directives

### kbList

Adds tab to focus and arrow-key navigation to a list.
(Also scrolls to the active item into view and click-to-select)

#### Example

    <div kb-list ng-model="selectedItem" ng-repeat="item in items">
        <div kb-item="item">{{item.title}}</div>
    </div>

Example styling

```css
[kb-list]:focus {
    outline: none;
}
.kb-focus {
    outline: 2px dotted blue; /* set to the kb-item element */
}
[kb-item]:hover {
    cursor: pointer;
}
[kb-item].kb-selected {
    background: lightblue;
}


```


#### Attributes

**kb-list**:
Allowed values: 'list' (default), 'select' and 'multiselect'

* In **'list'** mode the kb-item can selected using the arrow keys and by clicking on the item.
* In **'select'** mode the kb-item can activated using the arrow keys but is selected (and deselected) by pressing 'space' or 'enter'.
  A click on a selected item will deselect the item.
* The **'muliselect'** mode is similar to select, but allows multiple items to be selected.
  The ng-model becomes an array with the models of the selected items.

**ng-model**: The ng-model binds the selection to the scope.

#### What kb-list does...

Add [tabindex](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.tabIndex) to the kb-list element. This make the container able get focus via tab or click.

When clicked on a kb-item the 'kb-focus', 'kb-active' and 'kb-selected' classes are added to the kb-item element.

Listens to the arrow-keys for changing the active item and [space] & [enter] to toggle the selection.
When the active item is changed when in focus, the kb-element is scrolled into the visible viewport.
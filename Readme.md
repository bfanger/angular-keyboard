# ListView for AngularJS

Adds selection, focus, scrolling and keyboard navigation to a list.

ng-listview adds behaviour and doesn't contain any styling.

## Basic usage

    <div lv-list lv-selected="activeItem" ng-repeat="item in items">
        <div lv-item="item">{{item.title}}</div>
    </div>

### Behavior
A tabindex attribute is added to the lv-list div, this make the container able get focus via tab and click.
When focussed, the orientation

When clicked on a lv-item the 'lv-active' and 'lv-selected' classes are added to the lv-item div.

the activeItem is changed to that item, 


## lv-list attributes

### lv-list
Allowed values: 'list', 'select' and 'multiselect'

* In **'list'** mode (default) the lv-item can selected using the arrow keys and by clicking on the item.
* In **'select'** mode the lv-item can activated using the arrow keys but is selected by pressing 'space' or 'enter'.
  A click on a selected item deselect the item.
* The **'muliselect'** mode is similar to select, but allows multiple items to be selected.
  The ng-model becomes an array with the models of the selected items.

### ng-model
The ng-model binds the selection to the scope using NgModelController, which allows for additional validation.


lv-orientation
'detect' (default) Determine the orientation based on style on the lv-list en lv-item
'vertical'
'horizontal'
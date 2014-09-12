# ListView for AngularJS

Adds selection, focus, scrolling and keyboard navigation to a list.

ng-listview adds behaviour and doesn't contain any styling.

## Basic usage

    <div lv-list lv-selected="activeItem" ng-repeat="item in items">
        <div lv-item="item">{{item.title}}</div>
    </div>

### Behavior
When clicked on a lv-item the activeItem is changed to that item, 
Allow the lv-list to be focusable with tab using (tabindex).
To disable the this causes some browsers to add styling to the container.

    [lv-list]:focus { outline: none; }

## lv-list options
lv-selected: [required] Two-way binding for the selected model.

lv-mode:
list (default)
select
multiple

/**
 * kb-list directive
 *
 * Usage:
 * <div kb-list ng-model="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbList', function (KbListController) {
    'use strict';

    return {
        controller: KbListController,
        require: ['kbList', 'ngModel'],
        link: function ($scope, el, attrs, controllers) {
            var kbList = controllers[0];
            var ngModel = controllers[1];
            var hasFocus = false;

            kbList.mode = attrs.kbList || 'list';

            ngModel.$render = function () {
                if (kbList.mode === 'multiselect') {
                    var value = ngModel.$viewValue;
                    if (angular.isArray(value) === false) {
                        value = [];
                    }
                    kbList.selected = value;
                    for (var i in value) {
                        kbList.active = value[i];
                        break;
                    }
                } else {
                    kbList.selected = kbList.active = ngModel.$viewValue;
                }
            };
            if (angular.isUndefined(el.attr('tabindex'))) {
                el.attr('tabindex', 0);
            }
            el.on('click', function () {
                if (document.activeElement !== this) { // not(:focus) ?
                    // In Internet Explorer a click doesn't focus containers. ><
                    el.focus();
                }
            });
            el.on('focus', function (e) {
                kbList._isFocusEvent = true;
                if (angular.isUndefined(kbList.active)) {
                    kbList.active = kbList.first().model;
                }
                kbList.focus = kbList.active;
                hasFocus = true;
                $scope.$apply();
                kbList._isFocusEvent = false;
            });
            el.on('blur', function () {
                kbList.focus = null;
                hasFocus = false;
                $scope.$apply();
            });
            /**
             * Check if an ClientRect is in given direction.
             * Allows for keyboard navigation based on an elements relative visual location.
             *
             * @param {string} direction 'up', 'left', 'right' or 'down',
             * @param {ClientRect} currentRect The position of the current item.
             */
            function checkLocation(direction, currentRect, targetRect) {
                if (direction === 'left' && targetRect.left < currentRect.left) {
                    return true;
                }
                if (direction === 'up' && targetRect.top < currentRect.top) {
                    return true;
                }
                if (direction === 'right' && targetRect.left > currentRect.left) {
                    return true;
                }
                if (direction === 'down' && targetRect.top > currentRect.top) {
                    return true;
                }
                return false;
            }
            // { e.which: direction }
            var directions = {
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            };
            el.on('keydown', function (e) {
                if (angular.isUndefined(kbList.active)) {
                    return; // all keyboard action require an active listview-item
                }
                var changed = false;
                if (e.which >= 37 && e.which <= 40) { // An arrow-key?
                    var location = kbList._locate(kbList.active);
                    var currentRect = location.element[0].getBoundingClientRect();
                    if (location.previous && checkLocation(directions[e.which], currentRect, location.previous.element[0].getBoundingClientRect())) {
                        kbList.active = location.previous.model;
                        changed = true;
                    }
                    if (location.next && checkLocation(directions[e.which], currentRect, location.next.element[0].getBoundingClientRect())) {
                        kbList.active = location.next.model;
                        changed = true;
                    }
                } else if (kbList.mode !== 'list' && (e.which === 32 || e.which === 13)) { // Space || Enter
                    kbList.toggle(kbList.active);
                    changed = true;
                }
                if (changed) {
                    e.preventDefault();
                    $scope.$apply();
                }
            });
            $scope.$watch(function () {
                return kbList.selected;
            }, function (value) {
                ngModel.$setViewValue(value);
            });
            $scope.$watch(function () {
                return kbList.active;
            }, function (value) {
                if (kbList.mode === 'list') {
                    kbList.selected = value;
                }
                if (hasFocus) {
                    kbList.focus = value;
                }
            });
        }
    };
});
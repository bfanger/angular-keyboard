/**
 * kb-item
 */
angular.module('keyboard').directive('kbItem', function (KbItemController, $animate, kbScrollTo, $timeout) {
    'use strict';
    var timer = null;
    var cancelAnimation = angular.noop;
    function scrollTo(el, _isFocusEvent) {
        // Wrapped in a timeout, prevents issues with focus & click events and scrolls to the last activated kb-item.
        $timeout.cancel(timer);
        if (_isFocusEvent) {
            timer = $timeout(function () {
                cancelAnimation();
                cancelAnimation = kbScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, false);
            }, 100, false);
        } else {
            cancelAnimation();
            cancelAnimation = kbScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, true);
        }
    }
    return {
        controller: KbItemController,
        require: ['^kbList', 'kbItem'],
        link: function ($scope, el, attrs, controllers) {
            var kbList = controllers[0];
            var kbItem = controllers[1];
            if (angular.isUndefined(kbList.active)) {
                kbList.active = kbItem;
            }

            el.on('click', function () {
                kbItem.active = kbItem;
                if (kbList.mode === 'list') {
                    kbList.select(kbItem.getModel());
                } else {
                    kbList.toggle(kbItem.getModel());
                }
                $scope.$apply();
            });
            var selectedClass = attrs.kbSelectedClass || 'kb-selected';
            $scope.$watch(function () {
                return kbList.isSelected(kbItem.getModel());
            }, function (isSelected) {
                if (isSelected) {
                    $animate.addClass(el, selectedClass);
                } else {
                    $animate.removeClass(el, selectedClass);
                }
            });
            var activeClass = attrs.kbActiveClass || 'kb-active';
            $scope.$watch(function () {
                return kbList.active === kbItem;
            }, function (isActive) {
                if (isActive) {
                    el.attr('tabindex', 0);
                    $animate.addClass(el, activeClass);
                } else {
                    $animate.removeClass(el, activeClass);
                    if (el.is('a') || el.is('button')) {
                        el.attr('tabindex', 0);        
                    } else {
                        el.removeAttr('tabindex');
                    }
                }
            });
            // var focusClass = attrs.kbFocusClass || 'kb-focus';
            // $scope.$watch(function () {
            //     return kbList.focus === kbItem.getModel();
            // }, function (hasFocus) {
            //     if (hasFocus) {
            //         $animate.addClass(el, focusClass);
            //         scrollTo(el, kbList._isFocusEvent);
            //     } else {
            //         $animate.removeClass(el, focusClass);
            //     }
            // });

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
                var changed = false;
                if (e.which >= 37 && e.which <= 40) { // An arrow-key?
                    var siblings = kbList._getSiblingItems(kbItem);
                    console.log(siblings);
                    var currentRect = el[0].getBoundingClientRect();
                    if (siblings.previous && checkLocation(directions[e.which], currentRect, siblings.previous.element[0].getBoundingClientRect())) {
                        kbList.active = siblings.previous;
                        changed = true;
                    }
                    if (siblings.next && checkLocation(directions[e.which], currentRect, siblings.next.element[0].getBoundingClientRect())) {
                        kbList.active = siblings.next;
                        changed = true;
                    }
                } else if (kbList.mode !== 'list' && (e.which === 32 || e.which === 13)) { // Space || Enter
                    kbList.toggle(kbItem.getModel());
                    changed = true;
                }
                if (changed) {
                    kbList.active.focus();
                    e.preventDefault();
                    $scope.$apply();
                }
            });
        }
    };
});

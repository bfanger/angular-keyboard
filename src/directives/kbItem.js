/**
 * kb-item
 */
angular.module('keyboard').directive('kbItem', function ($animate, $parse, kbScrollTo, $timeout) {
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
        controller: function ($scope, $element) {
            this.getModel = (function () {
                var getter = $parse($element.attr('kb-item'));
                return function () {
                    return getter($scope);
                };
            }());
        },
        require: ['^kbList', 'kbItem'],
        link: function ($scope, el, attrs, controllers) {
            var kbList = controllers[0];
            var kbItem = controllers[1];

            el.on('click', function () {
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
                return kbList.active === kbItem.getModel();
            }, function (isActive) {
                if (isActive) {
                    $animate.addClass(el, activeClass);
                } else {
                    $animate.removeClass(el, activeClass);
                }
            });
            var focusClass = attrs.kbFocusClass || 'kb-focus';
            $scope.$watch(function () {
                return kbList.focus === kbItem.getModel();
            }, function (hasFocus) {
                if (hasFocus) {
                    $animate.addClass(el, focusClass);
                    scrollTo(el, kbList._isFocusEvent);
                } else {
                    $animate.removeClass(el, focusClass);
                }
            });
        }
    };
});

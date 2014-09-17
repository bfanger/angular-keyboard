/**
 * ng-keyboard
 *
 * Keyboard behavior for AngularJS WebApps
 *
 *
 * Inspired by: Apple Mail
 * Implementation inspirated by: WinJS ListView http://try.buildwinjs.com/pages/listview/options/default.html
 */
angular.module('keyboard', []);
angular.module('keyboard').constant('undefined');
angular.module('keyboard').factory('KbListController', function (undefined) {
    'use strict';
    /**
     * @class KbListController
     * @param {jQElement} $element
     */
    function KbListController($element) {
        this.mode = 'list';

        this.selected = undefined; // Selected model(s)
        this.active = undefined; // Model of the current list-item.
        this.focus = undefined; // Model of the current list-item and the listview is focussed.

        this._element = $element[0];
        this._isFocusEvent = false; // Used to determine a the scroll delay, to prevent swallowed clicks
    }
    angular.extend(KbListController.prototype, {
        /** @lends kbListController */

        /**
         * Select the given model.
         * Or in multiselect mode, add the given model to the selection.
         *
         * @param {*} model
         */
        select: function (model) {
            this.active = model;
            if (this.mode === 'multiselect') {
                if (this.isSelected(model) === false) {
                    this.selected.push(model);
                }
            } else {
                this.selected = model;
            }
        },
        /**
         * Deselect the given model.
         * Or in multiselect mode, removes the given model to the selection.
         * Does nothing if the given model isn't selected.
         *
         * @param {*} model
         */
        deselect: function (model) {
            this.active = model;
            if (this.mode === 'multiselect') {
                var index = this.selected.indexOf(model);
                if (index !== -1) {
                    this.selected.splice(index, 1);
                }
            } else if (model === this.selected) {
                this.selected = undefined;
            }
        },
        /**
         * Select or deselect the given model.
         * Or in multiselect mode, adds or removes the given model to the selection.
         *
         * @param {*} model
         */
        toggle: function (model) {
            if (this.isSelected(model)) {
                this.deselect(model);
            } else {
                this.select(model);
            }
        },
        /**
         * Check if the given model is selected.
         *
         * @param {*} model
         * @returns {Boolean}
         */
        isSelected: function (model) {
            if (this.mode === 'multiselect') {
                return this.selected.indexOf(model) !== -1;
            } else {
                return this.selected === model;
            }
        },
        /**
         * Activate the previous listview-item.
         *
         * @returns {Boolean}
         */
        previous: function () {
            var prev = this._locate(this.active).previous;
            if (prev) {
                this.active = prev.model;
                return true;
            }
            return false;
        },
        /**
         * Activate the next listview-item.
         *
         * @returns {Boolean}
         */
        next: function () {
            var next = this._locate(this.active).next;
            if (next) {
                this.active = next.model;
                return true;
            }
            return false;
        },
        /**
         * Returns the element, controller and models from the current, prevous and next listview-item.
         *
         * @param {*} model
         * @returns {Object}
         */
        _locate: function (model) {
            var items = this._element.querySelectorAll('[kb-item]');
            for (var i = 0; i < items.length; i++) {
                var el = angular.element(items.item(i));
                var controller = el.controller('kbItem');
                if (controller.getModel() === model) {
                    var location = {
                        model: model,
                        controller: controller,
                        element: el
                    };
                    if (i !== 0) {
                        var prev = {
                            element: angular.element(items.item(i - 1))
                        };
                        prev.controller = prev.element.controller('kbItem');
                        prev.model = prev.controller.getModel();
                        location.previous = prev;
                    }
                    if (i < items.length - 1) {
                        var next = {
                            element: angular.element(items.item(i + 1))
                        };
                        next.controller = next.element.controller('kbItem');
                        next.model = next.controller.getModel();
                        location.next = next;
                    }
                    return location;
                }
            }
            return {};
        },
        /**
         * Returns the element, controller and model of the first listview-item.
         * @returns {Object}
         */
        first: function () {
            var first = {};
            var el = this._element.querySelector('[kb-item]');
            if (el) {
                first.element = angular.element(el);
                first.controller = first.element.controller('kbItem');
                first.model = first.controller.getModel();
            }
            return first;
        }
    });
    return KbListController;
});
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

            kbList.mode = attrs.kbList;

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
/**
 *
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
/**
 * Helper for scrolling the active (and focussed) kb-item into a viewable area.
 *
 * @param {type} param1
 * @param {type} param2
 */
angular.module('keyboard').factory('kbScrollTo', function ($log, $window) {
    var noop = angular.noop;

    var duration = 150;
    // Firefox scrollTop
    var viewportNode = 'BODY';
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        viewportNode = 'HTML';
    }

    /**
     * Change the scrollposition animated and return a function that cancels the animation
     *
     * @param {Element} container
     * @param {String} property 'scrollTop' or 'scrollLeft'
     * @param {Number} value
     * @param {Boolean} animated
     * @returns {Function}
     */
    function change(container, property, value, animated) {
        if (animated && angular.element.prototype.animate) { // jQuery.animate is available?
            var el = angular.element(container);
            var props = {};
            props[property] = value;
            el.animate(props, duration);
            return function () {
                el.stop(true, true);
            };
        } else {
            container[property] = value;
            return noop;
        }
    }

    /**
     *
     * @param {Element} el
     * @param {Object} offset  Allowed hidden
     * @param {Boolean} animated
     * @returns {Function} cancel animation
     */
    function kbScrollTo(el, offset, animated) {
        var cancelAnimation = noop;
        var parent = el.parentElement;
        while (parent.nodeName !== viewportNode) {
            var parentStyle = getComputedStyle(parent);
            var overflowStyle = parentStyle.overflow + parentStyle.overflowX + parentStyle.overflowY;
            if (overflowStyle.match(/scroll|hidden/)) {
                break;
            }
            parent = parent.parentElement;
        }
        var elRect = el.getBoundingClientRect();
        var pos = {
            top: Math.ceil(elRect.top),
            right: Math.ceil(elRect.right),
            bottom: Math.ceil(elRect.bottom),
            left: Math.ceil(elRect.left)
        };
        // @todo Add outline-width to pos
        if (parent.nodeName === viewportNode) {
            var parentPos = {
                top: 0,
                right: $window.innerWidth,
                bottom: $window.innerHeight,
                left: 0
            };
        } else {
            var parentRect = parent.getBoundingClientRect();
            var parentPos = {
                top: Math.ceil(parentRect.top),
                right: Math.ceil(parentRect.right),
                bottom: Math.ceil(parentRect.bottom),
                left: Math.ceil(parentRect.left)
            };
        }
//        console.info(el.nodeName, pos, 'in', parent.nodeName, parentPos, 'offset', offset);

        var relTop = pos.top - parentPos.top;
        var relRight = parentPos.right - pos.right;
        var relBottom = parentPos.bottom - pos.bottom;
        var relLeft = pos.left - parentPos.left;

        if (relTop + offset.top < 0) { // up
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop + relTop + offset.top, animated);
            relBottom += relTop;
            relTop = 0;
        } else if (relBottom + offset.bottom < 0) { // down
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop - relBottom + offset.bottom, animated);
            relTop += relBottom;
            relBottom = 0;
        }
        if (relLeft + offset.left < 0) { // left
            cancelAnimation = change(parent, 'scrollLeft', parent.scrollLeft + relLeft + offset.left, animated);
            relRight += relLeft;
            relLeft = 0;
        } else if (relRight + offset.right < 0) { // right
            cancelAnimation = change(parent, 'scrollLeft', parent.scrollLeft - relRight + offset.right, animated);
            relLeft += relRight;
            relRight = 0;
        }
        if (parent.nodeName === viewportNode) {
            return cancelAnimation;
        }
        var cancelParentAnimation = kbScrollTo(parent, {top: relTop, right: relTop, bottom: relBottom, left: relLeft}, animated);
        return function () {
            cancelAnimation();
            cancelParentAnimation();
        };
    }
    return kbScrollTo;
});
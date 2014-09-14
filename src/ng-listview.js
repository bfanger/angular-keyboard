/**
 * ng-listview
 *
 * A ListView for AngularJS
 *
 *
 * Inspired by: Apple Mail
 * Implementation inspirated by: WinJS ListView http://try.buildwinjs.com/pages/listview/options/default.html
 */
angular.module('listview', []);
angular.module('listview').constant('undefined');
/**
 * lv-list directive
 *
 * Usage:
 * <div lv-list ng-model="selection"> ... <div lv-item="aItem">...</div> ... </div>
 */
angular.module('listview').directive('lvList', function (undefined) {
    'use strict';

    // Inject style
    document.querySelector('style').innerHTML += '\n[lv-list]:focus { outline: none; } [lv-item]:hover { cursor: pointer; }';

    /**
     * @class LvListController
     * @param {jQElement} $element
     */
    function LvListController($element) {
        this._element = $element[0];
        this.mode = 'list';
        this.orientation = 'vertical';

        this.selected = undefined; // Selected model(s)
        this.active = undefined; // Model of the current list-item.
        this.focus = undefined; // Model of the current list-item and the listview is focussed.
        this.isFocusEvent = false; // Used to determine a the scroll delay, to prevent swallowed clicks
    }
    angular.extend(LvListController.prototype, {
        /** @lends LvListController */

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
            var items = this._element.querySelectorAll('[lv-item]');
            for (var i = 0; i < items.length; i++) {
                var el = angular.element(items.item(i));
                var controller = el.controller('lvItem');
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
                        prev.controller = prev.element.controller('lvItem');
                        prev.model = prev.controller.getModel();
                        location.previous = prev;
                    }
                    if (i < items.length - 1) {
                        var next = {
                            element: angular.element(items.item(i + 1))
                        };
                        next.controller = next.element.controller('lvItem');
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
            var el = this._element.querySelector('[lv-item]');
            if (el) {
                first.element = angular.element(el);
                first.controller = first.element.controller('lvItem');
                first.model = first.controller.getModel();
            }
            return first;
        }
    });

    return {
        controller: LvListController,
        require: ['lvList', 'ngModel'],
        link: function ($scope, el, attrs, controllers) {
            var lvList = controllers[0];
            var ngModel = controllers[1];
            var hasFocus = false;

            lvList.orientation = attrs.lvOrientation || 'detect';
            lvList.mode = attrs.lvList;

            ngModel.$render = function () {
                if (lvList.mode === 'multiselect') {
                    var value = ngModel.$viewValue;
                    if (angular.isArray(value) === false) {
                        value = [];
                    }
                    lvList.selected = value;
                    for (var i in value) {
                        lvList.active = value[i];
                        break;
                    }
                } else {
                    lvList.selected = lvList.active = ngModel.$viewValue;
                }
            };
            if (angular.isUndefined(el.attr('tabindex'))) {
                el.attr('tabindex', 0);
            }
            el.on('focus', function (e) {
                lvList.isFocusEvent = true;
                if (angular.isUndefined(lvList.active)) {
                    lvList.active = lvList.first().model;
                }
                lvList.focus = lvList.active;
                hasFocus = true;
                if (lvList.orientation === 'detect') {
                    var itemEl = lvList.first().element;
                    if (itemEl) {
                        lvList.orientation = 'vertical';
                        if (itemEl.css('float') === 'left' || itemEl.css('display') === 'inline-block') {
                            lvList.orientation = 'horizontal';
                        }
                    }
                }
                $scope.$apply();
                lvList.isFocusEvent = false;
            });
            el.on('blur', function () {
                lvList.focus = null;
                hasFocus = false;
                $scope.$apply();
            });
            el.on('keydown', function (e) {
                if (angular.isUndefined(lvList.active)) {
                    return; // all keyboard action require an active listview-item
                }
                var prevKey = lvList.orientation === 'horizontal' ? 37 : 38; // Left : Up
                var nextKey = lvList.orientation === 'horizontal' ? 39 : 40; // Right : Down
                var changed = false;

                if (e.which === prevKey) {
                    changed = lvList.previous();
                } else if (e.which === nextKey) {
                    changed = lvList.next();
                } else if (lvList.mode !== 'list' && (e.which === 32 || e.which === 13)) { // Space || Enter
                    lvList.toggle(lvList.active);
                    changed = true;
                }
                if (changed) {
                    e.preventDefault();
                    $scope.$apply();
                }
            });
            $scope.$watch(function () {
                return lvList.selected;
            }, function (value) {
                ngModel.$setViewValue(value);
            });
            $scope.$watch(function () {
                return lvList.active;
            }, function (value) {
                if (lvList.mode === 'list') {
                    lvList.selected = value;
                }
                if (hasFocus) {
                    lvList.focus = value;
                }
            });
        }
    };
});
/**
 *
 */
angular.module('listview').directive('lvItem', function ($animate, $parse, lvScrollTo, $timeout) {
    'use strict';
    var timer = null;
    var cancelAnimation = angular.noop;
    function scrollTo(el, isFocusEvent) {
        // Wrapped in a timeout, prevents issues with focus & click events and scrolls to the last activated lv-item.
        $timeout.cancel(timer);
        if (isFocusEvent) {
            timer = $timeout(function () {
                cancelAnimation();
                cancelAnimation = lvScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, false);
            }, 100, false);
        } else {
            cancelAnimation();
            cancelAnimation = lvScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, true);
        }
    }
    return {
        controller: function ($scope, $element) {
            this.getModel = (function () {
                var getter = $parse($element.attr('lv-item'));
                return function () {
                    return getter($scope);
                };
            }());
        },
        require: ['^lvList', 'lvItem'],
        link: function ($scope, el, attrs, controllers) {
            var lvList = controllers[0];
            var lvItem = controllers[1];

            el.on('click', function () {
                if (lvList.mode === 'list') {
                    lvList.select(lvItem.getModel());
                } else {
                    lvList.toggle(lvItem.getModel());
                }
                $scope.$apply();
            });
            var selectedClass = attrs.lvSelectedClass || 'lv-selected';
            $scope.$watch(function () {
                return lvList.isSelected(lvItem.getModel());
            }, function (isSelected) {
                if (isSelected) {
                    $animate.addClass(el, selectedClass);
                } else {
                    $animate.removeClass(el, selectedClass);
                }
            });
            var activeClass = attrs.lvActiveClass || 'lv-active';
            $scope.$watch(function () {
                return lvList.active === lvItem.getModel();
            }, function (isActive) {
                if (isActive) {
                    $animate.addClass(el, activeClass);
                } else {
                    $animate.removeClass(el, activeClass);
                }
            });
            var focusClass = attrs.lvFocusClass || 'lv-focus';
            $scope.$watch(function () {
                return lvList.focus === lvItem.getModel();
            }, function (hasFocus) {
                if (hasFocus) {
                    $animate.addClass(el, focusClass);
                    scrollTo(el, lvList.isFocusEvent);
                } else {
                    $animate.removeClass(el, focusClass);
                }
            });
        }
    };
});
/**
 * Helper for scrolling the active (and focussed) lv-item into a viewable area.
 *
 * @param {type} param1
 * @param {type} param2
 */
angular.module('listview').factory('lvScrollTo', function ($log, $window) {
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
    function lvScrollTo(el, offset, animated) {
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
            top: Math.ceil(elRect.top), // @todo Add outline-top-width
            bottom: Math.ceil(elRect.bottom)
        };
        if (parent.nodeName === viewportNode) {
            var parentPos = {
                top: 0,
                bottom: $window.innerHeight
            };
        } else {
            var parentRect = parent.getBoundingClientRect();
            var parentPos = {
                top: Math.ceil(parentRect.top),
                bottom: Math.ceil(parentRect.bottom)
            };
        }
//        console.info(el.nodeName, pos, 'in', parent.nodeName, parentPos, 'offset', offset);

        var relTop = pos.top - parentPos.top;

        var relBottom = parentPos.bottom - pos.bottom;
        if (relTop + offset.top < 0) { // up
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop + relTop + offset.top, animated);
            relBottom += relTop;
            relTop = 0;
        } else if (relBottom + offset.bottom < 0) { // down
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop - relBottom + offset.bottom, animated);
            relTop += relBottom;
            relBottom = 0;
        }
        if (parent.nodeName === viewportNode) {
            return cancelAnimation;
        }
        var cancelParentAnimation = lvScrollTo(parent, {top: relTop, bottom: relBottom}, animated);
        return function () {
            cancelAnimation();
            cancelParentAnimation();
        };
    }
    return lvScrollTo;
});
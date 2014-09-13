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
angular.module('listview').directive('lvList', function (undefined, lvScroll) {
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
        this.scrollAnimated = true; // Always scroll animated, except on the focus event, because the browser already scrolled.
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
                lvList.scrollAnimated = false;
                $scope.$apply();
                lvList.scrollAnimated = true;
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
angular.module('listview').directive('lvItem', function ($animate, $parse, lvScroll) {
    'use strict';
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
                    lvScroll(el, {top: 0, right: 0, bottom: 0, left: 0}, lvList.scrollAnimated);
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
angular.module('listview').factory('lvScroll', function ($log, $window, $timeout) {
    var noop = angular.noop;

    if (!angular.element.prototype.height) {
        $log.warn('[ng-listview] Support for scrolling requires jQuery');
        return noop;
    }
    var duration = 150;
    /**
     *
     * @param {jQElement} el
     * @param {Object} offset  Allow offsets
     * @param {Boolean} animated
     * @returns {Function} cancel animation
     */
    function _lvScroll(el, offset, animated) {
        var pos = el.position();
        pos.height = el.outerHeight();
        pos.bottom =  pos.top + pos.height;
        var parent = el.offsetParent();
        var parentPos = {
            height: parent.outerHeight()
        };
//        console.log(el[0].nodeName, pos, parent[0].nodeName, parentPos);

        // down?
        offset.bottom += parentPos.height - pos.bottom;
        if (pos.bottom > parentPos.height) {
            console.log('inner scroll down', 'todo');
        }
        // up?
        if  (pos.top < 0) {
            console.log('inner scroll up', 'todo');
        }
        offset.top += pos.top;

        if (parent.is('html')) {
            if ($window.scrollY > offset.top) {
                if (animated) {
                    angular.element('html, body').animate({scrollTop: offset.top}, duration);
                    return function () {
                        angular.element('html, body').stop(true, true);
                    };
                }
                $window.scrollTo($window.scrollY, offset.top);
            } else {
                var windowBottom = parentPos.height - $window.innerHeight - $window.scrollY;
                if (offset.bottom < windowBottom) {
                    if (animated) {
                        angular.element('html, body').animate({scrollTop: $window.scrollY + windowBottom - offset.bottom}, duration);
                        return function () {
                            angular.element('html, body').stop(true, true);
                        };
                    }
                    $window.scrollTo($window.scrollY, $window.scrollY + windowBottom - offset.bottom);
                }
            }
            return noop;
        }
        return _lvScroll(parent, offset, animated);
    }

    var timer = null;
    var cancelAnimation = noop;
    function lvScroll(el, offset, animated) {
        // Wrapped in a timeout, prevents issues with focus & click events and scrolls to the last activated lv-item.
        $timeout.cancel(timer);
        cancelAnimation();
        cancelAnimation = noop;
        timer = $timeout(function () {
            cancelAnimation = _lvScroll(el, offset, animated);
        }, 10, false);
    }

    return lvScroll;
});
/**
 * angular-keyboard
 *
 * Keyboard behavior for AngularJS Webapps
 *
 *
 * Inspired by: Apple Mail
 * Implementation inspirated by: WinJS ListView http://try.buildwinjs.com/pages/listview/options/default.html
 */
angular.module('keyboard', []);
/**
 * Register 'undefined' with the `undefined` value.
 */
angular.module('keyboard').constant('undefined');

angular.module('keyboard').factory('KbContainerController', ["undefined", "$parse", function (undefined, $parse) {
    'use strict';
    /**
     * @class KbListController
     * @ngInject @param {jQElement} $element
     */
    function KbContainerController($element) {

        this.selected = []; // Selected kbItem(s)
        this.multiple = false;

        this.active = undefined; // kbItemController of the active kb-item.
        this._element = $element[0];
        this.itemAvailable = false; // New item(s) available in the DOM?

    }
    KbContainerController.$inject = ["$element"];
    angular.extend(KbContainerController.prototype, {
        /** @lends kbListController */

        activate: function (kbItem) {
            this.active = kbItem;
            kbItem.focus();
        },

        invoke: function () {
            return false;
        },

        /**
         * Select the given model.
         * Or in multiselect mode, add the given model to the selection.
         *
         * @param {*} model
         */
        select: function (model) {
            if (this.multiple) {
                if (this.isSelected(model) === false) {
                    this.selected.push(model);
                    this.setModel(this.selected);
                }
            } else {
                this.selected[0] = model;
                this.setModel(model);
            }

        },
        /**
         * Deselect the given model.
         * Does nothing if the given model isn't selected.
         *
         * @param {*} model
         */
        deselect: function (model) {
            var index = this.selected.indexOf(model);
            if (index !== -1) {
                this.selected.splice(index, 1);
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
            return (this.selected.indexOf(model) !== -1);
        },
        /**
         * Activate the previous item.
         *
         * @returns {Boolean}
         */
        previous: function () {
            var prev = this._getSiblingItems(this.active).previous;
            if (prev) {
                this.active = prev;
                return true;
            }
            return false;
        },
        /**
         * Activate the next item.
         *
         * @returns {Boolean}
         */
        next: function () {
            var next = this._getSiblingItems(this.active).next;
            if (next) {
                this.active = next;
                return true;
            }
            return false;
        },
        /**
         * Returns the (first) kbItemController  which has the given model value.
         * @returns {KbItemController}
         */
        _locate: function (model) {
            var items = this._element.querySelectorAll('[kb-item]');
            for (var i = 0; i < items.length; i++) {
                var kbItem = angular.element(items.item(i)).controller('kbItem');
                if (kbItem.getModel() === model) {
                    return kbItem;
                }
            }
        },
        /**
         * Returns the element, controller and models from the current, prevous and next item.
         *
         * @param {KbItemController} kbItem
         * @returns {Object} with up to 2 KbItemControllers: previous and next.
         */
        _getSiblingItems: function (kbItem) {
            var element = kbItem.element[0];
            var items = this._element.querySelectorAll('[kb-item]');
            for (var i = 0; i < items.length; i++) {
                var el = items.item(i);
                if (el === element) {
                    var siblings = {};
                    if (i !== 0) {
                        siblings.previous = angular.element(items.item(i - 1)).controller('kbItem');
                    }
                    if (i < items.length - 1) {
                        siblings.next = angular.element(items.item(i + 1)).controller('kbItem');
                    }
                    return siblings;
                }
            }
            return {};
        },
        /**
         * Returns the controller of the first item.
         * @returns {kbItemController}
         */
        first: function () {
            var el = this._element.querySelector('[kb-item]');
            if (el) {
                return el.controller('kbItem');
            }
        },

        bind: function ($scope, expression) {
            var parsed = $parse(expression);
            this.getModel = function (value) {
                return parsed($scope, value);
            };
            this.setModel = function (value) {
                return parsed.assign($scope, value);
            };
            if (this.multiple) {
                this.selected = this.getModel() || [];
            } else {
                this.selected[0] = this.getModel();
            }
        }
    });
    return KbContainerController;
}]);
angular.module('keyboard').factory('KbItemController', ["kbFocus", function (kbFocus) {
    'use strict';

    /**
     * @class KbItemController
     * @param {jQElement} $element
     * @ngInject
     */
    function KbItemController($element) {
    	this.element = $element;
    }
    KbItemController.$inject = ["$element"];

    angular.extend(KbItemController.prototype, {
    	focus: function () {
    		this.element.attr('tabindex', 0);
            kbFocus(this.element);
    	}
    });
    return KbItemController;

}]);

/**
 * kb-item
 */
angular.module('keyboard').directive('kbItem', ["KbItemController", "$animate", "$log", function (KbItemController, $animate, $log) {
    'use strict';
    return {
        controller: KbItemController,
        require: ['kbItem', '?^kbList', '?^kbSelect'],
        link: function ($scope, el, attrs, controllers) {
            var kbItem = controllers[0];
            var kbContainer = controllers[1];
            for (var i = 1; i < controllers.length; i++) {
                if (controllers[i]) {
                    kbContainer = controllers[i];
                }
            }
            if (!kbContainer) {
                $log.error("Controller 'kbList' or 'kbSelect', required by directive 'kbItem', can't be found!");
                return;
            }

            var selectedClass = attrs.kbSelectedClass || 'kb-selected';
            var activeClass = attrs.kbActiveClass || 'kb-active';

            // Bind the model
            kbItem.model = $scope.$eval(attrs.kbItem);
            $scope.$watch(attrs.kbItem, function (model) {
                kbItem.model = model;
            });

            if (angular.isUndefined(kbContainer.active)) {
                kbContainer.active = kbItem;
            } else if (kbContainer.isSelected(kbItem.model) && kbContainer.isSelected(kbItem.active) === false) {
                kbContainer.active = kbItem;
            }
            $scope.$watch(function () {
                return kbContainer.isSelected(kbItem.model);
            }, function (isSelected) {
                if (isSelected) {
                    $animate.addClass(el, selectedClass);
                } else {
                    $animate.removeClass(el, selectedClass);
                }
            });
            $scope.$watch(function () {
                return kbContainer.active === kbItem;
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

            /**
             * Calculates the distance to the ClientRect in a given direction.
             * Allows for keyboard navigation based on the relative visual location of the element.
             *
             * @param {string} direction 'up', 'left', 'right' or 'down',
             * @param {ClientRect} currentRect The position of the current item.
             * @return {Number}
             */
            function distance(direction, currentRect, targetRect) {
                if (direction === 'left' && targetRect.left < currentRect.left) {
                    return currentRect.left - targetRect.left;
                }
                if (direction === 'up' && targetRect.top < currentRect.top) {
                    return currentRect.top - targetRect.top;
                }
                if (direction === 'right' && targetRect.left > currentRect.left) {
                    return targetRect.left - currentRect.left;
                }
                if (direction === 'down' && targetRect.top > currentRect.top) {
                    return targetRect.top - currentRect.top;
                }
                return 0;
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
                    var siblings = kbContainer._getSiblingItems(kbItem);
                    var currentRect = el[0].getBoundingClientRect();
                    if (siblings.previous && distance(directions[e.which], currentRect, siblings.previous.element[0].getBoundingClientRect())) {
                        kbContainer.activate(siblings.previous);
                        changed = true;
                    }
                    if (siblings.next && distance(directions[e.which], currentRect, siblings.next.element[0].getBoundingClientRect())) {
                        kbContainer.activate(siblings.next);
                        changed = true;
                    }
                } else if (e.which === 32 || e.which === 13) { // Space || Enter
                    changed = kbContainer.invoke(kbItem);
                }
                if (changed) {
                    e.preventDefault();
                    $scope.$apply();
                }
            });
            el.on('click', function () {
                kbContainer.activate(kbItem);
                kbContainer.invoke(kbItem);
                $scope.$apply();
            });
            $scope.$on('$destroy', function () {
               kbContainer.active = kbContainer.first();
            });
        }
    };
}]);

/**
 * kb-list directive
 *
 * Usage:
 * <div kb-list ng-model="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbList', ["KbContainerController", "$parse", function (KbContainerController, $parse) {
    'use strict';

    return {
        controller: KbContainerController,
        require: 'kbList',
        link: function ($scope, el, attrs, kbContainer) {
            kbContainer.activate = function (kbItem) {
                this.select(kbItem.model);
                return KbContainerController.prototype.activate.apply(this, arguments);
            };
            kbContainer.bind($scope, attrs.kbList);
//            var getModal =ter = $parse(attrs.attrs);

//            ngModel.$render = function () {
//                if (kbContainer.mode === 'multiselect') {
//                    kbContainer.selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [];
//                    for (var i in kbContainer.selected) {
//                        var kbItem = kbContainer._locate(kbContainer.selected[i]);
//                        if (kbItem) {
//                            kbContainer.active = kbItem;
//                            break;
//                        }
//                    }
//                } else {
//                    kbContainer.selected[0] = ngModel.$viewValue;
//                    var kbItem = kbContainer._locate(kbContainer.selected[0]);
//                    if (kbItem) {
//                        kbContainer.active = kbItem;
//                    }
//                }
//            };
            $scope.$watch(function () {
                return kbContainer.selected;
            }, function (selected) {
                if (kbContainer.mode === 'multiselect') {
//                    ngModel.$setViewValue(selected);
                } else {
//                    ngModel.$setViewValue(selected[0]);
                }
            });
        }
    };
}]);
/**
 * kb-select directive
 *
 * Usage:
 * <div kb-select="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbSelect', ["KbContainerController", function (KbContainerController) {
    'use strict';

    return {
        controller: KbContainerController,
        require: 'kbSelect',
        link: function ($scope, el, attrs, kbContainer) {

            kbContainer.invoke = function (kbItem) {
                this.toggle(kbItem.model);
                return true;
            };

            kbContainer.bind($scope, attrs.kbSelect);

;

//            ngModel.$render = function () {
//                if (kbContainer.mode === 'multiselect') {
//                    kbContainer.selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [];
//                    for (var i in kbContainer.selected) {
//                        var kbItem = kbContainer._locate(kbContainer.selected[i]);
//                        if (kbItem) {
//                            kbContainer.active = kbItem;
//                            break;
//                        }
//                    }
//                } else {
//                    kbContainer.selected[0] = ngModel.$viewValue;
//                    var kbItem = kbContainer._locate(kbContainer.selected[0]);
//                    if (kbItem) {
//                        kbContainer.active = kbItem;
//                    }
//                }
//            };
            $scope.$watch(function () {
                return kbContainer.selected;
            }, function (selected) {
                if (kbContainer.mode === 'multiselect') {
//                    ngModel.$setViewValue(selected);
                } else {
//                    ngModel.$setViewValue(selected[0]);
                }
            });
        }
    };
}]);
/**
 * Focus an element, but
 */
angular.module('keyboard').factory('kbFocus', ["kbScrollTo", function (kbScrollTo) {
//    var duration = 150;
//    var cancelAnimation = angular.noop;
//    function scrollTo(el, _isFocusEvent) {
//        // Wrapped in a timeout, prevents issues with focus & click events and scrolls to the last activated kb-item.
//        $timeout.cancel(timer);
//        if (_isFocusEvent) {
//            timer = $timeout(function () {
//                cancelAnimation();
//                cancelAnimation = kbScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, 0);
//            }, 100, false);
//        } else {
//            cancelAnimation();
//            cancelAnimation = kbScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, 150);
//        }
//    }
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
        var timer = null;

// if (angular.isUndefined(el.attr('tabindex'))) {
            //     el.attr('tabindex', 0);
            // }
            // el.on('click', function () {
            //     if (document.activeElement !== this) { // not(:focus) ?
            //         // In Internet Explorer a click doesn't focus containers. ><
            //         el.focus();
            //     }
            // });
            // el.on('focus', function (e) {
            //     kbList._isFocusEvent = true;
            //     if (angular.isUndefined(kbList.active)) {
            //         kbList.active = kbList.first().model;
            //     }
            //     kbList.focus = kbList.active;
            //     hasFocus = true;
            //     $scope.$apply();
            //     kbList._isFocusEvent = false;
            // });
            // el.on('blur', function () {
            //     kbList.focus = null;
            //     hasFocus = false;
            //     $scope.$apply();
            // });

//    var cancel = angular.noop;
    /**
     *
     * @param {Element} el
     */
    return function(el) {
//        console.log(el);
//        cancel();
//        cancel = kbScrollTo(el)

        el.focus();

    };
}]);
/**
 * Helper for scrolling an element into the viewable area.
 */
angular.module('keyboard').factory('kbScrollTo', ["$window", function ($window) {

    var duration = 150;
    // Most browsers scroll via scrollTop on the <body> element.
    var viewportNode = 'BODY';
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        viewportNode = 'HTML'; // Except Firefox, which uses scrollTop on <html> element.
    }

    /**
     * Change the scrollposition animated and return a function that cancels the animation.
     *
     * @param {Element} container
     * @param {String} property 'scrollTop' or 'scrollLeft'
     * @param {Number} value
     * @param {Number} duration
     * @returns {Function}
     */
    function change(container, property, value, duration) {
        if (duration && angular.element.prototype.animate) { // jQuery.animate is available?
            var el = angular.element(container);
            var props = {};
            props[property] = value;
            el.animate(props, duration);
            return function () {
                el.stop(true, true);
            };
        } else {
            container[property] = value;
            return angular.noop;
        }
    }

    /**
     *
     * @param {Element} el  The DOMElement
     * @param {Object} offset  Allowed hidden
     * @param {Number} duration  Duration of the animation in ms
     * @returns {Function} cancel animation
     */
    function kbScrollTo(el, offset, duration) {
        var cancelAnimation = angular.noop;
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
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop + relTop + offset.top, duration);
            relBottom += relTop;
            relTop = 0;
        } else if (relBottom + offset.bottom < 0) { // down
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop - relBottom + offset.bottom, duration);
            relTop += relBottom;
            relBottom = 0;
        }
        if (relLeft + offset.left < 0) { // left
            cancelAnimation = change(parent, 'scrollLeft', parent.scrollLeft + relLeft + offset.left, duration);
            relRight += relLeft;
            relLeft = 0;
        } else if (relRight + offset.right < 0) { // right
            cancelAnimation = change(parent, 'scrollLeft', parent.scrollLeft - relRight + offset.right, duration);
            relLeft += relRight;
            relRight = 0;
        }
        if (parent.nodeName === viewportNode) {
            return cancelAnimation;
        }
        var cancelParentAnimation = kbScrollTo(parent, {top: relTop, right: relTop, bottom: relBottom, left: relLeft}, duration);
        return function () {
            cancelAnimation();
            cancelParentAnimation();
        };
    }
    return kbScrollTo;
}]);

//# sourceMappingURL=keyboard.js.map
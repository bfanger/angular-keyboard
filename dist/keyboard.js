/**
 * angular-keyboard
 *
 * Keyboard behavior for AngularJS Webapps
 *
 *
 * Inspired by: Apple Mail
 * Implementation inspirated by: WinJS ListView http://try.buildwinjs.com/pages/listview/options/default.html
 */
angular.module('keyboard.focus', []);
angular.module('keyboard', ['keyboard.focus']);

/**
 * Register 'undefined' with the `undefined` value.
 */
angular.module('keyboard').constant('undefined');

angular.module('keyboard').factory('KbContainerController', ["undefined", "$log", function (undefined, $log) {
    'use strict';
    /**
     * @class KbListController
     * @ngInject @param {jQElement} $element
     */
    function KbContainerController($element) {
        this.identifier = '[kb-container]';
        this.ngModel = undefined;
        this.selected = []; // Selected kbItem(s)
        this.multiple = false;
        this.cyclic = false;
        this.active = undefined; // kbItemController of the active kb-item.
        this._element = $element[0];
    }
    KbContainerController.$inject = ["$element"];
    angular.extend(KbContainerController.prototype, {
        /** @lends kbListController */

        /**
         *
         * @param {Object} options
         */
        initialize: function (options) {
            this.multiple = angular.isDefined(options.attrs.multiple);
            this.cyclic = angular.isDefined(options.attrs.kbCyclic);
            angular.extend(this, options);
            this.ngModel.$render = function () {
                // Change the selection to model.
                if (this.multiple) {
                    this.selected = this.ngModel.$viewValue;
                    if (angular.isArray(this.selected) === false) {
                        if (angular.isDefined(this.selected)) {
                            $log.error(this.identifier, 'ng-model(multiple) must be an array, got:', this.selected);
                        }
                        this.selected = [];
                    }
                } else {
                    this.selected[0] = this.ngModel.$viewValue;
                }
                // Activate the first item in the selection.
                for (var i in this.selected) {
                    var kbItem = this._locate(this.selected[i]);
                    if (kbItem) {
                        this.active = kbItem;
                        break;
                    }
                }
            }.bind(this);
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
                    this.ngModel.$setViewValue(this.selected);
                }
            } else {
                this.selected[0] = model;
                this.ngModel.$setViewValue(model);
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
         * Abstract method for when an item is clicked, moved to with the keys.
         * @param {KbItemController} kbItem
         * @param {Object} options
         * @returns {Boolean}
         */
        activate: function (kbItem, options) {
            $log.$error(this.identifier, 'activate() is not implemented');
            return false;
        },

        /**
         * Abstract method when an item is clicked or when space or enter is pressed.
         * @param {KbItemController} kbItem  The active item.
         * @returns {Boolean}
         */
        invoke: function (kbItem) {
            $log.$error(this.identifier, 'invoke() is not implemented');
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
                if (kbItem.model === model) {
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
         * Returns the first item.
         * @returns {kbItemController}
         */
        _first: function () {
            var el = this._element.querySelector('[kb-item]');
            if (el) {
                return angular.element(el).controller('kbItem');
            }
        },
        /**
         * Returns the first item.
         * @returns {kbItemController}
         */
        _last: function () {
            var nodes = this._element.querySelectorAll('[kb-item]');
            if (nodes.length) {
                return angular.element(nodes[nodes.length - 1]).controller('kbItem');
            }
        }
    });
    return KbContainerController;
}]);
angular.module('keyboard').factory('KbItemController', ["kbScroll", "undefined", function (kbScroll, undefined) {
    'use strict';

    /**
     * @class KbItemController
     * @ngInject
     * @param {jQElement} $element
     */
    return function KbItemController($element) {
        this.model = undefined;
    	this.element = $element;
    };

}]);

/**
 * Set the autofocus based on an expression.
 *
 * Similar to ng-disabled: https://docs.angularjs.org/api/ng/directive/ngDisabled
 *
 * Usage:
 * <input type="email" kb-autofocus="email == ''" />
 */
angular.module('keyboard.focus').directive('kbFocus', ["kbFocus", "$log", function (kbFocus, $log) {
    'use strict';
    return function ($scope, el, attrs) {
        $scope.$watch(attrs.kbAutofocus, function (value) {
            el.prop('autofocus', !!value);
        });
    };
}]);
/**
 * Control focus based on label with the kbFocus service.
 *
 * Inspired by ng-focus-on
 * @link https://github.com/goodeggs/ng-focus-on

 * Usage:
 * <input type="text" kb-focus="label" />
 */
angular.module('keyboard.focus').directive('kbFocus', ["kbFocus", "$log", function (kbFocus, $log) {
    'use strict';
    return function ($scope, el, attrs) {
        $scope.$watch(kbFocus.get, function (label) {
            if (label === attrs.kbFocus) {
                if (label === '') {
                    $log.error('[kb-focus] Invalid label in', el[0]);
                } else {
                    el[0].focus();
                }
            }
        });
        el.on('focus', function () {
            kbFocus(attrs.kbFocus);
            if (!$scope.$root.$$phase) {
                $scope.$apply();
            }
        });
        el.on('blur', function () {
            if (kbFocus.get() === attrs.kbFocus) {
                kbFocus.reset();
                if (!$scope.$root.$$phase) {
                    $scope.$apply();
                }
            }
        });
    };
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

            if (typeof kbContainer.active === 'undefined') {
                kbContainer.active = kbItem;
            } else if (kbContainer.isSelected(kbItem.model) && kbContainer.isSelected(kbContainer.active.model) === false) {
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
                    if (changed === false && (!siblings.next || !siblings.previous)) {
                        // Detect if we reached the end/begin.
                        var key = e.which;
                        var trigger = false;
                        if (e.which <= 38) {
                            key += 2;
                        } else {
                            key -= 2;
                        }
                        // Check distance in the oppositie direction
                        if (siblings.next && distance(directions[key], currentRect, siblings.next.element[0].getBoundingClientRect())) {
                            if (kbContainer.cyclic) {
                                kbContainer.activate(kbContainer._last());
                                changed = true;
                            } else {
                                trigger = 'kbReachedBegin';
                            }
                        }
                        if (siblings.previous && distance(directions[key], currentRect, siblings.previous.element[0].getBoundingClientRect())) {
                            if (kbContainer.cyclic) {
                                kbContainer.activate(kbContainer._first());
                                changed = true;
                            } else {
                                trigger = 'kbReachedEnd';
                            }
                        }
                        if (trigger && kbContainer.attrs[trigger]) { // Trigger kb-reached-end and kb-reached-begin events
                            angular.element(kbContainer._element).scope().$eval(kbContainer.attrs[trigger], { $event: e});
                        }
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
               kbContainer.active = kbContainer._first();
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
angular.module('keyboard').directive('kbList', ["KbContainerController", "kbScroll", function (KbContainerController, kbScroll) {
    'use strict';

    return {
        controller: KbContainerController,
        require: ['kbList', 'ngModel'],
        link: function ($scope, el, attrs, controllers) {
            var kbContainer = controllers[0];
            kbContainer.initialize({
                identifier: '[kb-list]',
                ngModel: controllers[1],
                attrs: attrs,
                activate: function (kbItem) {
                    this.active = kbItem;
                    this.select(kbItem.model);
                    kbScroll.focus(kbItem.element[0]);
                },
                invoke: function () {
                    return false;
                }
            });
        }
    };
}]);
/**
 * kb-select directive
 *
 * Usage:
 * <div kb-select ng-model="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbSelect', ["KbContainerController", "kbScroll", function (KbContainerController, kbScroll) {
    'use strict';

    return {
        controller: KbContainerController,
        require: ['kbSelect', 'ngModel'],
        link: function ($scope, el, attrs, controllers) {
            var kbContainer = controllers[0];

            kbContainer.initialize({
                identifier: '[kb-select]',
                ngModel: controllers[1],
                attrs: attrs,
                activate: function (kbItem) {
                    this.active = kbItem;
                    kbScroll.focus(kbItem.element[0]);
                },
                invoke: function (kbItem) {
                    this.toggle(kbItem.model);
                    return true;
                }
            });
        }
    };
}]);
/**
 * Service for setting the focus on elements with the kb-focus directive.
 *
 * Inspired by ng-focus-on
 * @link https://github.com/goodeggs/ng-focus-on
 *
 * Usage:
 * kbFocus('email'); // set focus
 * kbFocus(); // get current focus
 */
angular.module('keyboard.focus').factory('kbFocus', ["$log", function ($log) {
    var _label = ''; // Current focussed label

    /**
     * Getter and setter for the focus.
     *
     * @param {String} label
     * @returns {String}
     */
    var kbFocus = function (label) {
        if (arguments.length === 0) {
            return _label;
        }
        kbFocus.set(label);
    };
    kbFocus.get = function () {
        return _label;
    };
    kbFocus.set = function (label) {
        if (typeof label === 'string') {
            _label = label;
        } else {
            $log.error('[kbFocus] label must be a string, got', label);
        }
    };
    kbFocus.reset = function () {
        _label = '';
    };
    return kbFocus;
}]);


/**
 * Helper for scrolling an element into the viewable area.
 *
 * Usage:
 * kbScroll.to(el, offset, duration)
 */
angular.module('keyboard').service('kbScroll', ["$window", function ($window) {

    // Most browsers scroll via scrollTop on the <body> element.
    var viewportNode = 'BODY';
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        viewportNode = 'HTML'; // Except Firefox, which uses scrollTop on <html> element.
    }

    var kbScroll = this;

    /**
     * Change the scrollposition animated and return a function that cancels the animation.
     *
     * @param {Element} container
     * @param {String} property 'scrollTop' or 'scrollLeft'
     * @param {Number} value
     * @param {Number} duration
     * @returns {Function}
     */
    this.change = function (container, property, value, duration) {
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
    };

    /**
     * Get the scrollcontainer of the given element
     * @param {Element} el
     * @returns {Element}
     */
    this.getScrollParent = function (el) {
        var parent = el.parentElement;
        while (parent.nodeName !== viewportNode) {
            var parentStyle = getComputedStyle(parent);
            var overflowStyle = parentStyle.overflow + parentStyle.overflowX + parentStyle.overflowY;
            if (overflowStyle.match(/scroll|hidden/)) {
                break;
            }
            parent = parent.parentElement;
        }
        return parent;
    };

    /**
     *
     * @param {Element} el  The DOMElement
     * @param {Object} offset  Allowed hidden
     * @param {Number} duration  Duration of the animation in ms
     * @returns {Function} cancel animation
     */
    this.to = function (el, offset, duration) {
        var cancelAnimation = angular.noop;
        var parent = kbScroll.getScrollParent(el);
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
            cancelAnimation = kbScroll.change(parent, 'scrollTop', parent.scrollTop + relTop + offset.top, duration);
            relBottom += relTop;
            relTop = 0;
        } else if (relBottom + offset.bottom < 0) { // down
            cancelAnimation = kbScroll.change(parent, 'scrollTop', parent.scrollTop - relBottom + offset.bottom, duration);
            relTop += relBottom;
            relBottom = 0;
        }
        if (relLeft + offset.left < 0) { // left
            cancelAnimation = kbScroll.change(parent, 'scrollLeft', parent.scrollLeft + relLeft + offset.left, duration);
            relRight += relLeft;
            relLeft = 0;
        } else if (relRight + offset.right < 0) { // right
            cancelAnimation = kbScroll.change(parent, 'scrollLeft', parent.scrollLeft - relRight + offset.right, duration);
            relLeft += relRight;
            relRight = 0;
        }
        if (parent.nodeName === viewportNode) {
            return cancelAnimation;
        }
        var cancelParentAnimation = kbScroll.to(parent, {top: relTop, right: relTop, bottom: relBottom, left: relLeft}, duration);
        return function () {
            cancelAnimation();
            cancelParentAnimation();
        };
    };

    var cancelFocus = angular.noop;
    /**
     * Focus an element
     * @param {Element} el
     */
    this.focus = function (el) {
        cancelFocus();
        var parentEl = this.getScrollParent(el);
        var scrollOffset = {
            top: parentEl.scrollTop,
            left: parentEl.scrollLeft
        };
        if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', 0);
        };
        el.focus();
        if (parentEl.scrollTop !== scrollOffset.top || parentEl.scrollLeft !== scrollOffset.left) { // position changed?
            parentEl.scrollTop = scrollOffset.top;
            parentEl.scrollLeft = scrollOffset.left;
            cancelFocus = this.to(el, {top: 0, right:0, bottom:0, left: 0}, 200);
        }
    };
}]);

//# sourceMappingURL=keyboard.js.map
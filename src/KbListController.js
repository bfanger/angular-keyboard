angular.module('keyboard').factory('KbListController', function (undefined) {
    'use strict';
    /**
     * @class KbListController
     * @ngInject @param {jQElement} $element
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
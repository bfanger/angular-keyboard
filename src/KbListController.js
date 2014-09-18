angular.module('keyboard').factory('KbListController', function (undefined) {
    'use strict';
    /**
     * @class KbListController
     * @ngInject @param {jQElement} $element
     */
    function KbListController($element) {
        this.mode = 'list';

        this.selected = undefined; // Selected model(s)
        this.active = undefined; // kbItemController of the active kb-item.

        this._element = $element[0];
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
            console.log(kbItem);
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
        }
    });
    return KbListController;
});
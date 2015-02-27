angular.module('keyboard').factory('KbContainerController', function (undefined, $log) {
    /**
     * @class KbListController
     * @param {jQElement} $element
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
    KbContainerController.$inject = ['$element'];
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
            if (this.ngModel) {
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
            }
        },

        /**
         * Select the given model.
         * Or in multiselect mode, add the given model to the selection.
         *
         * @param {*} model
         */
        select: function (model) {
            if (!this.ngModel) {
                return; // A kb-item can't be selected without a ng-model on the container element.
            }
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
            if (!this.ngModel) {
                return;
            }
            var index = this.selected.indexOf(model);
            if (index !== -1) {
                this.selected.splice(index, 1);
                if (this.multiple) {
                    this.ngModel.$setViewValue(this.selected);
                } else {
                    this.ngModel.$setViewValue(undefined);
                }
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
});
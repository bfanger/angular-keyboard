angular.module('keyboard').factory('KbItemController', function ($parse) {
    'use strict';
    /**
     * @class KbItemController
     * @param {jQElement} $element
     * @ngInject
     */
    function KbItemController($element, $scope) {
    	this.element = $element;

    	/**
    	 * Get the current value of the 
    	 * @return {*} model
    	 */
        this.getModel = (function () {
            var getter = $parse($element.attr('kb-item'));
            return function () {
                return getter($scope);
            };
        }());
    }

    angular.extend(KbItemController.prototype, {
    	focus: function () {
    		this.element.attr('tabindex', 0).focus();
    	}
    });
    return KbItemController;

});

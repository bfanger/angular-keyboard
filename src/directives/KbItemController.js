angular.module('keyboard').factory('KbItemController', function (kbFocus) {
    'use strict';

    /**
     * @class KbItemController
     * @param {jQElement} $element
     * @ngInject
     */
    function KbItemController($element) {
    	this.element = $element;
    }

    angular.extend(KbItemController.prototype, {
    	focus: function () {
    		this.element.attr('tabindex', 0);
            kbFocus(this.element);
    	}
    });
    return KbItemController;

});

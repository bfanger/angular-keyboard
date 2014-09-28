angular.module('keyboard').factory('KbItemController', function (kbScroll, undefined) {
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

});

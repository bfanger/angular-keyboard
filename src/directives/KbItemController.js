angular.module('keyboard').factory('KbItemController', function (kbScroll, undefined) {

    /**
     * @class KbItemController
     * @param {jQElement} $element
     */
    function KbItemController($element) {
        this.model = undefined;
    	this.element = $element;
    };
    KbItemController.$inject = ['$element'];
    return KbItemController;
});

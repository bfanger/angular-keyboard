/**
 * kb-select directive
 *
 * Usage:
 * <div kb-select ng-model="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbSelect', function (KbContainerController, kbScroll) {
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
});
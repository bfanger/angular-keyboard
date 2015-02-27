/**
 * kb-list directive
 *
 * Usage:
 * <div kb-list ng-model="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbList', function (KbContainerController, kbScroll) {
    return {
        controller: KbContainerController,
        require: ['kbList', '?ngModel'],
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
});
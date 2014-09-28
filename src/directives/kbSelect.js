/**
 * kb-select directive
 *
 * Usage:
 * <div kb-select ng-model="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbSelect', function (KbContainerController) {
    'use strict';

    return {
        controller: KbContainerController,
        require: ['kbSelect', 'ngModel'],
        link: function ($scope, el, attrs, controllers) {
            var kbContainer = controllers[0];

            kbContainer.initialize({
                identifier: '[kb-select]',
                ngModel: controllers[1],
                multiple: angular.isDefined(attrs.multiple),
                activate: function (kbItem) {
                    this.active = kbItem;
                    kbItem.focus();
                },
                invoke: function (kbItem) {
                    this.toggle(kbItem.model);
                    return true;
                }
            });
        }
    };
});
//            ngModel.$render = function () {
//                if (kbContainer.mode === 'multiselect') {
//                    kbContainer.selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [];
//                    for (var i in kbContainer.selected) {
//                        var kbItem = kbContainer._locate(kbContainer.selected[i]);
//                        if (kbItem) {
//                            kbContainer.active = kbItem;
//                            break;
//                        }
//                    }
//                } else {
//                    kbContainer.selected[0] = ngModel.$viewValue;
//                    var kbItem = kbContainer._locate(kbContainer.selected[0]);
//                    if (kbItem) {
//                        kbContainer.active = kbItem;
//                    }
//                }
//            };
//            $scope.$watch(function () {
//                return kbContainer.selected;
//            }, function (selected) {
//                if (kbContainer.mode === 'multiselect') {
////                    ngModel.$setViewValue(selected);
//                } else {
////                    ngModel.$setViewValue(selected[0]);
//                }
//            });

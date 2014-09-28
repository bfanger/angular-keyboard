/**
 * kb-select directive
 *
 * Usage:
 * <div kb-select="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbSelect', function (KbContainerController) {
    'use strict';

    return {
        controller: KbContainerController,
        require: 'kbSelect',
        link: function ($scope, el, attrs, kbContainer) {

            kbContainer.invoke = function (kbItem) {
                this.toggle(kbItem.model);
                return true;
            };

            kbContainer.bind($scope, attrs.kbSelect);

;

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
            $scope.$watch(function () {
                return kbContainer.selected;
            }, function (selected) {
                if (kbContainer.mode === 'multiselect') {
//                    ngModel.$setViewValue(selected);
                } else {
//                    ngModel.$setViewValue(selected[0]);
                }
            });
        }
    };
});
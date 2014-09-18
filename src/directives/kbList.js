/**
 * kb-list directive
 *
 * Usage:
 * <div kb-list ng-model="selection"> ... <div kb-item="aItem">...</div> ... </div>
 */
angular.module('keyboard').directive('kbList', function (KbListController) {
    'use strict';

    return {
        controller: KbListController,
        require: ['kbList', 'ngModel'],
        link: function ($scope, el, attrs, controllers) {
            var kbList = controllers[0];
            var ngModel = controllers[1];
            // var hasFocus = false;

            kbList.mode = attrs.kbList || 'list';

            ngModel.$render = function () {
                if (kbList.mode === 'multiselect') {
                    var value = ngModel.$viewValue;
                    if (angular.isArray(value) === false) {
                        value = [];
                    }
                    kbList.selected = value;
                    for (var i in value) {
                        var kbItem = kbList._locate(value);
                        if (kbItem) {
                            kbList.active = kbItem;
                        }
                        break;
                    }
                } else {
                    kbList.selected = ngModel.$viewValue;
                    var kbItem = kbList._locate(kbList.selected);
                    if (kbItem) {
                        kbList.active = kbItem;
                    }
                }
            };
            // if (angular.isUndefined(el.attr('tabindex'))) {
            //     el.attr('tabindex', 0);
            // }
            // el.on('click', function () {
            //     if (document.activeElement !== this) { // not(:focus) ?
            //         // In Internet Explorer a click doesn't focus containers. ><
            //         el.focus();
            //     }
            // });
            // el.on('focus', function (e) {
            //     kbList._isFocusEvent = true;
            //     if (angular.isUndefined(kbList.active)) {
            //         kbList.active = kbList.first().model;
            //     }
            //     kbList.focus = kbList.active;
            //     hasFocus = true;
            //     $scope.$apply();
            //     kbList._isFocusEvent = false;
            // });
            // el.on('blur', function () {
            //     kbList.focus = null;
            //     hasFocus = false;
            //     $scope.$apply();
            // });
            
            
            $scope.$watch(function () {
                return kbList.selected;
            }, function (value) {
                ngModel.$setViewValue(value);
            });
            $scope.$watch(function () {
                return kbList.active;
            }, function (kbItem) {
                if (kbList.mode === 'list') {
                    kbList.selected = kbItem.getModel();
                }
            });
        }
    };
});
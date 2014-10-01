/**
 * Set the autofocus based on an expression.
 *
 * Similar to ng-disabled: https://docs.angularjs.org/api/ng/directive/ngDisabled
 *
 * Usage:
 * <input type="email" kb-autofocus="email == ''" />
 */
angular.module('keyboard.focus').directive('kbFocus', function (kbFocus, $log) {
    'use strict';
    return function ($scope, el, attrs) {
        $scope.$watch(attrs.kbAutofocus, function (value) {
            el.prop('autofocus', !!value);
        });
    };
});
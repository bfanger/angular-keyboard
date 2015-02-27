/**
 * Control focus based on label with the kbFocus service.
 *
 * Inspired by ng-focus-on
 * @link https://github.com/goodeggs/ng-focus-on
 *
 * Usage:
 * <input type="text" kb-focus="label" />
 */
angular.module('keyboard.focus').directive('kbFocus', function (kbFocus, $log) {
    return function ($scope, el, attrs) {
        $scope.$watch(kbFocus.get, function (label) {
            if (label === attrs.kbFocus) {
                if (label === '') {
                    $log.error('[kb-focus] Invalid label in', el[0]);
                } else {
                    el[0].focus();
                    if (document.activeElement !== el[0]) { // focus() failed?
                        setTimeout(function () { // maybe the element was hidden (display:none)
                            el[0].focus(); // try one more time.
                        });
                    }
                }
            }
        });
        el.on('focus', function () {
            kbFocus(attrs.kbFocus);
            if (!$scope.$root.$$phase) {
                $scope.$apply();
            }
        });
        el.on('blur', function () {
            if (kbFocus.get() === attrs.kbFocus) {
                kbFocus.reset();
                if (!$scope.$root.$$phase) {
                    $scope.$apply();
                }
            }
        });
    };
});
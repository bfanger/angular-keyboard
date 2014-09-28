/**
 * Focus an element, but
 */
angular.module('keyboard').factory('kbFocus', function (kbScrollTo) {
//    var duration = 150;
//    var cancelAnimation = angular.noop;
//    function scrollTo(el, _isFocusEvent) {
//        // Wrapped in a timeout, prevents issues with focus & click events and scrolls to the last activated kb-item.
//        $timeout.cancel(timer);
//        if (_isFocusEvent) {
//            timer = $timeout(function () {
//                cancelAnimation();
//                cancelAnimation = kbScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, 0);
//            }, 100, false);
//        } else {
//            cancelAnimation();
//            cancelAnimation = kbScrollTo(el[0], {top: 0, right: 0, bottom: 0, left: 0}, 150);
//        }
//    }
    // var focusClass = attrs.kbFocusClass || 'kb-focus';
            // $scope.$watch(function () {
            //     return kbList.focus === kbItem.getModel();
            // }, function (hasFocus) {
            //     if (hasFocus) {
            //         $animate.addClass(el, focusClass);
            //         scrollTo(el, kbList._isFocusEvent);
            //     } else {
            //         $animate.removeClass(el, focusClass);
            //     }
            // });
        var timer = null;

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

//    var cancel = angular.noop;
    /**
     *
     * @param {Element} el
     */
    return function(el) {
//        console.log(el);
//        cancel();
//        cancel = kbScrollTo(el)

        el.focus();

    };
});
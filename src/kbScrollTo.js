/**
 * Helper for scrolling the active (and focussed) kb-item into a viewable area.
 */
angular.module('keyboard').factory('kbScrollTo', function ($window) {
    var noop = angular.noop;

    var duration = 150;
    // Most browsers scroll via scrollTop on the <body> element.
    var viewportNode = 'BODY';
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        viewportNode = 'HTML'; // Firefox uses the scrollTop on <html> element.
    }

    /**
     * Change the scrollposition animated and return a function that cancels the animation
     *
     * @param {Element} container
     * @param {String} property 'scrollTop' or 'scrollLeft'
     * @param {Number} value
     * @param {Boolean} animated
     * @returns {Function}
     */
    function change(container, property, value, animated) {
        if (animated && angular.element.prototype.animate) { // jQuery.animate is available?
            var el = angular.element(container);
            var props = {};
            props[property] = value;
            el.animate(props, duration);
            return function () {
                el.stop(true, true);
            };
        } else {
            container[property] = value;
            return noop;
        }
    }

    /**
     *
     * @param {Element} el
     * @param {Object} offset  Allowed hidden
     * @param {Boolean} animated
     * @returns {Function} cancel animation
     */
    function kbScrollTo(el, offset, animated) {
        var cancelAnimation = noop;
        var parent = el.parentElement;
        while (parent.nodeName !== viewportNode) {
            var parentStyle = getComputedStyle(parent);
            var overflowStyle = parentStyle.overflow + parentStyle.overflowX + parentStyle.overflowY;
            if (overflowStyle.match(/scroll|hidden/)) {
                break;
            }
            parent = parent.parentElement;
        }
        var elRect = el.getBoundingClientRect();
        var pos = {
            top: Math.ceil(elRect.top),
            right: Math.ceil(elRect.right),
            bottom: Math.ceil(elRect.bottom),
            left: Math.ceil(elRect.left)
        };
        // @todo Add outline-width to pos
        if (parent.nodeName === viewportNode) {
            var parentPos = {
                top: 0,
                right: $window.innerWidth,
                bottom: $window.innerHeight,
                left: 0
            };
        } else {
            var parentRect = parent.getBoundingClientRect();
            var parentPos = {
                top: Math.ceil(parentRect.top),
                right: Math.ceil(parentRect.right),
                bottom: Math.ceil(parentRect.bottom),
                left: Math.ceil(parentRect.left)
            };
        }
//        console.info(el.nodeName, pos, 'in', parent.nodeName, parentPos, 'offset', offset);

        var relTop = pos.top - parentPos.top;
        var relRight = parentPos.right - pos.right;
        var relBottom = parentPos.bottom - pos.bottom;
        var relLeft = pos.left - parentPos.left;

        if (relTop + offset.top < 0) { // up
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop + relTop + offset.top, animated);
            relBottom += relTop;
            relTop = 0;
        } else if (relBottom + offset.bottom < 0) { // down
            cancelAnimation = change(parent, 'scrollTop', parent.scrollTop - relBottom + offset.bottom, animated);
            relTop += relBottom;
            relBottom = 0;
        }
        if (relLeft + offset.left < 0) { // left
            cancelAnimation = change(parent, 'scrollLeft', parent.scrollLeft + relLeft + offset.left, animated);
            relRight += relLeft;
            relLeft = 0;
        } else if (relRight + offset.right < 0) { // right
            cancelAnimation = change(parent, 'scrollLeft', parent.scrollLeft - relRight + offset.right, animated);
            relLeft += relRight;
            relRight = 0;
        }
        if (parent.nodeName === viewportNode) {
            return cancelAnimation;
        }
        var cancelParentAnimation = kbScrollTo(parent, {top: relTop, right: relTop, bottom: relBottom, left: relLeft}, animated);
        return function () {
            cancelAnimation();
            cancelParentAnimation();
        };
    }
    return kbScrollTo;
});

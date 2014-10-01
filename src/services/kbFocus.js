/**
 * Service for setting the focus on elements with the kb-focus directive.
 *
 * Inspired by ng-focus-on
 * @link https://github.com/goodeggs/ng-focus-on
 *
 * Usage:
 * kbFocus('email'); // set focus
 * kbFocus(); // get current focus
 */
angular.module('keyboard.focus').factory('kbFocus', function ($log) {
    var _label = ''; // Current focussed label

    /**
     * Getter and setter for the focus.
     *
     * @param {String} label
     * @returns {String}
     */
    var kbFocus = function (label) {
        if (arguments.length === 0) {
            return _label;
        }
        kbFocus.set(label);
    };
    kbFocus.get = function () {
        return _label;
    };
    kbFocus.set = function (label) {
        if (typeof label === 'string') {
            _label = label;
        } else {
            $log.error('[kbFocus] label must be a string, got', label);
        }
    };
    kbFocus.reset = function () {
        _label = '';
    };
    return kbFocus;
});


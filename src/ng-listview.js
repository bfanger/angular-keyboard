/**
 *
 * Inspirated by: Mail.app
 * Implementation inspirated by:
 * - http://try.buildwinjs.com/#listview 
 * - http://msdn.microsoft.com/en-us/library/ms750972(v=vs.110).aspx
 * 
 */
angular.module('listview', []);
/**
 * 
 */
angular.module('listview').directive('lvList', function ($parse) {
    'use strict';
    var injectStyle = function () {
        document.querySelector('style').innerHTML += '\n[lv-list]:focus { outline: none; } [lv-item]:hover { cursor: pointer; }';
        injectStyle = angular.noop;
    };
    return {
        controller: function ($element) {
            this.mode = 'LIST';
            this.active = null;
            this.selected = null;
            
            this.previous = function () {
                var prev = this.locate(this.active).previous;
                if (prev) {
                    this.active = prev;
                    if (this.mode === 'LIST') {
                        this.selected = prev;
                    }
                    return true;
                }
                return false;
            };
            
            this.next = function () {
                var next = this.locate(this.active).next;
                if (next) {
                    this.active = next;
                    if (this.mode === 'LIST') {
                        this.selected = next;
                    }
                    return true;
                }
                return false;
            };

            this.first = function () {
                var el = $element[0].querySelector('[lv-item]');
                if (el) {
                    return angular.element(el).controller('lvItem').getModel();
                }
            };
            this.locate = function (model) {
                var items = $element[0].querySelectorAll('[lv-item]');
                for (var i = 0; i < items.length; i++) {
                    var controller = angular.element(items.item(i)).controller('lvItem');
                    if (controller.getModel() === model) {
                        var location = {
                            controller: controller
                        };
                        if (i !== 0) {
                            location.previous = angular.element(items.item(i - 1)).controller('lvItem').getModel();
                        }
                        if (i < items.length - 1) {
                            location.next = angular.element(items.item(i + 1)).controller('lvItem').getModel();
                        }
                        return location;
                    }
                }

            };
        },
        link: function ($scope, el, attrs, lvList) {
            if (!attrs.lvSelected) {
                console.error('lv-selected attribute missing on lv-list');
                return;
            }
            injectStyle();

            $scope.$watch(attrs.lvSelected, function (selectedModel) {
                lvList.selected = selectedModel;
            });
            var setSelected = $parse(attrs.lvSelected).assign;
            $scope.$watch(function () {
                return lvList.selected;
            }, function (selectedModel) {
                setSelected($scope, selectedModel);
            });
            if (angular.isUndefined(el.attr('tabindex'))) {
                el.attr('tabindex', 0);
            }
            el.on('focus', function () {
                if (lvList.selected) {
                    lvList.active = lvList.selected;
                } else {
                    lvList.active = this.first();
                }
                $scope.$apply();
            });
            el.on('blur', function () {
                lvList.active = null;
                $scope.$apply();
            });
            el.on('keydown', function (e) {
                var changed = false;
                if (e.keyIdentifier === 'Up') {
                    changed = lvList.previous();
                    
                } else if (e.keyIdentifier === 'Down') {
                    changed = lvList.next();
                }
                if (changed) {
                    e.preventDefault();
                    $scope.$apply();

                }
            });
        }
    };
});
/**
 * 
 */
angular.module('listview').directive('lvItem', function ($animate, $parse) {
    'use strict';
    return {
        controller: function ($scope, $element) {
            this.getModel = (function () {
                var getter = $parse($element.attr('lv-item'));
                return function () {
                    return getter($scope);
                };
            }());
        },
        require: ['^lvList', 'lvItem'],
        link: function ($scope, el, attrs, controllers) {
            var lvList = controllers[0];
            var lvItem = controllers[1];


            el.on('click', function () {
                lvList.active = lvItem.getModel();
                lvList.selected = lvItem.getModel();
                $scope.$apply();
            });
            var selectedClass = attrs.lvSelectedClass || 'lv-selected';
            $scope.$watch(function () {
                return lvList.selected === lvItem.getModel();
            }, function (isSelected) {
                if (isSelected) {
                    $animate.addClass(el, selectedClass);
                } else {
                    $animate.removeClass(el, selectedClass);
                }
            });
            var activeClass = attrs.lvActiveClass || 'lv-active';
            $scope.$watch(function () {
                return lvList.active === lvItem.getModel();
            }, function (hasFocus) {
                if (hasFocus) {
                    $animate.addClass(el, activeClass);
                } else {
                    $animate.removeClass(el, activeClass);
                }
            });
        }
    };
});
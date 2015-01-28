angular.module("phi.ui", ['ngAria']);

/**
 * Proof of concept: Port an angular-material element
 */

(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */
angular.module('phi.ui')
    .directive('phiCheckbox', ['inputDirective', MdCheckboxDirective]);

/**
 * @ngdoc directive
 * @name mdCheckbox
 * @module material.components.checkbox
 * @restrict E
 *
 * @description
 * The checkbox directive is used like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D).
 *
 * As per the [material design spec](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
 * the checkbox is in the accent color by default. The primary color palette may be used with
 * the `phi-primary` class.
 *
 * @param {string} ng-model Assignable angular expression to data-bind to.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {expression=} ng-true-value The value to which the expression should be set when selected.
 * @param {expression=} ng-false-value The value to which the expression should be set when not selected.
 * @param {string=} ng-change Angular expression to be executed when input changes due to user interaction with the input element.
 * @param {boolean=} phi-no-ink Use of attribute indicates use of ripple ink effects
 * @param {string=} aria-label Adds label to checkbox for accessibility.
 * Defaults to checkbox's text. If no default text is found, a warning will be logged.
 *
 * @usage
 * <hljs lang="html">
 * <phi-checkbox ng-model="isChecked" aria-label="Finished?">
 *     Finished ?
 * </phi-checkbox>
 *
 * <phi-checkbox phi-no-ink ng-model="hasInk" aria-label="No Ink Effects">
 *     No Ink Effects
 * </phi-checkbox>
 *
 * <phi-checkbox ng-disabled="true" ng-model="isDisabled" aria-label="Disabled">
 *     Disabled
 * </phi-checkbox>
 *
 * </hljs>
 *
 */
function MdCheckboxDirective(inputDirective) {

    inputDirective = inputDirective[0];
    var CHECKED_CSS = 'phi-checked';

    return {
        restrict: 'E',
        transclude: true,
        require: '^ngModel',
        template:
            '<div class="phi-container" phi-ink-ripple phi-ink-ripple-checkbox>' +
                '<div class="phi-icon"></div>' +
            '</div>' +
            '<div ng-transclude class="phi-label"></div>',
        compile: compile
    };

    // **********************************************************
    // Private Methods
    // **********************************************************

    function compile (tElement, tAttrs) {

        tAttrs.type     = 'checkbox';
        tAttrs.tabIndex = 0;
        tElement.attr('role', tAttrs.type);

        return function postLink(scope, element, attr, ngModelCtrl) {

            var checked = false;

            // Reuse the original input[type=checkbox] directive from Angular core.
            // This is a bit hacky as we need our own event listener and own render
            // function.
            inputDirective.link.pre(scope, {
                on: angular.noop,
                0: {}
            }, attr, [ngModelCtrl]);

            element.on('click', listener)
                   .on('keypress', keypressHandler);

            ngModelCtrl.$render = render;

            function keypressHandler(ev) {
                if(ev.which === 32) {
                    ev.preventDefault();
                    listener(ev);
                }
            }

            function listener(ev) {
                if (element[0].hasAttribute('disabled')) return;

                scope.$apply(function() {
                    checked = !checked;
                    ngModelCtrl.$setViewValue(checked, ev && ev.type);
                    ngModelCtrl.$render();
                });
            }

            function render() {
                element.toggleClass(CHECKED_CSS, ngModelCtrl.$viewValue);
            }
        };
    }
}

})();
/*
Same attributes as polymer's paper-element
*/

angular.module("phi.ui").directive("phiInput", ['$timeout', function($timeout) {

    var phiInputCounter = 0;

    return {
        restrict: 'EA',

        scope: {
            name:     "@",
            type:     "@",
            label:    "@",
            error:    "@",
            invalid:  "@",
            disabled: "@",
            ngModel:  "=",
            ngChange: "&",
            ngFocus:  "&",
            ngBlur:   "&"
        },

        template:   '<label for="{{id}}" ng-bind="label"></label>' +
                    '<input id="{{id}}" ng-show="!multiline" type="text" ng-model="ngModel" ng-focus="focus()" ng-blur="blur()" ng-change="change()" />' +
                    '<textarea id="{{id}}" ng-show="multiline" name="{{name}}" ng-model="ngModel" ng-trim="false" ng-focus="focus()" ng-blur="blur()" ng-disabled="disabled == \'true\'" ng-change="change()"></textarea>' +
                    '<hr />',

        link: function(scope, element, attributes)  {

            element.attr("tabindex", -1); //prevent ngAria from setting tabindex

            scope.id = "phi-input-" + ++phiInputCounter;

            scope.floatinglabel = (typeof attributes.floatinglabel !== 'undefined') && attributes.floatinglabel !== 'false' && attributes.floatinglabel !== '0';
            scope.multiline     = (typeof attributes.multiline !== 'undefined') && attributes.multiline !== 'false' && attributes.multiline !== '0';

            //Different states this element can be in
            scope.state = {
                focused: false,
                empty: true
            };

            scope.focus = function() {
                scope.focused = true;
                scope.ngFocus();

                element.toggleClass('phi-input-focused', true);
            };

            scope.blur = function() {
                scope.focused = false;
                scope.ngBlur();

                element.toggleClass('phi-input-focused', false);
            };

            //see: http://stackoverflow.com/questions/24754005/how-to-implement-an-ng-change-for-a-custom-directive
            scope.change = function() {
                $timeout(scope.ngChange, 0);
            };

            scope.resizeTextarea = function() {
                if (scope.multiline) {
                    var textarea = element.find('textarea');
                    textarea.css("height", "auto");
                    textarea.css("height", Math.max(50, textarea[0].scrollHeight, textarea[0].clientHeight) + "px");
                }
            };


            scope.$watch("ngModel", function(newValue, oldValue) {
                scope.state.empty = newValue == undefined || !newValue.length;
                element.toggleClass('phi-input-empty', scope.state.empty);
                scope.resizeTextarea();
            });


        }

    };

}]);
/* global angular */
angular.module('codexen')
  .directive('btnNewSnippet', function (Modal, $rootScope) {
    return {
      link: function (scope, el) {
        el.on('click', function () {
          Modal.newSnippet()
        })
      }
    }
  })
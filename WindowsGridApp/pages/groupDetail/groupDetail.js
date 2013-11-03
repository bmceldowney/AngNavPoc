(function () {
    "use strict";

    var inject = angular.element(document).injector().invoke;

    WinJS.UI.Pages.define("/pages/groupDetail/groupDetail.html", { ready: ready, updateLayout: updateLayout, unload: unload });

    function ready(element, options) {
        inject(function ($rootScope, $timeout) {
            $rootScope.$broadcast('ready', { element: element, options: options });
        });
    }

    function unload() {
        inject(function ($rootScope) {
            $rootScope.$broadcast('unload');
        });
    }

    function updateLayout(element, viewState, lastViewState) {
        inject(function ($rootScope) {
            $rootScope.$broadcast('updateLayout', { element: element, viewState: viewState, lastViewState: lastViewState });
        });
    }
})();

(function () {
    "use strict";

    angular.module('ratioListView', []);
    var isolatedScope = {
        layout: '=layout',
        itemDataSource: '=itemDataSource',
        groupDataSource: '=groupDataSource',
        itemTemplateId: '@itemTemplateId',
        headerTemplateId: '@headerTemplateId',
        animateLayout: '=animateLayout',
        itemInvoked: '&itemInvoked'
    };

    angular.module('ratioListView').directive('listView', function ($timeout) {
        return {
            scope: isolatedScope,
            link: function (scope, element, attr) {
                var listView = new WinJS.UI.ListView(element[0], { selectionMode: 'none' });

                listView.itemTemplate = document.getElementById(scope.itemTemplateId);
                listView.groupHeaderTemplate = document.getElementById(scope.headerTemplateId);

                scope.$watch('itemDataSource', function () {
                    listView.itemDataSource = scope.itemDataSource;
                });

                scope.$watch('groupDataSource', function () {
                    listView.groupDataSource = scope.groupDataSource;
                });

                scope.$watch('itemInvoked', function () {
                    listView.oniteminvoked = function (args) {
                        scope.itemInvoked({ args: args });
                    }
                })

                scope.$watch('layout', function () {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }

                    //this may or may not be something that is desired universally for ListViews
                    if (scope.animateLayout) {
                        listView.addEventListener("contentanimating", handler, false);
                    }

                    listView.layout = scope.layout;
                    var firstVisible = listView.indexOfFirstVisible;
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                });

                //hacky timeout to wait to focus until the page loading animation finishes
                //could be replaced if an event exits that fires when animation is finished
                $timeout(function () {
                    listView.element.focus();
                }, 750);

                scope.$on('$destroy', function () {
                    scope.itemDataSource = null;
                    scope.groupDataSource = null;
                    scope.layout = null;
                    scope.itemInvoked = null;
                    listView = null;

                    element.remove();
                })
            }
        };
    });
})()

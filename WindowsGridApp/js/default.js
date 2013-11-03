angular.module('app', ['ratioListView']);

angular.module('app').run(function ($compile, $rootScope, $timeout) {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }

        //Application.navigator.addEventListener('pageLoaded', function (arg) {
        //    args = arg.detail;
        $rootScope.$on('ready', function (evt, args) {
            $timeout(function () {
                $rootScope.navOptions = args.options || {};
                $compile(args.element)($rootScope);
            })
        });
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
});

angular.module('app').controller('groupDetailCtrl', function ($scope, $timeout) {
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var options = $scope.navOptions;
    var group = (options && options.groupKey) ? Data.resolveGroupReference(options.groupKey) : Data.groups.getAt(0);
    var items = Data.getItemsFromGroup(group);
    var pageList = items.createGrouped(
        function groupKeySelector(item) { return group.key; },
        function groupDataSelector(item) { return group; }
    );

    var navigateToGroup = function (key) {
        nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
    }
    var initializeLayout = function (viewState) {
        var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
        if (viewState === appViewState.snapped) {
            $scope.layout = new WinJS.UI.ListLayout();
        } else {
            $scope.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "left" });
        }
    }
    var itemInvoked = function (args) {
        if (appView.value === appViewState.snapped) {
            // If the page is snapped, the user invoked a group.
            var group = Data.groups.getAt(args.detail.itemIndex);
            navigateToGroup(group.key);
        } else {
            // If the page is not snapped, the user invoked an item.
            var item = Data.items.getAt(args.detail.itemIndex);
            nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
        }
    }

    $scope.itemInvoked = itemInvoked;
    $scope.animateLayout = true;
    $scope.title = group.title;
    $scope.itemDataSource = pageList.dataSource;
    $scope.groupDataSource = pageList.groups.dataSource;
    initializeLayout(Windows.UI.ViewManagement.ApplicationView.value);

    //the parent controller on a page needs to destroy itself on navigation
    //this is needed because we are using WinJS navigation and not AngularJS routing
    $scope.$on('unload', function () {
        $scope.itemInvoked = null;
        $scope.title = null;
        $scope.layout = null;
        $scope.itemDataSource = null;
        $scope.groupDataSource = null;

        //destroy on the next turn, else $broadcast will crash trying to communicate with any 
        //destroyed child scopes
        $timeout(function () {
            $scope.$destroy();
        });
    });

    $scope.$on('updateLayout', function (evt, args) {
        if (args.lastViewState !== args.viewState) {
            $scope.animateLayout = (args.lastViewState === appViewState.snapped || args.viewState === appViewState.snapped)

            $timeout(function () {
                initializeLayout(args.viewState);
                $scope.animateLayout = true;
            });
        }
    });
});

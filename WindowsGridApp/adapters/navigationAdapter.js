(function () {
    var history = {
        backStack: [],
        current: { location: "", initialPlaceholder: true },
        forwardStack: []
    };
    var ListenerType = WinJS.Class.mix(WinJS.Class.define(null, { /* empty */ }, { supportedForProcessing: false }), WinJS.Utilities.eventMixin);
    var listeners = new ListenerType();
    var beforenavigateEventName = "beforenavigate";
    var raiseBeforeNavigate = function (proposed) {
        return WinJS.Promise.as().
            then(function () {
                var waitForPromise = WinJS.Promise.as();
                var defaultPrevented = listeners.dispatchEvent(beforenavigateEventName, {
                    setPromise: function (promise) {
                        /// <signature helpKeyword="WinJS.Navigation.beforenavigate.setPromise">
                        /// <summary locid="WinJS.Navigation.beforenavigate.setPromise">
                        /// Used to inform the ListView that asynchronous work is being performed, and that this
                        /// event handler should not be considered complete until the promise completes.
                        /// </summary>
                        /// <param name="promise" type="WinJS.Promise" locid="WinJS.Navigation.beforenavigate.setPromise_p:promise">
                        /// The promise to wait for.
                        /// </param>
                        /// </signature>

                        waitForPromise = waitForPromise.then(function () { return promise; });
                    },
                    location: proposed.location,
                    state: proposed.state
                });
                return waitForPromise.then(function beforeNavComplete(cancel) {
                    return defaultPrevented || cancel;
                });
            });
    };

    var navigateWithWinJs = function (location, initialState) {
        /// <signature helpKeyword="WinJS.Navigation.navigate">
        /// <summary locid="WinJS.Navigation.navigate">
        /// Navigates to a location.
        /// </summary>
        /// <param name="location" type="Object" locid="WinJS.Navigation.navigate_p:location">
        /// The location to navigate to. Generally the location is a string, but
        /// it may be anything.
        /// </param>
        /// <param name="initialState" type="Object" locid="WinJS.Navigation.navigate_p:initialState">
        /// The navigation state that may be accessed through WinJS.Navigation.state.
        /// </param>
        /// <returns type="Promise" locid="WinJS.Navigation.navigate_returnValue">
        /// A promise that is completed with a value that indicates whether or not
        /// the navigation was successful.
        /// </returns>
        /// </signature>
        var proposed = { location: location, state: initialState };
        return raiseBeforeNavigate(proposed).
            then(function navBeforeCompleted(cancel) {
                if (!cancel) {
                    if (!history.current.initialPlaceholder) {
                        history.backStack.push(history.current);
                    }
                    history.forwardStack = [];
                    history.current = proposed;

                    // error or no, we go from navigating -> navigated
                    // cancelation should be handled with "beforenavigate"
                    //
                    return raiseNavigating().then(
                        raiseNavigated,
                        function (err) {
                            raiseNavigated(undefined, err || true);
                            throw err;
                        }).then(function () { return true; });
                }
                else {
                    return false;
                }
            });
    }

    WinJS.Namespace.define('WinJS.Navigation', {
        navigate: function (location, options) {
            if (location.indexOf('.html')) {
                navigateWithWinJs(location, options);
            }
            else {
                navigateWithAngular()
            }
        }
    });
})()

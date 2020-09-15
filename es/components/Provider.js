var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Comment from './Comment';
import KeepAliveContext from '../contexts/KeepAliveContext';
import createEventEmitter from '../utils/createEventEmitter';
import createUniqueIdentification from '../utils/createUniqueIdentification';
import createStoreElement from '../utils/createStoreElement';
export var keepAliveProviderTypeName = '$$KeepAliveProvider';
export var START_MOUNTING_DOM = 'startMountingDOM';
export var LIFECYCLE;
(function (LIFECYCLE) {
    LIFECYCLE[LIFECYCLE["MOUNTED"] = 0] = "MOUNTED";
    LIFECYCLE[LIFECYCLE["UPDATING"] = 1] = "UPDATING";
    LIFECYCLE[LIFECYCLE["UNMOUNTED"] = 2] = "UNMOUNTED";
})(LIFECYCLE || (LIFECYCLE = {}));
var KeepAliveProvider = /** @class */ (function (_super) {
    __extends(KeepAliveProvider, _super);
    function KeepAliveProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Sometimes data that changes with setState cannot be synchronized, so force refresh
        _this.cache = Object.create(null);
        _this.keys = [];
        _this.eventEmitter = createEventEmitter();
        _this.existed = true;
        _this.needRerender = false;
        _this.providerIdentification = createUniqueIdentification();
        _this.isExisted = function () {
            return _this.existed;
        };
        _this.setCache = function (identification, value) {
            var _a = _this, cache = _a.cache, keys = _a.keys;
            var max = _this.props.max;
            var currentCache = cache[identification];
            if (!currentCache) {
                keys.push(identification);
            }
            _this.cache[identification] = __assign(__assign({}, currentCache), value);
            _this.forceUpdate(function () {
                // If the maximum value is set, the value in the cache is deleted after it goes out.
                if (currentCache) {
                    return;
                }
                if (!max) {
                    return;
                }
                var difference = keys.length - max;
                if (difference <= 0) {
                    return;
                }
                var spliceKeys = keys.splice(0, difference);
                _this.forceUpdate(function () {
                    spliceKeys.forEach(function (key) {
                        delete cache[key];
                    });
                });
            });
        };
        _this.removeCache = function (name) {
            var _a = _this, cache = _a.cache, keys = _a.keys;
            var needDeletedCacheKeys = [];
            for (var key in cache) {
                if (Object.prototype.hasOwnProperty.call(cache, key)) {
                    var keepAliveObject = cache[key];
                    // if name is array, mutiple delete caches
                    if (Object.prototype.toString.call(name) === '[object Array]') {
                        if (name.indexOf(keepAliveObject.children._owner.key) > -1) {
                            needDeletedCacheKeys.push(key);
                            delete cache[key];
                        }
                    }
                    else if (Object.prototype.toString.call(name) === '[object String]') {
                        if (name.indexOf(keepAliveObject.children._owner.key) > -1) {
                            needDeletedCacheKeys.push(key);
                            delete cache[key];
                        }
                    }
                    else {
                        throw new Error("name can be only string or string array");
                    }
                }
            }
            _this.keys = keys.filter(function (key) { return needDeletedCacheKeys.indexOf(key) === -1; });
            _this.forceUpdate();
        };
        _this.unactivate = function (identification) {
            var cache = _this.cache;
            _this.cache[identification] = __assign(__assign({}, cache[identification]), { activated: false, lifecycle: LIFECYCLE.UNMOUNTED });
            _this.forceUpdate();
        };
        _this.startMountingDOM = function (identification) {
            _this.eventEmitter.emit([identification, START_MOUNTING_DOM]);
        };
        return _this;
    }
    KeepAliveProvider.prototype.componentDidMount = function () {
        this.storeElement = createStoreElement();
        this.forceUpdate();
    };
    KeepAliveProvider.prototype.componentDidUpdate = function () {
        if (this.needRerender) {
            this.needRerender = false;
            this.forceUpdate();
        }
    };
    KeepAliveProvider.prototype.componentWillUnmount = function () {
        this.existed = false;
        document.body.removeChild(this.storeElement);
    };
    KeepAliveProvider.prototype.render = function () {
        var _this = this;
        var _a = this, cache = _a.cache, keys = _a.keys, providerIdentification = _a.providerIdentification, isExisted = _a.isExisted, setCache = _a.setCache, removeCache = _a.removeCache, existed = _a.existed, unactivate = _a.unactivate, storeElement = _a.storeElement, eventEmitter = _a.eventEmitter;
        var _b = this.props, innerChildren = _b.children, include = _b.include, exclude = _b.exclude;
        if (!storeElement) {
            return null;
        }
        return (React.createElement(KeepAliveContext.Provider, { value: {
                cache: cache,
                keys: keys,
                existed: existed,
                providerIdentification: providerIdentification,
                isExisted: isExisted,
                setCache: setCache,
                removeCache: removeCache,
                unactivate: unactivate,
                storeElement: storeElement,
                eventEmitter: eventEmitter,
                include: include,
                exclude: exclude,
            } },
            React.createElement(React.Fragment, null,
                innerChildren,
                ReactDOM.createPortal(keys.map(function (identification) {
                    var currentCache = cache[identification];
                    var keepAlive = currentCache.keepAlive, children = currentCache.children, lifecycle = currentCache.lifecycle;
                    var cacheChildren = children;
                    if (lifecycle === LIFECYCLE.MOUNTED && !keepAlive) {
                        // If the cache was last enabled, then the components of this keepAlive package are used,
                        // and the cache is not enabled, the UI needs to be reset.
                        cacheChildren = null;
                        _this.needRerender = true;
                        currentCache.lifecycle = LIFECYCLE.UPDATING;
                    }
                    // current true, previous true | undefined, keepAlive false, not cache
                    // current true, previous true | undefined, keepAlive true, cache
                    // current true, previous false, keepAlive true, cache
                    // current true, previous false, keepAlive false, not cache
                    return (cacheChildren
                        ? (React.createElement(React.Fragment, { key: identification },
                            React.createElement(Comment, null, identification),
                            cacheChildren,
                            React.createElement(Comment, { onLoaded: function () { return _this.startMountingDOM(identification); } }, identification)))
                        : null);
                }), storeElement))));
    };
    KeepAliveProvider.displayName = keepAliveProviderTypeName;
    KeepAliveProvider.defaultProps = {
        max: 10,
    };
    return KeepAliveProvider;
}(React.PureComponent));
export default KeepAliveProvider;

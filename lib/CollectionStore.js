"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var type_check_1 = require("type-check");
var AbstractStore_1 = require("./AbstractStore");
var utils_1 = require("./utils");
var AbstractCollectionStore = (function (_super) {
    __extends(AbstractCollectionStore, _super);
    function AbstractCollectionStore(owner, options) {
        var _this = _super.call(this, owner) || this;
        _this.items = mobx_1.observable(options.items);
        return _this;
    }
    AbstractCollectionStore.prototype.findItem = function (id) {
        return this.items.find(function (item) { return item.id === id; });
    };
    AbstractCollectionStore.prototype.clearItems = function () {
        this.items.clear();
    };
    AbstractCollectionStore.prototype.removeItem = function (ref) {
        if (typeof ref === 'string')
            ref = this.findItem(ref);
        if (!ref)
            return false;
        return this.items.remove(ref);
    };
    AbstractCollectionStore.prototype.removeItemAtIndex = function (index) {
        return this.items.splice(index, 1);
    };
    AbstractCollectionStore.prototype.removeItems = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return mobx_1.runInAction('removeItems', function () {
            return items.map(function (item) { return _this.removeItem(item); });
        });
    };
    AbstractCollectionStore.prototype.addItem = function (item, index) {
        if (type_check_1.typeCheck('Number', index)) {
            this.items.splice(index, 0, item);
        }
        else {
            this.items.push(item);
        }
    };
    AbstractCollectionStore.prototype.updateItem = function (ref, attrs) {
        if (typeof ref === 'string')
            ref = this.findItem(ref);
        if (typeof ref === 'object' && ref) {
            mobx_1.runInAction('updateItem', function () {
                Object.keys(attrs).forEach(function (attr) {
                    ref[attr] = attrs[attr];
                });
            });
            return ref;
        }
        else
            return null;
    };
    AbstractCollectionStore.prototype.replaceItems = function (items) {
        return this.items.replace(items);
    };
    return AbstractCollectionStore;
}(AbstractStore_1.AbstractStore));
__decorate([
    mobx_1.observable
], AbstractCollectionStore.prototype, "items", void 0);
__decorate([
    mobx_1.action
], AbstractCollectionStore.prototype, "clearItems", null);
__decorate([
    mobx_1.action
], AbstractCollectionStore.prototype, "removeItem", null);
__decorate([
    mobx_1.action
], AbstractCollectionStore.prototype, "removeItemAtIndex", null);
__decorate([
    mobx_1.action
], AbstractCollectionStore.prototype, "removeItems", null);
__decorate([
    mobx_1.action
], AbstractCollectionStore.prototype, "addItem", null);
__decorate([
    mobx_1.action
], AbstractCollectionStore.prototype, "updateItem", null);
__decorate([
    mobx_1.action
], AbstractCollectionStore.prototype, "replaceItems", null);
exports.AbstractCollectionStore = AbstractCollectionStore;
var AbstractApiCollectionStore = (function (_super) {
    __extends(AbstractApiCollectionStore, _super);
    function AbstractApiCollectionStore(owner, options) {
        var _this = _super.call(this, owner, options) || this;
        _this.setBusy = function (value) {
            _this.busy = value;
        };
        _this.props = mobx_1.observable(options.props);
        _this.filter = mobx_1.observable(_this.defaultFilter);
        _this.meta = mobx_1.observable(_this.defaultMeta);
        _this.debouncedFetch = utils_1.debounce(_this.fetch, options.debounceInterval);
        return _this;
    }
    AbstractApiCollectionStore.prototype.setProps = function (props, fetch) {
        if (fetch === void 0) { fetch = false; }
        type_check_1.typeCheck('Number', props.page) && this.setProp('page', props.page);
        type_check_1.typeCheck('Number', props.pageSize) && this.setProp('pageSize', props.pageSize);
        type_check_1.typeCheck('String', props.orderBy) && this.setProp('orderBy', props.orderBy);
        type_check_1.typeCheck('String', props.orderDir) && this.setProp('orderDir', props.orderDir);
        type_check_1.typeCheck('Number', props.count) && this.setProp('count', props.count);
        if (fetch)
            return this.fetch();
        return null;
    };
    AbstractApiCollectionStore.prototype.setProp = function (key, value, fetch) {
        if (fetch === void 0) { fetch = false; }
        this.props[key] = value;
        if (fetch)
            return this.fetch();
        return null;
    };
    AbstractApiCollectionStore.prototype.setFilterKey = function (key, value, fetch, debounce) {
        if (fetch === void 0) { fetch = false; }
        if (debounce === void 0) { debounce = false; }
        this.filter[key] = value;
        if (fetch) {
            if (!debounce)
                return this.fetch();
            else
                this.debouncedFetch();
        }
        return null;
    };
    AbstractApiCollectionStore.prototype.setFilter = function (filter, fetch) {
        var _this = this;
        if (fetch === void 0) { fetch = false; }
        Object.keys(this.defaultFilter).map(function (key) {
            _this.filter[key] = filter[key];
        });
        if (fetch)
            return this.fetch();
        return null;
    };
    AbstractApiCollectionStore.prototype.resetFilter = function (fetch) {
        var _this = this;
        if (fetch === void 0) { fetch = false; }
        Object.keys(this.defaultFilter).map(function (key) {
            _this.filter[key] = _this.defaultFilter[key];
        });
        if (fetch)
            return this.fetch();
        return null;
    };
    AbstractApiCollectionStore.prototype.setMetaKey = function (key, value, fetch, debounce) {
        if (fetch === void 0) { fetch = false; }
        if (debounce === void 0) { debounce = false; }
        this.meta[key] = value;
        if (fetch) {
            if (!debounce)
                return this.fetch();
            else
                this.debouncedFetch();
        }
        return null;
    };
    AbstractApiCollectionStore.prototype.setMeta = function (meta, fetch) {
        var _this = this;
        if (fetch === void 0) { fetch = false; }
        Object.keys(this.defaultMeta).map(function (key) {
            _this.meta[key] = meta[key];
        });
        if (fetch)
            return this.fetch();
        return null;
    };
    AbstractApiCollectionStore.prototype.resetMeta = function (fetch) {
        var _this = this;
        if (fetch === void 0) { fetch = false; }
        Object.keys(this.defaultMeta).map(function (key) {
            _this.meta[key] = _this.defaultMeta[key];
        });
        if (fetch)
            return this.fetch();
        return null;
    };
    AbstractApiCollectionStore.prototype.fetch = function () {
        var _this = this;
        this.setBusy(true);
        var promise = this
            .apiFetch(Object.assign(mobx_1.toJS(this.props), { filter: mobx_1.toJS(this.filter), meta: mobx_1.toJS(this.meta) }));
        promise
            .then(function (res) { return mobx_1.runInAction('fetchCompleted', function () {
            _this.load(res);
            _this.setBusy(false);
        }); })
            .catch(function (err) { return mobx_1.runInAction('fetchFailed', function () {
            _this.setError(err);
            _this.setBusy(false);
        }); });
        return promise;
    };
    AbstractApiCollectionStore.prototype.reset = function () {
        this.resetFilter();
        this.resetMeta();
        this.clearItems();
    };
    AbstractApiCollectionStore.prototype.sort = function (field, direction) {
        field || (field = this.props.orderBy);
        direction || (direction = this.props.orderDir);
        return this.setProps({
            orderBy: field,
            orderDir: direction
        }, true);
    };
    AbstractApiCollectionStore.prototype.getPage = function (page) {
        return this.setProps({
            page: page,
        }, true);
    };
    AbstractApiCollectionStore.prototype.load = function (data) {
        this.setProps(data);
        this.items.replace(data.data);
    };
    return AbstractApiCollectionStore;
}(AbstractCollectionStore));
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "setProps", null);
__decorate([
    mobx_1.observable
], AbstractApiCollectionStore.prototype, "busy", void 0);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "setBusy", void 0);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "setProp", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "setFilterKey", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "setFilter", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "resetFilter", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "setMetaKey", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "setMeta", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "resetMeta", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "fetch", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "reset", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "sort", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "getPage", null);
__decorate([
    mobx_1.action
], AbstractApiCollectionStore.prototype, "load", null);
exports.AbstractApiCollectionStore = AbstractApiCollectionStore;
var AbstractApiSelectableCollectionStore = (function (_super) {
    __extends(AbstractApiSelectableCollectionStore, _super);
    function AbstractApiSelectableCollectionStore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractApiSelectableCollectionStore.prototype.toggleItemSelect = function (ref) {
        if (typeof ref === 'string') {
            var item = this.findItem(ref);
            item.__selected = !item.__selected;
        }
        else if (typeof ref === 'object') {
            ref.__selected = !ref.__selected;
        }
    };
    Object.defineProperty(AbstractApiSelectableCollectionStore.prototype, "selection", {
        get: function () {
            return this.items.filter(function (item) { return item.__selected; });
        },
        enumerable: true,
        configurable: true
    });
    AbstractApiSelectableCollectionStore.prototype.load = function (data) {
        this.setProps(data);
        this.items.replace(data.data.map(function (item) {
            item.__selected = false;
            return item;
        }));
    };
    return AbstractApiSelectableCollectionStore;
}(AbstractApiCollectionStore));
__decorate([
    mobx_1.action
], AbstractApiSelectableCollectionStore.prototype, "toggleItemSelect", null);
__decorate([
    mobx_1.computed
], AbstractApiSelectableCollectionStore.prototype, "selection", null);
__decorate([
    mobx_1.action
], AbstractApiSelectableCollectionStore.prototype, "load", null);
exports.AbstractApiSelectableCollectionStore = AbstractApiSelectableCollectionStore;

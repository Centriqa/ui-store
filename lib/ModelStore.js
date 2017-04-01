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
var AbstractModelStore = (function (_super) {
    __extends(AbstractModelStore, _super);
    function AbstractModelStore(owner, options) {
        var _this = _super.call(this, owner) || this;
        _this.attributes = mobx_1.observable(options.attributes);
        _this.defaultAttributes = options.attributes;
        return _this;
    }
    Object.defineProperty(AbstractModelStore.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    AbstractModelStore.prototype.get = function (key) {
        return this.attributes[key];
    };
    AbstractModelStore.prototype.setAttribute = function (key, value) {
        this.attributes[key] = value;
    };
    AbstractModelStore.prototype.setId = function (id) {
        this._id = id;
    };
    AbstractModelStore.prototype.setAttributes = function (attrs) {
        var _this = this;
        Object.keys(attrs).forEach(function (key) {
            _this.attributes[key] = attrs[key];
        });
    };
    AbstractModelStore.prototype.reset = function () {
        var _this = this;
        this._id = null;
        Object(this.defaultAttributes).forEach(function (key) {
            _this.attributes[key] = _this.defaultAttributes[key];
        });
    };
    AbstractModelStore.prototype.load = function (id, attrs) {
        this._id = id;
        this.setAttributes(attrs);
    };
    return AbstractModelStore;
}(AbstractStore_1.AbstractStore));
__decorate([
    mobx_1.observable
], AbstractModelStore.prototype, "attributes", void 0);
__decorate([
    mobx_1.observable
], AbstractModelStore.prototype, "_id", void 0);
__decorate([
    mobx_1.computed
], AbstractModelStore.prototype, "id", null);
__decorate([
    mobx_1.action
], AbstractModelStore.prototype, "setAttribute", null);
__decorate([
    mobx_1.action
], AbstractModelStore.prototype, "setId", null);
__decorate([
    mobx_1.action
], AbstractModelStore.prototype, "setAttributes", null);
__decorate([
    mobx_1.action
], AbstractModelStore.prototype, "reset", null);
__decorate([
    mobx_1.action
], AbstractModelStore.prototype, "load", null);
exports.AbstractModelStore = AbstractModelStore;
var AbstractApiModelStore = (function (_super) {
    __extends(AbstractApiModelStore, _super);
    function AbstractApiModelStore(owner, options) {
        var _this = _super.call(this, owner, options) || this;
        _this.setBusy = function (value) {
            _this.busy = value;
        };
        _this.validationRules = options.validationRules;
        _this.debouncedUpdate = utils_1.debounce(_this.update, options.updateDebounceInterval);
        return _this;
    }
    AbstractApiModelStore.prototype.fetch = function (id, meta) {
        var _this = this;
        id || (id = this._id);
        if (!type_check_1.typeCheck('String', id))
            return;
        this.setBusy(true);
        var promise = this.apiFetch({
            id: id,
            meta: meta
        });
        promise
            .then(function (res) { return mobx_1.runInAction('fetchCompleted', function () {
            _this.load(res.id, res.attrs);
            _this.setBusy(false);
        }); })
            .catch(function (err) { return mobx_1.runInAction('fetchFailed', function () {
            _this.setError(err);
            _this.setBusy(false);
        }); });
        return promise;
    };
    AbstractApiModelStore.prototype.create = function (id, attrs, meta, optimistic) {
        var _this = this;
        if (optimistic === void 0) { optimistic = false; }
        type_check_1.typeCheck('Object', attrs) || (attrs = mobx_1.toJS(this.attributes));
        this.setBusy(true);
        if (optimistic) {
            if (id)
                this.load(id, attrs);
            else
                throw Error('Optimistic create requires id argument');
        }
        var promise = this.apiCreate({
            id: id,
            attrs: attrs,
            meta: meta
        });
        promise
            .then(function (res) { return mobx_1.runInAction('createCompleted', function () {
            !optimistic && _this.load(res.id, res.attrs);
            _this.setBusy(false);
        }); })
            .catch(function (err) { return mobx_1.runInAction('createFailed', function () {
            _this.setError(err);
            _this.setBusy(false);
        }); });
        return promise;
    };
    AbstractApiModelStore.prototype.update = function (id, attrs, meta, optimistic) {
        var _this = this;
        if (optimistic === void 0) { optimistic = false; }
        if (!type_check_1.typeCheck('String', id))
            return;
        type_check_1.typeCheck('Object', attrs) || (attrs = mobx_1.toJS(this.attributes));
        this.setBusy(true);
        optimistic && this.load(id, attrs);
        var promise = this.apiUpdate({
            id: id,
            attrs: attrs,
            meta: meta
        });
        promise
            .then(function (res) { return mobx_1.runInAction('updateCompleted', function () {
            !optimistic && _this.load(res.id, res.attrs);
            _this.setBusy(false);
        }); })
            .catch(function (err) { return mobx_1.runInAction('updateFailed', function () {
            _this.setError(err);
            _this.setBusy(false);
        }); });
        return promise;
    };
    AbstractApiModelStore.prototype.delete = function (id, meta, optimistic) {
        var _this = this;
        if (optimistic === void 0) { optimistic = false; }
        id || (id = this._id);
        if (!type_check_1.typeCheck('String', id))
            return;
        this.setBusy(true);
        optimistic && this.reset();
        var promise = this.apiDelete({
            id: id,
            meta: meta
        });
        promise
            .then(function (res) { return mobx_1.runInAction('deleteCompleted', function () {
            !optimistic && _this.reset();
            _this.setBusy(false);
        }); })
            .catch(function (err) { return mobx_1.runInAction('deleteFailed', function () {
            _this.setError(err);
            _this.setBusy(false);
        }); });
        return promise;
    };
    AbstractApiModelStore.prototype.setAttribute = function (key, value, update, debounce) {
        if (update === void 0) { update = false; }
        if (debounce === void 0) { debounce = false; }
        this.attributes[key] = value;
        if (update) {
            var attrs = {};
            attrs[key] = value;
            if (debounce)
                this.debouncedUpdate(this._id, attrs, {}, false);
            else
                this.update(this._id, attrs, {}, false);
        }
    };
    AbstractApiModelStore.prototype.setAttributes = function (attrs, update) {
        if (update === void 0) { update = false; }
        if (update) {
            var updates_1 = {};
            Object.keys(attrs).forEach(function (key) {
                updates_1[key] = attrs[key];
            });
            this.update(this._id, updates_1, {}, true);
        }
        else
            _super.prototype.setAttributes.call(this, attrs);
    };
    return AbstractApiModelStore;
}(AbstractModelStore));
__decorate([
    mobx_1.observable
], AbstractApiModelStore.prototype, "busy", void 0);
__decorate([
    mobx_1.action
], AbstractApiModelStore.prototype, "setBusy", void 0);
__decorate([
    mobx_1.action
], AbstractApiModelStore.prototype, "fetch", null);
__decorate([
    mobx_1.action
], AbstractApiModelStore.prototype, "create", null);
__decorate([
    mobx_1.action
], AbstractApiModelStore.prototype, "update", null);
__decorate([
    mobx_1.action
], AbstractApiModelStore.prototype, "delete", null);
__decorate([
    mobx_1.action
], AbstractApiModelStore.prototype, "setAttribute", null);
__decorate([
    mobx_1.action
], AbstractApiModelStore.prototype, "setAttributes", null);
exports.AbstractApiModelStore = AbstractApiModelStore;

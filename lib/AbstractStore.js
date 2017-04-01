"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var type_check_1 = require("type-check");
var AbstractStore = (function () {
    function AbstractStore(owner) {
        this.error = null;
        this._owner = owner;
    }
    Object.defineProperty(AbstractStore.prototype, "owner", {
        get: function () {
            return this._owner;
        },
        enumerable: true,
        configurable: true
    });
    AbstractStore.prototype.setError = function (value) {
        if (value === void 0) { value = null; }
        if (type_check_1.typeCheck('String', value))
            this.error = value;
        else if (type_check_1.typeCheck('{ message: String }', value))
            this.error = value.message;
        else if (value === null)
            this.error = value;
        else
            throw new TypeError('Expecting string or Error');
    };
    return AbstractStore;
}());
AbstractStore.toJS = mobx_1.toJS;
__decorate([
    mobx_1.observable
], AbstractStore.prototype, "error", void 0);
__decorate([
    mobx_1.action.bound
], AbstractStore.prototype, "setError", null);
exports.AbstractStore = AbstractStore;

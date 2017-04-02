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
Object.defineProperty(exports, "__esModule", { value: true });
var ModelStore_1 = require("./ModelStore");
var mobx_1 = require("mobx");
var Store = (function (_super) {
    __extends(Store, _super);
    function Store() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Store;
}(ModelStore_1.AbstractModelStore));
exports.Store = Store;
var store = new Store(null, {
    attributes: {
        name: 'Adi',
        age: 43
    },
    validationRules: {
        'age': function (val) {
            if (val < 20)
                return 'Too young';
            return null;
        },
        'name': function (val) {
            if (val.length < 3)
                return 'Too short';
            return null;
        }
    }
});
mobx_1.observe(store, 'hasValidationErrors', function (change) {
    console.log('hasValidationErrors -----', change.newValue);
});
mobx_1.observe(store.validationErrors, function (change) {
    console.log('validation errors -----', change.newValue);
});
mobx_1.observe(store.attributes, function (change) {
    console.log('attributes -----', change.newValue);
});
store.setAttributes({
    name: 'Adi',
    age: 18
});

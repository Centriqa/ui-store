"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debounce(f, interval, immediate) {
    var timeout;
    var timestamp;
    var context;
    var args;
    var result;
    if (typeof interval === 'undefined')
        interval = 100;
    function later() {
        var last = Date.now() - timestamp;
        if (last < interval && last > 0) {
            timeout = window.setTimeout(later, interval - last);
        }
        else {
            timeout = null;
            if (!immediate) {
                result = f.apply(context, args);
                context = args = null;
            }
        }
    }
    var debounced = function () {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout)
            timeout = window.setTimeout(later, interval);
        if (callNow) {
            result = f.apply(context, args);
            context = args = null;
        }
        return result;
    };
    debounced.clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };
    return debounced;
}
exports.debounce = debounce;

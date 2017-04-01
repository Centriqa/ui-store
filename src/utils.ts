
/**
 * debounce
 */
export function debounce<F extends Function>(f: F, interval?: number, immediate?: boolean): () => F {

    let timeout: number;
    let timestamp: number;
    let context: F;
    let args: IArguments;
    let result: F;

    if (typeof interval === 'undefined') interval = 100;

    function later() {
        const last = Date.now() - timestamp;

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

    const debounced = function () {
        context = this;
        args = arguments;
        timestamp = Date.now();

        const callNow = immediate && !timeout;

        if (!timeout) timeout = window.setTimeout(later, interval);
        if (callNow) {
            result = f.apply(context, args);
            context = args = null;
        }

        return result;
    };

    (debounced as any).clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    }

    return debounced;
}
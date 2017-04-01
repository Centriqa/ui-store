import { toJS } from 'mobx';
export declare abstract class AbstractStore<O> {
    constructor(owner: O);
    protected _owner: O;
    readonly owner: O;
    static toJS: typeof toJS;
    error: string;
    setError(value?: string | Error): void;
}

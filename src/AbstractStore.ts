import { observable, action, computed, toJS } from 'mobx';
import { typeCheck } from 'type-check';

 //-----------------------------------------------------------------------------------------------------------------------------------------//

/**
 * AbstractStore
 */
export abstract class AbstractStore<O> {

    constructor(owner: O) {
        this._owner = owner;
    }

    protected _owner: O;

    public get owner() {
        return this._owner;
    }

    static toJS = toJS;

    @observable
    public error: string = null;

    @action.bound
    public setError(value : string | Error = null) {
        if (typeCheck('String', value)) this.error = value as string;
        else if (typeCheck('{ message: String }', value)) this.error = (value as Error).message;
        else if (value === null) this.error = value as null;
        else throw new TypeError('Expecting string or Error');

    }
}

 //-----------------------------------------------------------------------------------------------------------------------------------------//
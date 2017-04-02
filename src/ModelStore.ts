import { observable, action, computed, runInAction, IObservableArray, toJS } from 'mobx';
import * as Promise from 'bluebird';
import { typeCheck } from 'type-check';
import { AbstractStore } from './AbstractStore';
import { debounce } from './utils';

//-----------------------------------------------------------------------------------------------------------------------------------------//

export type TModelAttributes = {
    [key: string]: any
};

export type TValidationRule = (value: any) => string;

export type TValidationRules<T> = {
    [P in keyof T]?: TValidationRule;
}

export type TValidationErrors<T> = {
    [P in keyof T]?: string;
}

export interface IModelStoreOptions<T> {
    attributes: T;
    validationRules: TValidationRules<T>;
}


/**
 * AbstractModelStore
 */
export abstract class AbstractModelStore<O, T extends TModelAttributes> extends AbstractStore<O> {

    constructor(owner: O, options: IModelStoreOptions<T>) {
        super(owner);

        this.attributes = observable(options.attributes);
        this.defaultAttributes = options.attributes;
        this.validationRules = options.validationRules;
        const validationErrors: TValidationErrors<T> = {};
        Object.keys(options.validationRules).forEach((rule: keyof T) => validationErrors[rule] = null);
        this.validationErrors = observable(validationErrors) as any;
    }

    protected defaultAttributes: T;
    public validationRules: TValidationRules<T>;
    public validationErrors: TValidationErrors<T>;

    @observable
    public attributes: T;

    @observable
    protected _id: string;

    @computed
    public get id() {
        return this._id;
    }

    public get(key: keyof T) {
        return this.attributes[key];
    }

    @action
    protected validate(key: keyof T, value: any) {
        const validation = this.validationRules[key];
        if (validation) this.validationErrors[key] = validation(value);
    }

    @action
    public setAttribute(key: keyof T, value: any) {
        this.validate(key, value);
        this.attributes[key] = value;
    }

    @action
    public setId(id: string) {
        this._id = id;
    }

    @action
    public setAttributes(attrs: Partial<T>) {
        Object.keys(attrs).forEach((key: keyof T) => {
            this.validate(key, attrs[key]);
            this.setAttribute(key, attrs[key]);
        })
    }

    @computed
    get hasValidationErrors() {
        return !!Object.keys(this.validationErrors).find(key => !!this.validationErrors[key]);
    }

    @action
    public reset() {
        this._id = null;
        Object(this.defaultAttributes).forEach((key: keyof T) => {
            this.attributes[key] = this.defaultAttributes[key];
        });
    }

    @action
    public load(id: string, attrs: Partial<T>) {
        this._id = id;
        this.setAttributes(attrs);

    }
}

//-----------------------------------------------------------------------------------------------------------------------------------------//

export interface IApiModelFetchReq<M extends {}> {
    id: string;
    meta?: M;
}

export interface IApiModelFetchRes<T extends TModelAttributes, M extends {}> {
    id: string,
    attrs: T,
    meta?: M;
}

export interface IApiModelSaveReq<T extends TModelAttributes, M extends {}> {
    id: string;
    attrs: T;
    meta?: M;
}

export interface IApiModelDeleteReq<M extends {}> {
    id: string;
    meta?: M;
}

export interface IApiModelStoreOptions<T> extends IModelStoreOptions<T> {
    updateDebounceInterval: number;
}

export abstract class AbstractApiModelStore<O, T> extends AbstractModelStore<O, T> {

    constructor(owner: O, options: IApiModelStoreOptions<T>) {
        super(owner, options);

        this.validationRules = options.validationRules;
        this.debouncedUpdate = debounce(this.update, options.updateDebounceInterval);
    }

    @observable
    public busy?: boolean;

    @action
    public setBusy = (value: boolean) => {
        this.busy = value;
    }

    public abstract apiFetch<M>(req: IApiModelFetchReq<M>): Promise<IApiModelFetchRes<T, M>>;

    @action
    public fetch(id?: string, meta?: {}) {
        id || (id = this._id);
        if (!typeCheck('String', id)) return;
        this.setBusy(true);

        const promise = this.apiFetch({
            id,
            meta
        });

        promise
            .then(res => runInAction('fetchCompleted', () => {
                this.load(res.id, res.attrs);
                this.setBusy(false);
            }))
            .catch(err => runInAction('fetchFailed', () => {
                this.setError(err);
                this.setBusy(false);
            }));

        return promise;
    }

    public abstract apiCreate<M>(req: IApiModelSaveReq<Partial<T>, M>): Promise<IApiModelFetchRes<T, M>>;

    @action
    public create(id: string, attrs?: Partial<T>, meta?: {}, optimistic: boolean = false) {
        typeCheck('Object', attrs) || (attrs = toJS(this.attributes));
        this.setBusy(true);
        if (optimistic) {
            if (id) this.load(id, attrs);
            else throw Error('Optimistic create requires id argument');
            if (this.hasValidationErrors) return null;
        }

        const promise = this.apiCreate({
            id,
            attrs,
            meta
        });

        promise
            .then(res => runInAction('createCompleted', () => {
                !optimistic && this.load(res.id, res.attrs);
                this.setBusy(false);
            }))
            .catch(err => runInAction('createFailed', () => {
                this.setError(err);
                this.setBusy(false);
            }));

        return promise;
    }

    public abstract apiUpdate<M>(req: IApiModelSaveReq<Partial<T>, M>): Promise<IApiModelFetchRes<T, M>>;

    @action
    public update(id: string, attrs?: Partial<T>, meta?: {}, optimistic: boolean = false) {
        if (!typeCheck('String', id)) return;
        typeCheck('Object', attrs) || (attrs = toJS(this.attributes));
        this.setBusy(true);
        if (optimistic) {
            this.load(id, attrs);
            if (this.hasValidationErrors) return null;
        }

        const promise = this.apiUpdate({
            id,
            attrs,
            meta
        });

        promise
            .then(res => runInAction('updateCompleted', () => {
                !optimistic && this.load(res.id, res.attrs);
                this.setBusy(false);
            }))
            .catch(err => runInAction('updateFailed', () => {
                this.setError(err);
                this.setBusy(false);
            }));

        return promise;
    }

    protected debouncedUpdate: (id: string, attrs?: Partial<T>, meta?: {}, optimistic?: boolean) => (id: string, attrs?: T, meta?: {}, optimistic?: boolean) => Promise<IApiModelFetchRes<T, any>>;


    public abstract apiDelete<M>(req: IApiModelDeleteReq<M>): Promise<any>;

    @action
    public delete(id: string, meta?: {}, optimistic: boolean = false) {
        id || (id = this._id);
        if (!typeCheck('String', id)) return;
        this.setBusy(true);
        optimistic && this.reset();

        const promise = this.apiDelete({
            id,
            meta
        });

        promise
            .then(res => runInAction('deleteCompleted', () => {
                !optimistic && this.reset();
                this.setBusy(false);
            }))
            .catch(err => runInAction('deleteFailed', () => {
                this.setError(err);
                this.setBusy(false);
            }));

        return promise;
    }

    @action
    public setAttribute(key: keyof T, value: any, update = false, debounce = false) {
        super.setAttribute(key, value);
        if (update && !this.validationErrors[key]) {
            const attrs: Partial<T> = {};
            attrs[key] = value;
            if (debounce) this.debouncedUpdate(this._id, attrs, {}, false);
            else this.update(this._id, attrs, {}, false);
        }
    }

    @action
    public setAttributes(attrs: Partial<T>, update = false) {
        super.setAttributes(attrs);
        if (update && !this.hasValidationErrors) {
            this.update(this._id, attrs, {}, true);
        }
    }

}
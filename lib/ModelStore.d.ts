/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { AbstractStore } from './AbstractStore';
export declare type TModelAttributes = {
    [key: string]: any;
};
export declare type TPartial<T extends TModelAttributes> = {
    [P in keyof T]?: T[P];
};
export interface IModelStoreOptions<T> {
    attributes?: T;
}
export declare abstract class AbstractModelStore<O, T extends TModelAttributes> extends AbstractStore<O> {
    constructor(owner: O, options: IModelStoreOptions<T>);
    protected defaultAttributes: T;
    attributes: T;
    protected _id: string;
    readonly id: string;
    get(key: keyof T): T[keyof T];
    setAttribute(key: keyof T, value: any): void;
    setId(id: string): void;
    setAttributes(attrs: TPartial<T>): void;
    reset(): void;
    load(id: string, attrs: TPartial<T>): void;
}
export interface IApiModelFetchReq<M extends {}> {
    id: string;
    meta?: M;
}
export interface IApiModelFetchRes<T extends TModelAttributes, M extends {}> {
    id: string;
    attrs: T;
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
    validationRules: {
        [key: string]: (value: any) => string;
    };
}
export declare abstract class AbstractApiModelStore<O, T> extends AbstractModelStore<O, T> {
    constructor(owner: O, options: IApiModelStoreOptions<T>);
    protected validationRules: {
        [key: string]: (value: any) => string;
    };
    busy?: boolean;
    setBusy: (value: boolean) => void;
    abstract apiFetch<M>(req: IApiModelFetchReq<M>): Promise<IApiModelFetchRes<T, M>>;
    fetch(id?: string, meta?: {}): Promise<IApiModelFetchRes<T, {}>>;
    abstract apiCreate<M>(req: IApiModelSaveReq<TPartial<T>, M>): Promise<IApiModelFetchRes<T, M>>;
    create(id: string, attrs?: TPartial<T>, meta?: {}, optimistic?: boolean): Promise<IApiModelFetchRes<T, {}>>;
    abstract apiUpdate<M>(req: IApiModelSaveReq<TPartial<T>, M>): Promise<IApiModelFetchRes<T, M>>;
    update(id: string, attrs?: TPartial<T>, meta?: {}, optimistic?: boolean): Promise<IApiModelFetchRes<T, {}>>;
    protected debouncedUpdate: (id: string, attrs?: TPartial<T>, meta?: {}, optimistic?: boolean) => (id: string, attrs?: T, meta?: {}, optimistic?: boolean) => Promise<IApiModelFetchRes<T, any>>;
    abstract apiDelete<M>(req: IApiModelDeleteReq<M>): Promise<any>;
    delete(id: string, meta?: {}, optimistic?: boolean): Promise<any>;
    setAttribute(key: keyof T, value: any, update?: boolean, debounce?: boolean): void;
    setAttributes(attrs: TPartial<T>, update?: boolean): void;
}

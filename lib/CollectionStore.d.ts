/// <reference types="bluebird" />
import { IObservableArray } from 'mobx';
import * as Promise from 'bluebird';
import { AbstractStore } from './AbstractStore';
export declare type TCollectionItem = {
    id: string;
    [key: string]: any;
};
export interface ICollectionStoreOptions<T> {
    items: T[];
}
export declare abstract class AbstractCollectionStore<O, T extends TCollectionItem> extends AbstractStore<O> {
    constructor(owner: O, options: ICollectionStoreOptions<T>);
    findItem(id: string): T;
    items: IObservableArray<T>;
    clearItems(): void;
    removeItem(id: string): boolean;
    removeItem(item: T): boolean;
    removeItemAtIndex(index: number): T[];
    removeItems(...items: Array<string | T>): boolean[];
    addItem(item: T, index?: number): void;
    updateItem(id: String, attrs: Partial<TCollectionItem>): T;
    updateItem(item: T, attrs: Partial<TCollectionItem>): T;
    replaceItems(items: T[]): T[];
}
export interface IApiCollectionFetchReq<F extends {}, M extends {}> {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
    filter?: F;
    meta?: M;
}
export interface IApiCollectionProps {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
    count?: number;
}
export interface IApiCollectionFetchRes<T, F, M> extends IApiCollectionFetchReq<F, M> {
    readonly data: T[];
    readonly count: number;
}
export interface IApiCollectionStoreOptions<T> extends ICollectionStoreOptions<T> {
    props: IApiCollectionProps;
    debounceInterval: number;
}
export declare abstract class AbstractApiCollectionStore<O, T extends TCollectionItem, F, M> extends AbstractCollectionStore<O, T> {
    constructor(owner: O, options: IApiCollectionStoreOptions<T>);
    protected abstract defaultFilter: F;
    protected abstract defaultMeta: M;
    filter: F;
    meta: M;
    props: IApiCollectionProps;
    setProps(props: IApiCollectionProps, fetch?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    busy?: boolean;
    setBusy: (value: boolean) => void;
    setProp(key: keyof IApiCollectionProps, value: any, fetch?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    setFilterKey(key: keyof F, value: any, fetch?: boolean, debounce?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    setFilter(filter: F, fetch?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    resetFilter(fetch?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    setMetaKey(key: keyof M, value: any, fetch?: boolean, debounce?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    setMeta(meta: M, fetch?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    resetMeta(fetch?: boolean): Promise<IApiCollectionFetchRes<T, F, M>>;
    abstract apiFetch(req: IApiCollectionFetchReq<F, M>): Promise<IApiCollectionFetchRes<T, F, M>>;
    fetch(): Promise<IApiCollectionFetchRes<T, F, M>>;
    protected debouncedFetch: () => () => Promise<IApiCollectionFetchRes<T, F, M>>;
    reset(): void;
    sort(field?: string, direction?: 'asc' | 'desc'): Promise<IApiCollectionFetchRes<T, F, M>>;
    getPage(page: number): Promise<IApiCollectionFetchRes<T, F, M>>;
    getNextPage(): Promise<IApiCollectionFetchRes<T, F, M>>;
    getPreviousPage(): Promise<IApiCollectionFetchRes<T, F, M>>;
    setPageSize(pageSize: number): Promise<IApiCollectionFetchRes<T, F, M>>;
    load(data: IApiCollectionFetchRes<T, F, M>): void;
}
export interface ISelectableItem extends TCollectionItem {
    __selected: boolean;
}
export declare abstract class AbstractApiSelectableCollectionStore<O, T extends ISelectableItem, F, M> extends AbstractApiCollectionStore<O, T, F, M> {
    toggleItemSelect(id: string): void;
    toggleItemSelect(item: T): void;
    readonly selection: T[];
    load(data: IApiCollectionFetchRes<T, F, M>): void;
}

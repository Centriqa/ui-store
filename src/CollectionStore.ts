import { observable, action, computed, runInAction, IObservableArray, toJS } from 'mobx';
import * as Promise from 'bluebird';
import { typeCheck } from 'type-check';
import { AbstractStore } from './AbstractStore';
import { debounce } from './utils';

//-----------------------------------------------------------------------------------------------------------------------------------------//

export type TCollectionItem = {
    id: string;
    [key: string]: any
};

export type TPartial<T extends TCollectionItem> = {
    [P in keyof T]?: T[P];
}

export interface ICollectionStoreOptions<T> {
    items: T[];
}

/**
 * CollectionStore
 */
export abstract class AbstractCollectionStore<O, T extends TCollectionItem> extends AbstractStore<O> {

    constructor(owner: O, options: ICollectionStoreOptions<T>) {
        super(owner);

        this.items = observable(options.items);
    }

    public findItem(id: string): T {
        return this.items.find(item => item.id === id);
    }

    @observable
    public items: IObservableArray<T>;

    @action
    public clearItems() {
        this.items.clear();
    }

    public removeItem(id: string): boolean;
    public removeItem(item: T): boolean;

    @action
    public removeItem(ref: any): boolean {
        if (typeof ref === 'string') ref = this.findItem(ref as string);
        if (!ref) return false;
        return this.items.remove(ref as T);
    }

    @action
    public removeItemAtIndex(index: number) {
        return this.items.splice(index, 1);
    }


    @action
    public removeItems(...items: Array<string | T>) {
        return runInAction('removeItems', () => {
            return items.map(item => this.removeItem(item as any));
        })
    }

    @action
    public addItem(item: T, index?: number) {
        if (typeCheck('Number', index)) {
            this.items.splice(index, 0, item);
        }
        else {
            this.items.push(item);
        }
    }

    public updateItem(id: String, attrs: Partial<TCollectionItem>): T;
    public updateItem(item: T, attrs: Partial<TCollectionItem>): T;

    @action
    public updateItem(ref: T | String, attrs: T): T {
        if (typeof ref === 'string') ref = this.findItem(ref);
        if (typeof ref === 'object' && ref) {
            runInAction('updateItem', () => {
                Object.keys(attrs).forEach((attr: keyof T) => {
                    (ref as T)[attr] = attrs[attr];
                })
            });
            return ref as T;
        }
        else return null;
    }

    @action
    public replaceItems(items: T[]) {
        return this.items.replace(items);
    }

}

//-----------------------------------------------------------------------------------------------------------------------------------------//

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

/**
 * AbstractApiCollectionStore
 */
export abstract class AbstractApiCollectionStore<O, T extends TCollectionItem, F, M> extends AbstractCollectionStore<O, T> {

    constructor(owner: O, options: IApiCollectionStoreOptions<T>) {
        super(owner, options);
        this.props = observable(options.props);
        this.filter = observable(this.defaultFilter);
        this.meta = observable(this.defaultMeta);
        this.debouncedFetch = debounce(this.fetch, options.debounceInterval);
    }

    protected abstract defaultFilter: F;
    protected abstract defaultMeta: M;
    public filter: F;
    public meta: M;

    public props: IApiCollectionProps;

    @action
    public setProps(props: IApiCollectionProps, fetch: boolean = false) {
        typeCheck('Number', props.page) && this.setProp('page', props.page);
        typeCheck('Number', props.pageSize) && this.setProp('pageSize', props.pageSize);
        typeCheck('String', props.orderBy) && this.setProp('orderBy', props.orderBy);
        typeCheck('String', props.orderDir) && this.setProp('orderDir', props.orderDir);
        typeCheck('Number', props.count) && this.setProp('count', props.count);
        if (fetch) return this.fetch();

        return null;
    }

    @observable
    public busy?: boolean;

    @action
    public setBusy = (value: boolean) => {
        this.busy = value;
    }

    @action
    public setProp(key: keyof IApiCollectionProps, value: any, fetch: boolean = false) {
        this.props[key] = value;
        if (fetch) return this.fetch();

        return null;
    }

    @action
    public setFilterKey(key: keyof F, value: any, fetch: boolean = false, debounce: boolean = false) {
        this.filter[key] = value;
        if (fetch) {
            if (!debounce) return this.fetch();
            else this.debouncedFetch();
        }

        return null;
    }

    @action
    public setFilter(filter: F, fetch: boolean = false): Promise<IApiCollectionFetchRes<T, F, M>> {
        Object.keys(this.defaultFilter).map((key: keyof F) => {
            this.filter[key] = filter[key];
        });
        if (fetch) return this.fetch();

        return null;
    }

    @action
    public resetFilter(fetch: boolean = false): Promise<IApiCollectionFetchRes<T, F, M>> {
        Object.keys(this.defaultFilter).map((key: keyof F) => {
            this.filter[key] = this.defaultFilter[key];
        });
        if (fetch) return this.fetch();
        return null;
    }

    @action
    public setMetaKey(key: keyof M, value: any, fetch: boolean = false, debounce: boolean = false) {
        this.meta[key] = value;
        if (fetch) {
            if (!debounce) return this.fetch();
            else this.debouncedFetch();
        }
        return null;
    }

    @action
    public setMeta(meta: M, fetch: boolean = false): Promise<IApiCollectionFetchRes<T, F, M>> {
        Object.keys(this.defaultMeta).map((key: keyof M) => {
            this.meta[key] = meta[key];
        });
        if (fetch) return this.fetch();

        return null;
    }

    @action
    public resetMeta(fetch: boolean = false): Promise<IApiCollectionFetchRes<T, F, M>> {
        Object.keys(this.defaultMeta).map((key: keyof M) => {
            this.meta[key] = this.defaultMeta[key];
        });
        if (fetch) return this.fetch();

        return null;
    }

    public abstract apiFetch(req: IApiCollectionFetchReq<F, M>): Promise<IApiCollectionFetchRes<T, F, M>>;


    @action
    public fetch(): Promise<IApiCollectionFetchRes<T, F, M>> {
        this.setBusy(true);
        const promise = this
            .apiFetch(Object.assign(toJS(this.props), { filter: toJS(this.filter), meta: toJS(this.meta) }));

        promise
            .then(res => runInAction('fetchCompleted', () => {
                this.load(res);
                this.setBusy(false);
            }))
            .catch(err => runInAction('fetchFailed', () => {
                this.setError(err);
                this.setBusy(false);
            }));

        return promise;
    }

    protected debouncedFetch: () => () => Promise<IApiCollectionFetchRes<T, F, M>>;

    @action
    public reset() {
        this.resetFilter();
        this.resetMeta();
        this.clearItems();
    }

    @action
    public sort(field?: string, direction?: 'asc' | 'desc') {
        field || (field = this.props.orderBy);
        direction || (direction = this.props.orderDir);

        return this.setProps({
            orderBy: field,
            orderDir: direction
        }, true);
    }

    @action
    public getPage(page: number) {
        return this.setProps({
            page,
        }, true);
    }

    @action
    public load(data: IApiCollectionFetchRes<T, F, M>) {
        this.setProps(data);
        this.items.replace(data.data);
    }
}

//-----------------------------------------------------------------------------------------------------------------------------------------//

export interface ISelectableItem extends TCollectionItem {
    __selected: boolean;
}

/**
 * AbstractApiSelectableCollectionStore
 */
export abstract class AbstractApiSelectableCollectionStore<O, T extends ISelectableItem, F, M> extends AbstractApiCollectionStore<O, T, F, M> {

    public toggleItemSelect(id: string): void;
    public toggleItemSelect(item: T): void;

    @action
    public toggleItemSelect(ref: string | T): void {
        if (typeof ref === 'string') {
            const item = this.findItem(ref);
            item.__selected = !item.__selected;
        }
        else if (typeof ref === 'object') {
            ref.__selected = !ref.__selected;
        }
    }

    @computed
    public get selection() {
        return this.items.filter(item => item.__selected);
    }

    @action
    public load(data: IApiCollectionFetchRes<T, F, M>) {
        this.setProps(data);
        this.items.replace(data.data.map(item => {
            item.__selected = false;
            return item;
        }));
    }
}
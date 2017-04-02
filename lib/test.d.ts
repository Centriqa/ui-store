import { AbstractModelStore } from './ModelStore';
export interface IModelAttrs {
    name: string;
    age: number;
}
export declare class Store extends AbstractModelStore<any, IModelAttrs> {
}

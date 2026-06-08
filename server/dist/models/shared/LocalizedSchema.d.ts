import { Schema } from 'mongoose';
export interface ILocalizedString {
    en: string;
    ar?: string;
}
export interface ILocalizedMixed {
    en: any;
    ar?: any;
}
export declare const LocalizedStringSchema: Schema<ILocalizedString, import("mongoose").Model<ILocalizedString, any, any, any, import("mongoose").Document<unknown, any, ILocalizedString, any, {}> & ILocalizedString & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ILocalizedString, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ILocalizedString>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ILocalizedString> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const LocalizedMixedSchema: Schema<ILocalizedMixed, import("mongoose").Model<ILocalizedMixed, any, any, any, import("mongoose").Document<unknown, any, ILocalizedMixed, any, {}> & ILocalizedMixed & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ILocalizedMixed, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ILocalizedMixed>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ILocalizedMixed> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;

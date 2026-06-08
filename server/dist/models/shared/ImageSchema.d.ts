import { Schema } from 'mongoose';
export interface IImage {
    url: string;
    alt?: string | {
        en: string;
        ar?: string;
    };
    title?: string | {
        en: string;
        ar?: string;
    };
    width?: number;
    height?: number;
}
export declare const ImageSchema: Schema<IImage, import("mongoose").Model<IImage, any, any, any, import("mongoose").Document<unknown, any, IImage, any, {}> & IImage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IImage, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<IImage>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<IImage> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;

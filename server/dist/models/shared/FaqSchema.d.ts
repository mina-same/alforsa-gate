import { Schema } from 'mongoose';
import { ILocalizedString, ILocalizedMixed } from './LocalizedSchema';
export interface IFAQ {
    question: ILocalizedString;
    answer: ILocalizedMixed;
}
export declare const FAQSchema: Schema<IFAQ, import("mongoose").Model<IFAQ, any, any, any, import("mongoose").Document<unknown, any, IFAQ, any, {}> & IFAQ & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IFAQ, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<IFAQ>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<IFAQ> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=FaqSchema.d.ts.map
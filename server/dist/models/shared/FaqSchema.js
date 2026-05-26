"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQSchema = void 0;
const mongoose_1 = require("mongoose");
const LocalizedSchema_1 = require("./LocalizedSchema");
exports.FAQSchema = new mongoose_1.Schema({
    question: { type: LocalizedSchema_1.LocalizedStringSchema, required: [true, 'FAQ question is required'] },
    answer: { type: LocalizedSchema_1.LocalizedMixedSchema, required: [true, 'FAQ answer is required'] },
}, { _id: false });
//# sourceMappingURL=FaqSchema.js.map
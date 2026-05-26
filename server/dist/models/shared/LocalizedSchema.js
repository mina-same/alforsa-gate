"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizedMixedSchema = exports.LocalizedStringSchema = void 0;
const mongoose_1 = require("mongoose");
exports.LocalizedStringSchema = new mongoose_1.Schema({
    en: { type: String, required: [true, 'English value is required'], trim: true },
    ar: { type: String, trim: true },
}, { _id: false });
exports.LocalizedMixedSchema = new mongoose_1.Schema({
    en: { type: mongoose_1.Schema.Types.Mixed },
    ar: { type: mongoose_1.Schema.Types.Mixed },
}, { _id: false });
//# sourceMappingURL=LocalizedSchema.js.map
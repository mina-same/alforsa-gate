"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ImageSchema = new mongoose_1.Schema({
    url: { type: String, required: [true, 'Image URL is required'], trim: true },
    alt: { type: mongoose_1.Schema.Types.Mixed },
    title: { type: mongoose_1.Schema.Types.Mixed },
    width: { type: Number },
    height: { type: Number },
}, { _id: false });
//# sourceMappingURL=ImageSchema.js.map
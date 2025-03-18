"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldType = exports.DocumentType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["PDF"] = "pdf";
    DocumentType["CSV"] = "csv";
    DocumentType["JSON"] = "json";
    DocumentType["XML"] = "xml";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var FieldType;
(function (FieldType) {
    FieldType["STRING"] = "string";
    FieldType["NUMBER"] = "number";
    FieldType["BOOLEAN"] = "boolean";
    FieldType["DATE"] = "date";
    FieldType["OBJECT"] = "object";
    FieldType["ARRAY"] = "array";
})(FieldType || (exports.FieldType = FieldType = {}));

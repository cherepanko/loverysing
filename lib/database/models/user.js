"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserSex = exports.UserType = void 0;
/* eslint-disable no-unused-vars */
const typeorm_1 = require("typeorm");
const result_1 = require("./result");
var UserType;
(function (UserType) {
    UserType[UserType["USER"] = 1] = "USER";
    UserType[UserType["ADMIN"] = 2] = "ADMIN";
})(UserType = exports.UserType || (exports.UserType = {}));
var UserSex;
(function (UserSex) {
    UserSex[UserSex["WOMAN"] = 1] = "WOMAN";
    UserSex[UserSex["MAN"] = 2] = "MAN";
    UserSex[UserSex["NULL"] = 3] = "NULL";
})(UserSex = exports.UserSex || (exports.UserSex = {}));
let User = class User extends typeorm_1.BaseEntity {
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    get hasSubscribe() {
        return this.endSubscribeTime > Math.round(Date.now() / 1000);
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserType,
        default: UserType.USER
    }),
    __metadata("design:type", Number)
], User.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserSex
    }),
    __metadata("design:type", Number)
], User.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0
    }),
    __metadata("design:type", Number)
], User.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0
    }),
    __metadata("design:type", Number)
], User.prototype, "endSubscribeTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: false
    }),
    __metadata("design:type", Boolean)
], User.prototype, "isBanned", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => result_1.Result, result => result.user),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", result_1.Result)
], User.prototype, "result", void 0);
User = __decorate([
    (0, typeorm_1.Entity)()
], User);
exports.User = User;

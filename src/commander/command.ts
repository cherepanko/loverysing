/* eslint-disable no-unused-vars */
import { IMessageContextSendOptions, MessageContext } from 'vk-io';
import { Answer, IQuestionParams } from 'vk-io-question';
import { UserType, User } from '../database';

export type SendMessage = (text: string, params?: IMessageContextSendOptions) => Promise<MessageContext>;
export type DebugSendMessage = (text: string, params?: IMessageContextSendOptions) => Promise<MessageContext | null>;
export type SwitchCommand = (tag: string, type?: string) => Promise<any>;

export type ICustomMessageContext = {
    user: User;
    mainMenu: (text?: string) => Promise<MessageContext>;
    ok: SendMessage;
    error: SendMessage;
    warn: SendMessage;
    info: SendMessage;
    debug: DebugSendMessage;
    command: SwitchCommand;
    question: (text: string, params?: IQuestionParams) => Promise<Answer>
}

export type Context = MessageContext & ICustomMessageContext;

export interface ICommandParams {
    trigger?: RegExp;
    handler: (context: Context) => any;
    rights: UserType | UserType[];
    tag?: string;
}

export class Command {
    public trigger?: RegExp;
    public handler: (context: Context) => any;
    public rights: UserType[];
    public tag: string;
    public constructor(params: ICommandParams) {
        this.trigger = params.trigger;
        this.handler = params.handler;
        this.tag = params.tag || '';
        this.rights = Array.isArray(params.rights)
            ? params.rights
            : [params.rights];

        if (!this.rights.includes(UserType.ADMIN))
            this.rights.push(UserType.ADMIN);
    }
}
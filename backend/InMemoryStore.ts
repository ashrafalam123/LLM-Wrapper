import type { Message, Messages } from "./types";

export const EVICTION_TIME = 5 * 60 * 1000;
export const CHECK_TIME = 1 * 60 * 1000;

export class InMemoryStore {
    private static instance : InMemoryStore;

    private clock : NodeJS.Timeout;

    private store : Record<string,{
        messages : Messages,
        evictionTime : number
    }>

    constructor() {
        this.store = {},
        this.clock = setInterval(() => {
            Object.entries(this.store).forEach(([key, {evictionTime}]) => {
                if( evictionTime > Date.now()) {
                    delete this.store[key]
                }
            });
        }, CHECK_TIME)
    }

    private destroy() {
        clearInterval(this.clock);
    }

    public static getInstance() {
        if(!InMemoryStore.instance) {
            InMemoryStore.instance = new InMemoryStore()
        }
        return InMemoryStore.instance;
    }

    add(conversationId : string, message : Message) {
        if(!this.store[conversationId]) {
            this.store[conversationId] = {
                messages : [],
                evictionTime : Date.now() + EVICTION_TIME
            }
        }
        this.store[conversationId].messages?.push(message)
    }

    get(conversationId : string ) : Message[] {
        return InMemoryStore.getInstance().store[conversationId].messages
    }
}
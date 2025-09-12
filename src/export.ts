import Store from "./main.ts"

export default class Export {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
    }
}

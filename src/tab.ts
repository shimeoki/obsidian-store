import { App, PluginSettingTab } from "obsidian"

import Store from "@/main.ts"

// TODO: implement

export default class SettingTab extends PluginSettingTab {
    plugin: Store

    constructor(app: App, plugin: Store) {
        super(app, plugin)
        this.plugin = plugin
    }

    override display() {
        const { containerEl } = this
        containerEl.empty()
    }
}

import Store from "@/main.ts"
import { DEFAULT_SETTINGS, SettingsData } from "@/settings/data.ts"
import { normalizePath } from "obsidian"

export default class Settings {
    private readonly plugin: Store
    public data: SettingsData

    constructor(plugin: Store) {
        this.plugin = plugin
        this.data = Object.assign({}, DEFAULT_SETTINGS)
    }

    public async load() {
        this.data = Object.assign(this.data, await this.plugin.loadData())
    }

    public async save() {
        this.data.folder = normalizePath(this.data.folder)
        if (this.data.folder.length == 0) {
            this.data.folder = DEFAULT_SETTINGS.folder
        }

        this.data.template = normalizePath(this.data.template)
        if (this.data.template.length == 0) {
            this.data.template == DEFAULT_SETTINGS.template
        }

        this.data.pack = normalizePath(this.data.pack)
        if (this.data.pack.length == 0) {
            this.data.pack == DEFAULT_SETTINGS.pack
        }

        this.data.archive.folder = normalizePath(this.data.archive.folder)
        if (this.data.archive.folder.length == 0) {
            this.data.archive.folder == DEFAULT_SETTINGS.archive.folder
        }

        if (this.data.archive.tag.length == 0) {
            this.data.archive.tag == DEFAULT_SETTINGS.archive.tag
        }

        await this.plugin.saveData(this.data)
    }
}

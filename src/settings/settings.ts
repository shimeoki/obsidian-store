import Store from "@/main.ts"
import { DEFAULT_SETTINGS, SettingsData } from "@/settings/data.ts"
import { normalizePath } from "obsidian"

export default class Settings {
    private readonly plugin: Store
    public data: SettingsData

    constructor(plugin: Store) {
        this.plugin = plugin
        this.data = Object.assign({}, DEFAULT_SETTINGS)
        this.data.archive = Object.assign({}, DEFAULT_SETTINGS.archive)
    }

    public async load() {
        const data = await this.plugin.loadData()
        Object.assign(this.data, data)
        Object.assign(this.data.archive, data.archive)
    }

    public async save() {
        if (this.data.folder.length == 0) {
            this.data.folder = DEFAULT_SETTINGS.folder
        } else {
            this.data.folder = normalizePath(this.data.folder)
        }

        if (this.data.template.length == 0) {
            this.data.template = DEFAULT_SETTINGS.template
        } else {
            this.data.template = normalizePath(this.data.template)
        }

        if (this.data.pack.length == 0) {
            this.data.pack = DEFAULT_SETTINGS.pack
        } else {
            this.data.pack = normalizePath(this.data.pack)
        }

        if (this.data.archive.folder.length == 0) {
            this.data.archive.folder = DEFAULT_SETTINGS.archive.folder
        } else {
            this.data.archive.folder = normalizePath(this.data.archive.folder)
        }

        if (this.data.archive.tag.length == 0) {
            this.data.archive.tag = DEFAULT_SETTINGS.archive.tag
        }

        await this.plugin.saveData(this.data)
    }
}

import Store from "@/main.ts"
import { DEFAULT_SETTINGS, SettingsData } from "@/settings/data.ts"
import { normalizePath } from "obsidian"

export default class Settings {
    private readonly plugin: Store
    private data: SettingsData

    constructor(plugin: Store) {
        this.plugin = plugin
        this.data = Object.assign({}, DEFAULT_SETTINGS)
    }

    public async load() {
        this.data = Object.assign(this.data, await this.plugin.loadData())
    }

    public async save() {
        await this.plugin.saveData(this.data)
    }

    public get folder(): string {
        return this.data.folder
    }

    public set folder(path: string) {
        if (path.length == 0) {
            this.data.folder = DEFAULT_SETTINGS.folder
        } else {
            this.data.folder = normalizePath(path)
        }
    }

    public get template() {
        return this.data.template
    }

    public set template(path: string) {
        if (path.length == 0) {
            this.data.template = DEFAULT_SETTINGS.template
        } else {
            this.data.template = normalizePath(path)
        }
    }

    public get pack() {
        return this.data.pack
    }

    public set pack(path: string) {
        if (path.length == 0) {
            this.data.pack = DEFAULT_SETTINGS.pack
        } else {
            this.data.pack = normalizePath(path)
        }
    }
}

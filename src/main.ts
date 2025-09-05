import StoreSettingTab from "./settings.ts"
import { normalizePath, Plugin, SplitDirection, TFile, TFolder } from "obsidian"

interface StoreSettings {
    version: number
    folder: string
    template: string | null
}

const DEFAULT_SETTINGS = {
    version: 0,
    folder: normalizePath("store"),
    template: null,
}

export default class Store extends Plugin {
    settings!: StoreSettings

    override async onload() {
        await this.loadSettings()

        this.addSettingTab(new StoreSettingTab(this.app, this))

        this.addCommands()
    }

    override async onunload() {
        await this.saveSettings()
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        )
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }

    addCommands() {
        this.addCommand({
            id: "store-create-vertical-split",
            name: "Create in a vertical split",
            callback: async () => await this.createSplit("vertical"),
        })

        this.addCommand({
            id: "store-create-horizontal-split",
            name: "Create in a horizontal split",
            callback: async () => await this.createSplit("horizontal"),
        })

        this.addCommand({
            id: "store-create-tab",
            name: "Create in a tab",
            callback: async () => await this.createTab(),
        })
    }

    name(): string {
        return crypto.randomUUID()
    }

    async rename(path: string) {
        const file = this.app.vault.getFileByPath(path)
        if (file == null) {
            return
        }

        const parent = file.parent != null ? file.parent.path : ""
        const newPath = `${parent}/${this.name()}.${file.extension}`

        await this.app.fileManager.renameFile(file, normalizePath(newPath))
    }

    async renameActive() {
        const file = this.app.workspace.getActiveFile()
        if (file == null) {
            return
        }

        await this.rename(file.path)
    }

    async folder(): Promise<TFolder> {
        const vault = this.app.vault
        const folder = this.settings.folder

        const fromVault = vault.getFolderByPath(folder)
        if (fromVault != null) {
            return fromVault
        }

        await vault.createFolder(folder)
        return await this.folder()
    }

    async setFolder(path: string | null) {
        if (path == null || path.length == 0) {
            this.settings.folder = DEFAULT_SETTINGS.folder
        } else {
            this.settings.folder = normalizePath(path)
        }

        await this.saveSettings()
    }

    async create(): Promise<TFile> {
        // note: unofficial api
        return await this.app.fileManager.createNewMarkdownFile(
            await this.folder(),
            this.name(),
            await this.template(),
        )
    }

    async createTab() {
        const file = await this.create()
        const newLeaf = this.app.workspace.getLeaf("tab")
        await newLeaf.openFile(file)
    }

    async createSplit(direction: SplitDirection) {
        const file = await this.create()
        const newLeaf = this.app.workspace.getLeaf("split", direction)
        await newLeaf.openFile(file)
    }

    async template(): Promise<string> {
        const template = this.settings.template
        if (template == null) {
            return ""
        }

        const vault = this.app.vault

        const file = vault.getFileByPath(template)
        if (file == null) {
            this.settings.template = null
            return ""
        }

        return await vault.cachedRead(file)
    }

    async setTemplate(path: string | null) {
        if (path == null || path.length == 0) {
            this.settings.template = DEFAULT_SETTINGS.template
        } else {
            this.settings.template = normalizePath(path)
        }

        await this.saveSettings()
    }
}

import StoreSettingTab from "./settings.ts"
import { normalizePath, Plugin, SplitDirection, TFile, TFolder } from "obsidian"

interface StoreSettings {
    version: number
    folder: string
    template: string
}

const DEFAULT_SETTINGS: StoreSettings = {
    version: 0,
    folder: normalizePath("store"),
    template: "",
}

export default class Store extends Plugin {
    settings!: StoreSettings

    override async onload() {
        await this.loadSettings()

        this.addSettingTab(new StoreSettingTab(this.app, this))

        this.addCommands()
        this.addMenus()
    }

    override async onunload() {
        await this.saveSettings()
    }

    public async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        )
    }

    public async saveSettings() {
        await this.saveData(this.settings)
    }

    public folder(): string {
        return this.settings.folder
    }

    public async setFolder(path: string) {
        if (path.length == 0) {
            this.settings.folder = DEFAULT_SETTINGS.folder
        } else {
            this.settings.folder = normalizePath(path)
        }

        await this.saveSettings()
    }

    public async getFolder(): Promise<TFolder> {
        const vault = this.app.vault
        const path = this.folder()

        const folder = vault.getFolderByPath(path)
        if (folder != null) {
            return folder
        }

        await vault.createFolder(path)
        return await this.getFolder()
    }

    public template(): string {
        return this.settings.template
    }

    public async setTemplate(path: string) {
        if (path.length == 0) {
            this.settings.template = DEFAULT_SETTINGS.template
        } else {
            this.settings.template = normalizePath(path)
        }

        await this.saveSettings()
    }

    public async readTemplate(): Promise<string> {
        const vault = this.app.vault
        const path = this.template()

        if (path.length == 0) {
            return ""
        }

        const file = vault.getFileByPath(path)
        if (file == null) {
            await this.setTemplate("")
            return await this.readTemplate()
        }

        return await vault.cachedRead(file)
    }

    private addCommands() {
        this.addCommand({
            id: "store-create-vertical-split",
            name: "Create new note in a vertical split",
            callback: async () => await this.createSplit("vertical"),
        })

        this.addCommand({
            id: "store-create-horizontal-split",
            name: "Create new note in a horizontal split",
            callback: async () => await this.createSplit("horizontal"),
        })

        this.addCommand({
            id: "store-create-tab",
            name: "Create new note in a tab",
            callback: async () => await this.createTab(),
        })

        this.addCommand({
            id: "store-move-active",
            name: "Move active note to the store",
            callback: async () => await this.moveActive(),
        })
    }

    private addMenus() {
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => {
                menu.addItem((item) => {
                    item
                        .setTitle("Move to the store")
                        .setIcon("folder-input")
                        .onClick(async () => await this.move(file.path))
                })
            }),
        )
    }

    public name(): string {
        return crypto.randomUUID()
    }

    public async move(path: string) {
        const file = this.app.vault.getFileByPath(path)
        if (file == null) {
            return
        }

        const store = await this.getFolder()
        const newPath = `${store.path}/${this.name()}.${file.extension}`

        await this.app.fileManager.renameFile(file, normalizePath(newPath))
    }

    public async moveActive() {
        const file = this.app.workspace.getActiveFile()
        if (file == null) {
            return
        }

        await this.move(file.path)
    }

    public async create(): Promise<TFile> {
        // note: unofficial api
        return await this.app.fileManager.createNewMarkdownFile(
            await this.getFolder(),
            this.name(),
            await this.readTemplate(),
        )
    }

    public async createTab() {
        const file = await this.create()
        const newLeaf = this.app.workspace.getLeaf("tab")
        await newLeaf.openFile(file)
    }

    public async createSplit(direction: SplitDirection) {
        const file = await this.create()
        const newLeaf = this.app.workspace.getLeaf("split", direction)
        await newLeaf.openFile(file)
    }
}

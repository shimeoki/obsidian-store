import Heading from "@/heading.ts"
import Aliases from "@/aliases.ts"
import Packer from "@/packer.ts"
import SettingTab from "@/settings/tab.ts"
import Settings from "@/settings/settings.ts"
import Translation from "@/i18n.ts"
import translation from "@/l10n.ts"
import { normalizePath, Plugin, SplitDirection, TFile, TFolder } from "obsidian"

export default class Store extends Plugin {
    settings!: Settings
    translation!: Translation

    override async onload() {
        this.settings = new Settings(this)
        await this.settings.load()

        this.translation = translation()

        this.addSettingTab(new SettingTab(this.app, this))

        this.addCommands()
        this.addMenus()
        this.addRibbonActions()

        new Heading(this)
        new Aliases(this)
        new Packer(this)
    }

    override async onunload() {
        await this.settings.save()
    }

    public async getFolder(): Promise<TFolder> {
        const vault = this.app.vault
        const path = this.settings.folder

        const folder = vault.getFolderByPath(path)
        if (folder != null) {
            return folder
        }

        await vault.createFolder(path)
        return await this.getFolder()
    }

    public async readTemplate(): Promise<string> {
        const vault = this.app.vault
        const path = this.settings.template

        if (path.length == 0) {
            return ""
        }

        const file = vault.getFileByPath(path)
        if (file == null || file.extension != "md") {
            this.settings.template = ""
            return await this.readTemplate()
        }

        return await vault.cachedRead(file)
    }

    private addCommands() {
        const l10n = this.translation.commands

        this.addCommand({
            id: "store-create-vertical-split",
            name: l10n.createVerticalSplit.name,
            callback: async () => await this.createSplit("vertical"),
        })

        this.addCommand({
            id: "store-create-horizontal-split",
            name: l10n.createHorizontalSplit.name,
            callback: async () => await this.createSplit("horizontal"),
        })

        this.addCommand({
            id: "store-create-tab",
            name: l10n.createTab.name,
            callback: async () => await this.createTab(),
        })

        this.addCommand({
            id: "store-move-active",
            name: l10n.moveActive.name,
            checkCallback: (checking) => {
                // otherwise shows if no file is open.
                // editorCheckCallback doesn't work, because
                // opened images don't count as "in editor"
                if (this.app.workspace.getActiveFile() == null) {
                    return false
                }

                if (this.activeInStore()) {
                    return false
                }

                if (!checking) {
                    this.moveActive()
                }

                return true
            },
        })
    }

    private addMenus() {
        const l10n = this.translation.menus
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => {
                if (file instanceof TFolder || this.inStore(file.path)) {
                    return
                }

                menu.addItem((item) => {
                    item
                        .setTitle(l10n.move.title)
                        .setIcon("folder-input")
                        .onClick(async () => await this.move(file.path))
                })
            }),
        )
    }

    private addRibbonActions() {
        const l10n = this.translation.ribbonActions
        this.addRibbonIcon(
            "folder-pen",
            l10n.new.title,
            async () => await this.createTab(),
        )
    }

    public inStore(path: string): boolean {
        const file = this.app.vault.getFileByPath(path)
        if (file == null) {
            return false
        }

        const parent = file.parent
        if (parent == null || parent.path != this.settings.folder) {
            return false
        }

        return isUUID(file.basename)
    }

    public activeInStore(): boolean {
        const file = this.app.workspace.getActiveFile()
        if (file == null) {
            return false
        }

        return this.inStore(file.path)
    }

    public async move(path: string) {
        const file = this.app.vault.getFileByPath(path)
        if (file == null) {
            return
        }

        const store = await this.getFolder()
        const newPath = `${store.path}/${uuid()}.${file.extension}`

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
            uuid(),
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

function uuid(): string {
    return crypto.randomUUID()
}

function isUUID(name: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(name)
}

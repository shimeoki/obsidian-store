import { normalizePath, Plugin, SplitDirection, TFile, TFolder } from "obsidian"

import Heading from "@/heading.ts"
import Packer from "@/packer.ts"
import Archiver from "@/archiver.ts"
import SettingTab from "@/tab.ts"

import Translation from "@/i18n.ts"
import getTranslation from "@/l10n.ts"

import { defaultSettings, normalize, Settings } from "./settings.ts"

export default class Store extends Plugin {
    settings!: Settings
    translation!: Translation

    override async onload() {
        this.settings = await this.loadSettings()
        this.translation = getTranslation()

        this.addSettingTab(new SettingTab(this.app, this))

        this.addCommands()
        this.addMenus()
        this.addRibbonActions()

        new Heading(this)
        new Packer(this)
        new Archiver(this)
    }

    override async onunload() {
        await this.saveSettings()
    }

    // TODO: more verification
    public async loadSettings() {
        const settings = defaultSettings()
        const data = await this.loadData()

        if (data) {
            Object.assign(settings, data)
            if (data.archive) {
                Object.assign(settings.archive, data.archive)
            }
        }

        return settings
    }

    public async saveSettings() {
        await this.saveData(normalize(this.settings))
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
            id: "create-vertical-split",
            name: l10n.createVerticalSplit.name,
            callback: async () => await this.createSplit("vertical"),
        })

        this.addCommand({
            id: "create-horizontal-split",
            name: l10n.createHorizontalSplit.name,
            callback: async () => await this.createSplit("horizontal"),
        })

        this.addCommand({
            id: "create-tab",
            name: l10n.createTab.name,
            callback: async () => await this.createTab(),
        })

        this.addCommand({
            id: "move-active",
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

        this.addCommand({
            id: "add-aliases",
            name: l10n.addAliasesActive.name,
            checkCallback: (checking) => {
                const file = this.app.workspace.getActiveFile()
                if (!file || this.getAliases(file).length == 0) {
                    return false
                }

                if (!checking) {
                    this.addAliases(file)
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

        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, afile) => {
                if (afile instanceof TFolder) {
                    return
                }

                const file = afile as TFile
                if (this.getAliases(file).length == 0) {
                    return
                }

                menu.addItem((item) => {
                    item
                        .setTitle(l10n.addAliases.title)
                        .setIcon("forward")
                        .onClick(async () => await this.addAliases(file))
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
        const folder = await this.getFolder()
        const path = normalizePath(`${folder.path}/${uuid()}.md`)
        const template = await this.readTemplate()
        return await this.app.vault.create(path, template)
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

    private getAliases(file: TFile): string[] {
        if (!isMarkdown(file)) {
            return []
        }

        const meta = this.app.metadataCache.getFileCache(file)
        if (!meta) {
            return []
        }

        const headings = meta.headings || []
        const aliases: string[] = meta.frontmatter?.aliases || []

        const titles = headings
            .filter((h) => h.level == 1)
            .map((h) => h.heading)
            .filter((h) => h != "" && !aliases.some((a) => a == h))

        if (titles.length == 0) {
            return []
        }

        return aliases.concat(titles)
    }

    public async addAliases(file: TFile) {
        const aliases = this.getAliases(file).filter((a) => a) // non-null
        if (aliases.length == 0) {
            return
        }

        await this.app.fileManager.processFrontMatter(
            file,
            (fm) => fm.aliases = aliases,
        )
    }
}

function uuid(): string {
    return crypto.randomUUID()
}

function isUUID(name: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(name)
}

function isMarkdown(f: TFile): boolean {
    return f.extension == "md"
}

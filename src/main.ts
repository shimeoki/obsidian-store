import {
    Menu,
    normalizePath,
    Notice,
    Plugin,
    SplitDirection,
    TAbstractFile,
    TFile,
    TFolder,
} from "obsidian"

import { defaultSettings, normalize, Settings } from "@/settings.ts"
import SettingTab from "@/tab.ts"
import Translation from "@/i18n.ts"
import getTranslation from "@/l10n.ts"

type Folder = "notes" | "assets" | "archive" | "pack"

type Processor = (data: string) => string

type MenuItemData = {
    title: string
    icon: string
    cb: () => any
}

function uuid(): string {
    return crypto.randomUUID()
}

function isUUID(name: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(name)
}

function isMarkdown(f?: TFile): boolean {
    return f?.extension.toLowerCase() == "md"
}

function heading(title: string): string {
    return `\n\n# ${title}\n\n`
}

function inserter(title: string, offset: number): Processor {
    return replacer(title, offset, offset)
}

function replacer(title: string, start: number, end: number): Processor {
    return (data) => {
        const before = data.substring(0, start).trimEnd()
        const after = data.substring(end).trimStart()
        return (before + heading(title) + after).trim()
    }
}

function shifter(indices: number[]): Processor {
    return (data) => {
        const lines = data.split("\n")
        indices.forEach((i) => lines[i] = "#" + lines[i])
        return lines.join("\n")
    }
}

function combine(...processors: Processor[]): Processor {
    return (data) => {
        processors.forEach((p) => data = p(data))
        return data
    }
}

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
    }

    override async onunload() {
        await this.saveSettings()
    }

    // TODO: more verification
    public async loadSettings() {
        const settings = defaultSettings()

        const data = await this.loadData()
        if (!data) {
            return settings
        }

        Object.assign(settings, data)

        if (data.folders) {
            Object.assign(settings.folders, data.folders)
        }

        if (data.notes) {
            Object.assign(settings.notes, data.notes)
        }

        if (data.assets) {
            Object.assign(settings.assets, data.assets)
        }

        if (data.archive) {
            Object.assign(settings.archive, data.archive)
        }

        return settings
    }

    public async saveSettings() {
        await this.saveData(normalize(this.settings))
    }

    private folderPath(name: Folder): string {
        const folders = this.settings.folders
        switch (name) {
            case "notes":
                return folders.notes
            case "assets":
                return folders.assets
            case "archive":
                return folders.archive
            case "pack":
                return folders.pack
        }
    }

    public async getFolder(name: Folder): Promise<TFolder> {
        const vault = this.app.vault
        const path = this.folderPath(name)

        const folder = vault.getFolderByPath(path)
        if (folder) {
            return folder
        }

        await vault.createFolder(path)
        return vault.getFolderByPath(path)!
    }

    public async readTemplate(): Promise<string> {
        const vault = this.app.vault
        const path = this.settings.notes.template

        if (path.length == 0) {
            return ""
        }

        const file = vault.getFileByPath(path)
        if (file == null || file.extension != "md") {
            this.settings.notes.template = ""
            return await this.readTemplate()
        }

        return await vault.cachedRead(file)
    }

    public inStore(path: string): boolean {
        const file = this.app.vault.getFileByPath(path)
        if (file == null) {
            return false
        }

        const parent = file.parent
        if (parent == null || parent.path != this.settings.folders.notes) {
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

        const store = await this.getFolder("notes")
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
        const folder = await this.getFolder("notes")
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

    private getAllLinkedFiles(file: TFile): TFile[] {
        const cache = this.app.metadataCache

        const meta = cache.getFileCache(file)
        if (!meta) {
            return []
        }

        const files: Set<TFile> = new Set()
        const queue = [{ link: file.path, source: file.path }]

        while (queue.length > 0) {
            const q = queue.shift()
            if (!q) {
                break
            }

            const file = cache.getFirstLinkpathDest(q.link, q.source)
            if (!file || files.has(file)) {
                continue
            }

            files.add(file)

            const meta = cache.getFileCache(file)
            if (!meta) {
                continue
            }

            const embeds = meta.embeds || []
            const links = meta.links || []

            const queued = embeds.concat(links).map((l) => {
                return { link: l.link, source: file.path }
            })

            queue.push(...queued)
        }

        return files.keys().toArray()
    }

    private async getPackFolder(): Promise<TFolder> {
        const vault = this.app.vault
        const path = this.settings.folders.pack

        const folder = vault.getFolderByPath(path)
        if (folder) {
            return folder
        }

        await vault.createFolder(path)
        return await this.getPackFolder()
    }

    private async copy(files: TFile[]) {
        const vault = this.app.vault
        const pack = await this.getPackFolder()

        for (let file of files) {
            const parent = file.parent?.path || ""

            const folder = normalizePath(`${pack.path}/${parent}`)
            if (!vault.getFolderByPath(folder)) {
                await vault.createFolder(folder)
            }

            const packed = normalizePath(`${pack.path}/${file.path}`)
            if (!vault.getFileByPath(packed)) {
                await vault.copy(file, packed)
            }
        }
    }

    private async pack(file: TFile) {
        await this.copy(this.getAllLinkedFiles(file))
    }

    private async getArchiveFolder(): Promise<TFolder> {
        const vault = this.app.vault
        const path = this.settings.folders.archive

        const folder = vault.getFolderByPath(path)
        if (folder != null) {
            return folder
        }

        await vault.createFolder(path)
        return await this.getArchiveFolder()
    }

    // TODO: what if no cache?
    private getTags(f: TFile) {
        const cache = this.app.metadataCache

        const meta = cache.getFileCache(f)
        if (meta) {
            return meta.frontmatter?.tags || []
        }

        return []
    }

    private hasArchiveTag(tags: string[]) {
        const tag = this.settings.archive.tag
        return !!tags.find((t) => t == tag)
    }

    private async archiveNote(f: TFile) {
        if (!this.hasArchiveTag(this.getTags(f))) {
            return false
        }

        const name = `${uuid()}.${f.extension}`
        const folder = await this.getArchiveFolder()

        const fm = this.app.fileManager
        await fm.renameFile(f, normalizePath(`${folder.path}/${name}`))

        return true
    }

    private async archiveNotes(f: TFolder) {
        const queue = [f]
        let count = 0

        while (queue.length > 0) {
            const q = queue.shift()
            if (!q) {
                break
            }

            for (const af of q.children) {
                if (af instanceof TFolder) {
                    queue.push(af)
                } else if (af instanceof TFile) {
                    if (await this.archiveNote(af)) {
                        count++
                    }
                }
            }
        }

        return count
    }

    public async addHeading(file: TFile) {
        const processor = this.headingProcessor(file)
        if (processor) {
            await this.app.vault.process(file, processor)
        }
    }

    private headingProcessor(file: TFile): Processor | null {
        const title = file.basename

        if (this.inStore(file.path) || !isMarkdown(file)) {
            return null
        }

        const meta = this.app.metadataCache.getFileCache(file)
        if (meta == null) {
            return null
        }

        const headings = meta.headings || []
        const titles = headings.filter((h) => h.level == 1)
        const shiftable = !headings.some((h) => h.level == 6)
        const offset = meta.frontmatterPosition?.end.offset || 0

        switch (titles.length) {
            case 0: // insert after the frontmatter if no titles
                return inserter(title, offset)
            case 1: // replace the only title if blank, otherwise skip
                const only = titles[0]
                if (only.heading.length != 0) {
                    return null
                }

                const pos = only.position
                return replacer(title, pos.start.offset, pos.end.offset)
            default: // try to shift all headings to insert the title
                if (!shiftable) {
                    return null
                }

                const indexes = headings.map((h) => h.position.start.line)
                return combine(shifter(indexes), inserter(title, offset))
        }
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

        this.addCommand({
            id: "pack-active",
            name: l10n.packActive.name,
            checkCallback: (checking) => {
                const file = this.app.workspace.getActiveFile()
                if (!file) {
                    return false
                }

                if (!checking) {
                    this.pack(file)
                }

                return true
            },
        })

        this.addCommand({
            id: "archive-active",
            name: l10n.archiveActive.name,
            checkCallback: (checking) => {
                const file = this.app.workspace.getActiveFile()
                if (!file || !this.hasArchiveTag(this.getTags(file))) {
                    return false
                }

                if (!checking) {
                    this.archiveNote(file)
                }

                return true
            },
        })

        this.addCommand({
            id: "add-heading",
            name: l10n.addHeadingActive.name,
            checkCallback: (checking) => {
                const file = this.app.workspace.getActiveFile()
                if (!file || !this.headingProcessor(file)) {
                    return false
                }

                if (!checking) {
                    this.addHeading(file)
                }

                return true
            },
        })
    }

    private addAbstractFileMenu(cb: (menu: Menu, file: TAbstractFile) => any) {
        this.registerEvent(this.app.workspace.on("file-menu", cb))
    }

    private addFileMenu(cb: (menu: Menu, file: TFile) => any) {
        this.addAbstractFileMenu((menu, file) => {
            if (file instanceof TFile) {
                cb(menu, file)
            }
        })
    }

    private addFolderMenu(cb: (menu: Menu, file: TFolder) => any) {
        this.addAbstractFileMenu((menu, file) => {
            if (file instanceof TFolder) {
                cb(menu, file)
            }
        })
    }

    private addMenuItem(menu: Menu, data: MenuItemData) {
        menu.addItem((item) =>
            item
                .setTitle(data.title)
                .setIcon(data.icon)
                .onClick(data.cb)
        )
    }

    private addMenus() {
        const l10n = this.translation.menus

        this.addFileMenu((menu, file) => {
            if (this.inStore(file.path)) {
                return
            }

            this.addMenuItem(menu, {
                title: l10n.move.title,
                icon: "folder-input",
                cb: async () => this.move(file.path),
            })
        })

        this.addFileMenu((menu, file) => {
            if (this.getAliases(file).length == 0) {
                return
            }

            this.addMenuItem(menu, {
                title: l10n.addAliases.title,
                icon: "forward",
                cb: async () => this.addAliases(file),
            })
        })

        this.addFileMenu((menu, file) => {
            this.addMenuItem(menu, {
                title: l10n.pack.title,
                icon: "package",
                cb: async () => this.pack(file),
            })
        })

        this.addFileMenu((menu, file) => {
            if (!this.headingProcessor(file)) {
                return
            }

            this.addMenuItem(menu, {
                title: l10n.addHeading.title,
                icon: "heading-1",
                cb: async () => this.addHeading(file),
            })
        })

        this.addFileMenu((menu, file) => {
            if (!this.hasArchiveTag(this.getTags(file))) {
                return
            }

            this.addMenuItem(menu, {
                title: l10n.archiveNote.title,
                icon: "file-archive",
                cb: async () => this.archiveNote(file),
            })
        })

        this.addFolderMenu((menu, file) => {
            this.addMenuItem(menu, {
                title: l10n.archiveNotes.title,
                icon: "folder-archive",
                cb: async () => {
                    const notice = new Notice(
                        l10n.archiveNotes.folder(file.path),
                        0,
                    )

                    const count = await this.archiveNotes(file)
                    if (count > 0) {
                        notice.setMessage(l10n.archiveNotes.count(count))
                    } else {
                        notice.setMessage(l10n.archiveNotes.empty)
                    }

                    setTimeout(() => notice.hide(), 3000)
                },
            })
        })
    }

    private addRibbonActions() {
        const l10n = this.translation.ribbonActions

        this.addRibbonIcon(
            "folder-pen",
            l10n.new.title,
            async () => await this.createTab(),
        )
    }
}

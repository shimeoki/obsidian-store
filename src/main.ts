import {
    normalizePath,
    Notice,
    Plugin,
    SplitDirection,
    TFile,
    TFolder,
} from "obsidian"

import { defaultSettings, normalize, Settings } from "@/settings.ts"
import SettingTab from "@/tab.ts"
import Translation from "@/i18n.ts"
import getTranslation from "@/l10n.ts"

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

        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, afile) => {
                if (afile instanceof TFolder) {
                    return
                }

                const file = afile as TFile

                menu.addItem((item) => {
                    item
                        .setTitle(l10n.pack.title)
                        .setIcon("package")
                        .onClick(async () => await this.pack(file))
                })
            }),
        )

        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, af) => {
                if (af instanceof TFolder) {
                    menu.addItem((item) => {
                        item
                            .setTitle(l10n.archiveNotes.title)
                            .setIcon("folder-archive")
                            .onClick(async () => {
                                const notice = new Notice(
                                    l10n.archiveNotes.folder(af.path),
                                    0,
                                )

                                const count = await this.archiveNotes(af)

                                if (count > 0) {
                                    notice.setMessage(
                                        l10n.archiveNotes.count(count),
                                    )
                                } else {
                                    notice.setMessage(
                                        l10n.archiveNotes.empty,
                                    )
                                }

                                setTimeout(() => notice.hide(), 3000)
                            })
                    })

                    return
                }

                if (af instanceof TFile) {
                    if (!this.hasArchiveTag(this.getTags(af))) {
                        return
                    }

                    menu.addItem((item) => {
                        item
                            .setTitle(l10n.archiveNote.title)
                            .setIcon("file-archive")
                            .onClick(() => this.archiveNote(af))
                    })
                }
            }),
        )

        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, afile) => {
                if (afile instanceof TFolder) {
                    return
                }

                const file = afile as TFile
                if (!this.headingProcessor(file)) {
                    return
                }

                menu.addItem((item) => {
                    item
                        .setTitle(l10n.addHeading.title)
                        .setIcon("heading-1")
                        .onClick(async () => await this.addHeading(file))
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
        const path = this.settings.pack

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
        const path = this.settings.archive.folder

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

type Processor = (data: string) => string

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

function shifter(indexes: number[]): Processor {
    return (data) => {
        const lines = data.split("\n")
        indexes.forEach((i) => lines[i] = "#" + lines[i])
        return lines.join("\n")
    }
}

function combine(...processors: Processor[]): Processor {
    return (data) => {
        processors.forEach((p) => data = p(data))
        return data
    }
}

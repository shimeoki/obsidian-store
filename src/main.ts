import { normalizePath, Plugin, SplitDirection, TFile, TFolder } from "obsidian"

import { isNote, recurseFiles } from "@/files.ts"
import SettingTab from "@/tab.ts"
import Translation from "@/i18n.ts"
import getTranslation from "@/l10n.ts"
import { TemplatesModal } from "@/modals.ts"
import {
    defaultSettings,
    ExcludeSetting,
    FeatureSetting,
    normalize,
    Settings,
} from "@/settings.ts"

type CheckCallback = (checking: boolean) => boolean
type FileCallback = (f: TFile) => void
type Folder = "notes" | "assets" | "archive" | "pack"
type Processor = (data: string) => string

function uuid(): string {
    return crypto.randomUUID()
}

function isUUID(name: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(name)
}

function isHash(name: string): boolean {
    return /^sha256-[0-9a-f]{64}$/i.test(name)
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

        if (data.templates) {
            Object.assign(settings.templates, data.templates)
        }

        if (data.pack) {
            Object.assign(settings.pack, data.pack)
        }

        if (data.heading) {
            Object.assign(settings.h1, data.heading)
            if (data.heading.exclude) {
                Object.assign(settings.h1.exclude, data.heading.exclude)
            }
        }

        if (data.aliases) {
            Object.assign(settings.aliases, data.aliases)
            if (data.aliases.exclude) {
                Object.assign(settings.aliases.exclude, data.aliases.exclude)
            }
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

    private exclude(file: TFile, exclude: ExcludeSetting): boolean {
        const meta = this.app.metadataCache.getFileCache(file)
        if (!meta || !meta.frontmatter) {
            return false
        }

        for (const prop of exclude.props) {
            if (meta.frontmatter[prop] != undefined) {
                return true
            }
        }

        return false
    }

    private skip(file: TFile, feature: FeatureSetting): boolean {
        if (!feature.enable) {
            return true
        }

        return this.exclude(file, feature.exclude)
    }

    private folderPath(name: Folder): string {
        switch (name) {
            case "notes":
                return this.settings.folder
            case "assets":
                return this.settings.assets.folder
            case "archive":
                return this.settings.archive.folder
            case "pack":
                return this.settings.pack.folder
        }
    }

    private async getFolder(name: Folder): Promise<TFolder> {
        const vault = this.app.vault
        const path = this.folderPath(name)

        const folder = vault.getFolderByPath(path)
        if (folder) {
            return folder
        }

        await vault.createFolder(path)
        return vault.getFolderByPath(path)!
    }

    private inFolder(f: TFile, name: Folder): boolean {
        const parent = f.parent
        return !!parent && parent.path == this.folderPath(name)
    }

    // source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API/Non-cryptographic_uses_of_subtle_crypto#hashing_a_file
    private async fileHash(f: TFile) {
        const fileBuffer = await this.app.vault.readBinary(f)
        const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer)

        const uint8View = new Uint8Array(hashBuffer)
        const hashString = Array.from(uint8View)
            .map((b) => b.toString(16).padStart(2, "0")).join("")

        return `sha256-${hashString}`
    }

    private async moveNote(f: TFile, ty: Folder) {
        let rename = false

        let folder: TFolder
        if (this.inFolder(f, ty)) {
            folder = f.parent!
        } else {
            folder = await this.getFolder(ty)
            rename = true
        }

        let name: string
        if (isUUID(f.basename)) {
            name = f.basename
        } else {
            name = uuid()
            rename = true
        }

        if (rename) {
            const path = normalizePath(`${folder.path}/${name}.${f.extension}`)
            await this.app.fileManager.renameFile(f, path)
        }
    }

    // TODO: path & tag checks
    private async storeNote(f: TFile) {
        await this.moveNote(f, "notes")
    }

    // TODO: path & tag checks
    private async storeAsset(f: TFile) {
        if (!this.settings.assets.enable) {
            return
        }

        let rename = false

        let folder: TFolder
        if (this.inFolder(f, "assets")) {
            folder = f.parent!
        } else {
            folder = await this.getFolder("assets")
            rename = true
        }

        let name: string
        if (isHash(f.basename)) {
            name = f.basename
        } else {
            name = await this.fileHash(f)
            rename = true
        }

        if (!rename) {
            return
        }

        const path = normalizePath(`${folder.path}/${name}.${f.extension}`)

        const old = this.app.vault.getFileByPath(path)
        if (old) {
            await this.app.fileManager.trashFile(old)
        }

        await this.app.fileManager.renameFile(f, path)
    }

    private async addHeading(f: TFile) {
        if (this.skip(f, this.settings.h1)) {
            return
        }

        const processor = this.headingProcessor(f)
        if (processor) {
            await this.app.vault.process(f, processor)
        }
    }

    private headingProcessor(f: TFile): Processor | null {
        const title = f.basename
        if (isUUID(title)) {
            return null
        }

        const meta = this.app.metadataCache.getFileCache(f)
        if (!meta) {
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

    private async addAliases(f: TFile) {
        if (this.skip(f, this.settings.aliases)) {
            return
        }

        const meta = this.app.metadataCache.getFileCache(f)
        if (!meta) {
            return
        }

        let process = false
        const aliases: string[] = meta.frontmatter?.aliases || []

        if (
            !this.settings.h1.enable && !isUUID(f.basename) &&
            !aliases.some((a) => a == f.basename)
        ) {
            aliases.push(f.basename)
            process = true
        }

        const headings = meta.headings || []
        const titles = headings
            .filter((h) => h.level == 1)
            .map((h) => h.heading)
            .filter((h) => h != "" && !aliases.some((a) => a == h))

        if (titles.length > 0) {
            aliases.concat(titles)
            process = true
        }

        if (process) {
            await this.app.fileManager.processFrontMatter(
                f,
                (fm) => fm.aliases = aliases,
            )
        }
    }

    // TODO: what if no cache?
    private getTags(f: TFile): string[] {
        const cache = this.app.metadataCache

        const meta = cache.getFileCache(f)
        if (meta) {
            return meta.frontmatter?.tags || []
        }

        return []
    }

    private hasArchiveTag(tags: string[]): boolean {
        const tag = this.settings.archive.tag
        return !!tags.find((t) => t == tag)
    }

    private async archiveNote(f: TFile): Promise<boolean> {
        if (!this.settings.archive.enable) {
            return false
        }

        if (!this.hasArchiveTag(this.getTags(f))) {
            return false
        }

        await this.moveNote(f, "archive")
        return true
    }

    private async storeFile(f: TFile) {
        if (!isNote(f)) {
            return await this.storeAsset(f)
        }

        await this.addHeading(f)
        await this.addAliases(f)

        const archived = await this.archiveNote(f)
        if (!archived) {
            await this.storeNote(f)
        }
    }

    private async storeFolder(folder: TFolder) {
        await recurseFiles(folder, async (f) => await this.storeFile(f))
    }

    private async read(path: string): Promise<string> {
        const f = this.app.vault.getFileByPath(path)
        if (!f || !isNote(f)) {
            return ""
        }

        return await this.app.vault.cachedRead(f)
    }

    private async createFile(template: string): Promise<TFile> {
        const folder = await this.getFolder("notes")
        const path = normalizePath(`${folder.path}/${uuid()}.md`)
        return await this.app.vault.create(path, template)
    }

    private async openTab(f: TFile, current: boolean) {
        await this.app.workspace.getLeaf(!current).openFile(f)
    }

    private async openSplit(f: TFile, direction: SplitDirection) {
        await this.app.workspace.getLeaf("split", direction).openFile(f)
    }

    private async createFrom(path: string): Promise<TFile> {
        const template = await this.read(path)
        return await this.createFile(template)
    }

    private selectTemplate(cb: (f: TFile) => Promise<void>) {
        new TemplatesModal(
            this.app,
            this.settings.templates.folder,
            async (f) => await cb(await this.createFrom(f.path)),
        ).open()
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

    private async copy(files: TFile[]) {
        const vault = this.app.vault
        const pack = await this.getFolder("pack")

        for (const f of files) {
            const parent = f.parent?.path || ""

            const folder = normalizePath(`${pack.path}/${parent}`)
            if (!vault.getFolderByPath(folder)) {
                await vault.createFolder(folder)
            }

            const packed = normalizePath(`${pack.path}/${f.path}`)
            if (!vault.getFileByPath(packed)) {
                await vault.copy(f, packed)
            }
        }
    }

    private async pack(file: TFile) {
        await this.copy(this.getAllLinkedFiles(file))
    }

    private activeFileCommand(cb: FileCallback): CheckCallback {
        return (checking) => {
            const f = this.app.workspace.getActiveFile()
            if (!f) {
                return false
            }

            if (!checking) {
                cb(f)
            }

            return true
        }
    }

    // TODO: l10n
    private addCommands() {
        this.addCommand({
            id: "create-new-tab-default",
            name: "Create new note in new tab (default template)",
            callback: async () =>
                await this.openTab(
                    await this.createFrom(this.settings.templates.default),
                    false,
                ),
        })

        this.addCommand({
            id: "create-current-tab-default",
            name: "Create new note in current tab (default template)",
            callback: async () =>
                await this.openTab(
                    await this.createFrom(this.settings.templates.default),
                    true,
                ),
        })

        this.addCommand({
            id: "create-vertical-split-default",
            name: "Create new note in vertical split (default template)",
            callback: async () =>
                await this.openSplit(
                    await this.createFrom(this.settings.templates.default),
                    "vertical",
                ),
        })

        this.addCommand({
            id: "create-horizontal-split-default",
            name: "Create new note in horizontal split (default template)",
            callback: async () =>
                await this.openSplit(
                    await this.createFrom(this.settings.templates.default),
                    "horizontal",
                ),
        })

        this.addCommand({
            id: "create-new-tab-select",
            name: "Create new note in new tab (select template)",
            callback: () =>
                this.selectTemplate(async (f) => await this.openTab(f, false)),
        })

        this.addCommand({
            id: "create-current-tab-select",
            name: "Create new note in current tab (select template)",
            callback: () =>
                this.selectTemplate(async (f) => await this.openTab(f, true)),
        })

        this.addCommand({
            id: "create-vertical-split-select",
            name: "Create new note in vertical split (select template)",
            callback: () =>
                this.selectTemplate(async (f) =>
                    await this.openSplit(f, "vertical")
                ),
        })

        this.addCommand({
            id: "create-horizontal-split-select",
            name: "Create new note in horizontal split (select template)",
            callback: () =>
                this.selectTemplate(async (f) =>
                    await this.openSplit(f, "horizontal")
                ),
        })

        // editorCheckCallback doesn't work, because
        // opened images don't count as "in editor"

        this.addCommand({
            id: "store-current",
            name: "Store current file",
            checkCallback: this.activeFileCommand((f) => this.storeFile(f)),
        })

        this.addCommand({
            id: "pack-current",
            name: "Pack current file",
            checkCallback: this.activeFileCommand((f) => this.pack(f)),
        })
    }

    // TODO: l10n
    private addMenus() {
        this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
            if (file instanceof TFile) {
                menu.addItem((item) =>
                    item.setTitle("Store").setIcon("store")
                        .onClick(() => this.storeFile(file))
                ).addItem((item) =>
                    item.setTitle("Pack").setIcon("package")
                        .onClick(() => this.pack(file))
                )
            } else if (file instanceof TFolder) {
                menu.addItem((item) =>
                    item.setTitle("Store").setIcon("store")
                        .onClick(() => this.storeFolder(file))
                )
            }
        }))
    }
}

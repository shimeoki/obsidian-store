import Store from "@/main.ts"
import { normalizePath, Notice, TFile, TFolder } from "obsidian"

export default class Archiver {
    private readonly plugin: Store
    private readonly translation

    constructor(plugin: Store) {
        this.plugin = plugin
        this.translation = plugin.translation
        this.addMenus()
        this.addCommands()
    }

    private async folder(): Promise<TFolder> {
        const vault = this.plugin.app.vault
        const path = this.plugin.settings.data.archive.folder

        const folder = vault.getFolderByPath(path)
        if (folder != null) {
            return folder
        }

        await vault.createFolder(path)
        return await this.folder()
    }

    // TODO: what if no cache?
    private getTags(f: TFile) {
        const cache = this.plugin.app.metadataCache

        const meta = cache.getFileCache(f)
        if (meta) {
            return meta.frontmatter?.tags || []
        }

        return []
    }

    private hasTag(tags: string[]) {
        const tag = this.plugin.settings.data.archive.tag
        return !!tags.find((t) => t == tag)
    }

    private async archiveNote(f: TFile) {
        if (!this.hasTag(this.getTags(f))) {
            return false
        }

        // FIXME: don't just call crypto uuid here
        const name = `${crypto.randomUUID()}.${f.extension}`
        const folder = await this.folder()

        const fm = this.plugin.app.fileManager
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

    private addMenus() {
        const plugin = this.plugin
        const l10n = this.translation.menus
        plugin.registerEvent(
            plugin.app.workspace.on("file-menu", (menu, af) => {
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
                    if (!this.hasTag(this.getTags(af))) {
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
    }

    private addCommands() {
        const plugin = this.plugin
        const l10n = this.translation.commands
        plugin.addCommand({
            id: "store-archive-active",
            name: l10n.archiveActive.name,
            checkCallback: (checking) => {
                const file = plugin.app.workspace.getActiveFile()
                if (!file || !this.hasTag(this.getTags(file))) {
                    return false
                }

                if (!checking) {
                    this.archiveNote(file)
                }

                return true
            },
        })
    }
}

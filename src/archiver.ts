import Store from "@/main.ts"
import { normalizePath, TFile, TFolder } from "obsidian"

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

    private async getTags(f: TFile): Promise<string[]> {
        const cache = this.plugin.app.metadataCache
        const fm = this.plugin.app.fileManager

        const meta = cache.getFileCache(f)
        if (meta) {
            return meta.frontmatter?.tags || []
        }

        let tags: string[] = []
        try {
            await fm.processFrontMatter(f, (front) => {
                tags = front?.tags || []
            })
        } catch {
            return []
        }

        return tags
    }

    private async hasTag(f: TFile): Promise<boolean> {
        const tag = this.plugin.settings.data.archive.tag
        const tags = await this.getTags(f)
        return !!tags.find((t) => t == tag)
    }

    private async archiveFile(f: TFile) {
        const fm = this.plugin.app.fileManager
        const folder = await this.folder()

        if (!(await this.hasTag(f))) {
            return
        }

        // FIXME: don't just call crypto uuid here
        const name = `${crypto.randomUUID()}.${f.extension}`
        await fm.renameFile(f, normalizePath(`${folder.path}/${name}`))
    }

    private async archiveFolder(f: TFolder) {
        const queue = [f]

        while (queue.length > 0) {
            const q = queue.shift()
            if (!q) {
                break
            }

            for (const af of q.children) {
                if (af instanceof TFolder) {
                    queue.push(af)
                } else if (af instanceof TFile) {
                    await this.archiveFile(af)
                }
            }
        }
    }

    private addMenus() {
        const plugin = this.plugin
        plugin.registerEvent(
            plugin.app.workspace.on("file-menu", (menu, file) => {
                if (!(file instanceof TFolder)) {
                    return
                }

                menu.addItem((item) => {
                    item
                        .setTitle("Archive")
                        .setIcon("archive")
                        .onClick(async () => await this.archiveFolder(file))
                })
            }),
        )
    }

    private addCommands() {
        const plugin = this.plugin
        plugin.addCommand({
            id: "store-archive",
            name: "Archive current note",
            // TODO: don't show on no tag
            checkCallback: (checking) => {
                const file = plugin.app.workspace.getActiveFile()
                if (!file) {
                    return false
                }

                if (!checking) {
                    this.archiveFile(file)
                }

                return true
            },
        })
    }
}

import Store from "@/main.ts"
import { normalizePath, TFile, TFolder } from "obsidian"

export default class Archiver {
    private readonly plugin: Store
    private readonly translation

    constructor(plugin: Store) {
        this.plugin = plugin
        this.translation = plugin.translation
        this.addMenus()
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

    private async archive(folder: TFolder) {
        const cache = this.plugin.app.metadataCache
        const fm = this.plugin.app.fileManager
        const tag = this.plugin.settings.data.archive.tag
        const archive = await this.folder()

        const queue = [folder]

        while (queue.length > 0) {
            const q = queue.shift()
            if (!q) {
                break
            }

            for (const f of q.children) {
                if (f instanceof TFolder) {
                    queue.push(f)
                    continue
                }

                if (!(f instanceof TFile)) {
                    continue
                }

                const meta = cache.getFileCache(f)
                if (!meta) {
                    // FIXME: don't skip if no cache
                    continue
                }

                const tags: string[] = meta.frontmatter?.tags || []
                if (!tags.find((t) => t == tag)) {
                    continue
                }

                // FIXME: don't just call crypto uuid here
                const name = `${crypto.randomUUID()}.${f.extension}`
                const path = normalizePath(`${archive.path}/${name}`)
                await fm.renameFile(f, path)
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
                        .onClick(async () => await this.archive(file))
                })
            }),
        )
    }
}

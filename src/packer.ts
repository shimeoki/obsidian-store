import Store from "@/main.ts"
import { TFile, TFolder } from "obsidian"

export default class Packer {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
        this.addCommands()
    }

    private allLinkedFiles(file: TFile): TFile[] {
        const cache = this.plugin.app.metadataCache

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

    private async getFolder(): Promise<TFolder> {
        const vault = this.plugin.app.vault
        const path = this.plugin.settings.pack

        const folder = vault.getFolderByPath(path)
        if (folder) {
            return folder
        }

        await vault.createFolder(path)
        return await this.getFolder()
    }

    private addCommands() {
        const plugin = this.plugin
        plugin.addCommand({
            id: "store-export-active",
            name: "Export active",
            callback: () => {
                const file = plugin.app.workspace.getActiveFile()
                if (!file) {
                    return
                }

                const files = this.allLinkedFiles(file)
                console.log(files.map((f) => f.path))
            },
        })
    }
}

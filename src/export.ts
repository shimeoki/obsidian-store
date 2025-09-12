import Store from "@/main.ts"
import { TFile } from "obsidian"

export default class Export {
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
        files.add(file)

        const links = meta.links || []
        const queue = links.map((l) => {
            return { link: l.link, source: file.path }
        })

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

            const links = meta.links || []
            const next = links.map((l) => {
                return { link: l.link, source: file.path }
            })

            queue.push(...next)
        }

        return files.keys().toArray()
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

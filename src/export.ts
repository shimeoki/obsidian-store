import Store from "@/main.ts"
import { TFile } from "obsidian"

export default class Export {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
    }

    private allLinkedFiles(file: TFile): TFile[] {
        const cache = this.plugin.app.metadataCache

        const meta = cache.getFileCache(file)
        if (!meta) {
            return []
        }

        const files = [file]
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
            if (!file) {
                continue
            }

            files.push(file)

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

        return files
    }
}

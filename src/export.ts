import Store from "@/main.ts"
import { TFile } from "obsidian"

export default class Export {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
    }

    private allLinkedFiles(file: TFile): TFile[] {
        const vault = this.plugin.app.vault
        const cache = this.plugin.app.metadataCache

        const meta = cache.getFileCache(file)
        if (!meta) {
            return []
        }

        const files = [file]
        const links = meta.links || []
        const queue = links.map((l) => l.link)

        while (queue.length > 0) {
            const link = queue.shift() || ""

            const file = vault.getFileByPath(link)
            if (!file) {
                continue
            }

            files.push(file)

            const meta = cache.getFileCache(file)
            if (!meta) {
                continue
            }

            queue.push(...(meta.links || []).map((l) => l.link))
        }

        return files
    }
}

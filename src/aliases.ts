import Store from "@/main.ts"
import { TFile } from "obsidian"

function isMarkdown(f: TFile): boolean {
    return f.extension == "md"
}

export default class Aliases {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
    }

    public async add(file: TFile) {
        const app = this.plugin.app

        if (!isMarkdown(file)) {
            return
        }

        const meta = app.metadataCache.getFileCache(file)
        if (meta == null) {
            return
        }

        const headings = meta.headings || []
        const aliases: string[] = meta.frontmatter?.aliases || []

        const titles = headings
            .filter((h) => h.level == 1)
            .map((h) => h.heading.trim())
            .filter((h) => h != "" && !aliases.some((a) => a == h))

        if (titles.length == 0) {
            return
        }

        aliases.push(...titles)
        await app.fileManager.processFrontMatter(file, (fm) => {
            fm.aliases = aliases
        })
    }
}

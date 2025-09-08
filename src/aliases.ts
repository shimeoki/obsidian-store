import Store from "@/main.ts"
import { TFile } from "obsidian"

function isMarkdown(f: TFile): boolean {
    return f.extension == "md"
}

export default class Aliases {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
        this.addCommands()
    }

    private aliases(file: TFile): string[] {
        const app = this.plugin.app

        if (!isMarkdown(file)) {
            return []
        }

        const meta = app.metadataCache.getFileCache(file)
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

    public async add(file: TFile) {
        const aliases = this.aliases(file).filter((a) => a) // non-null
        if (aliases.length == 0) {
            return
        }

        await this.plugin.app.fileManager.processFrontMatter(
            file,
            (fm) => fm.aliases = aliases,
        )
    }

    private addCommands() {
        const plugin = this.plugin
        plugin.addCommand({
            id: "store-add-aliases",
            name: "Add aliases",
            checkCallback: (checking) => {
                const file = plugin.app.workspace.getActiveFile()
                if (!file || this.aliases(file).length == 0) {
                    return false
                }

                if (!checking) {
                    this.add(file)
                }

                return true
            },
        })
    }
}

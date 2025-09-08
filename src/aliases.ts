import Store from "@/main.ts"
import { TFile, TFolder } from "obsidian"

function isMarkdown(f: TFile): boolean {
    return f.extension == "md"
}

export default class Aliases {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
        this.addCommands()
        this.addMenus()
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

    private addMenus() {
        const plugin = this.plugin
        plugin.registerEvent(
            plugin.app.workspace.on("file-menu", (menu, afile) => {
                if (afile instanceof TFolder) {
                    return
                }

                const file = afile as TFile
                if (this.aliases(file).length == 0) {
                    return
                }

                menu.addItem((item) => {
                    item
                        .setTitle("Add aliases")
                        .setIcon("forward")
                        .onClick(async () => await this.add(file))
                })
            }),
        )
    }
}

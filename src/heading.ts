import Store from "@/main.ts"
import { TFile, TFolder } from "obsidian"

type Processor = (data: string) => string

function heading(title: string): string {
    return `\n\n# ${title}\n\n`
}

function inserter(title: string, offset: number): Processor {
    return replacer(title, offset, offset)
}

function replacer(title: string, start: number, end: number): Processor {
    return (data) => {
        const before = data.substring(0, start).trimEnd()
        const after = data.substring(end).trimStart()
        return (before + heading(title) + after).trim()
    }
}

function shifter(indexes: number[]): Processor {
    return (data) => {
        const lines = data.split("\n")
        indexes.forEach((i) => lines[i] = "#" + lines[i])
        return lines.join("\n")
    }
}

function combine(...processors: Processor[]): Processor {
    return (data) => {
        processors.forEach((p) => data = p(data))
        return data
    }
}

function isMarkdown(f: TFile): boolean {
    return f.extension == "md"
}

export default class Heading {
    private readonly plugin: Store

    constructor(plugin: Store) {
        this.plugin = plugin
        this.addCommands()
        this.addMenus()
    }

    public async add(file: TFile) {
        const processor = this.processor(file)
        if (processor) {
            await this.plugin.app.vault.process(file, processor)
        }
    }

    private processor(file: TFile): Processor | null {
        const plugin = this.plugin
        const title = file.basename

        if (plugin.inStore(file.path) || !isMarkdown(file)) {
            return null
        }

        const meta = plugin.app.metadataCache.getFileCache(file)
        if (meta == null) {
            return null
        }

        const headings = meta.headings || []
        const titles = headings.filter((h) => h.level == 1)
        const shiftable = !headings.some((h) => h.level == 6)
        const offset = meta.frontmatterPosition?.end.offset || 0

        switch (titles.length) {
            case 0: // insert after the frontmatter if no titles
                return inserter(title, offset)
            case 1: // replace the only title if blank, otherwise skip
                const only = titles[0]
                if (only.heading.length != 0) {
                    return null
                }

                const pos = only.position
                return replacer(title, pos.start.offset, pos.end.offset)
            default: // try to shift all headings to insert the title
                if (!shiftable) {
                    return null
                }

                const indexes = headings.map((h) => h.position.start.line)
                return combine(shifter(indexes), inserter(title, offset))
        }
    }

    private addCommands() {
        const plugin = this.plugin
        const l10n = this.plugin.translation.commands
        plugin.addCommand({
            id: "add-heading",
            name: l10n.addHeadingActive.name,
            checkCallback: (checking) => {
                const file = plugin.app.workspace.getActiveFile()
                if (!file || !this.processor(file)) {
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
        const l10n = this.plugin.translation.menus
        plugin.registerEvent(
            plugin.app.workspace.on("file-menu", (menu, afile) => {
                if (afile instanceof TFolder) {
                    return
                }

                const file = afile as TFile
                if (!this.processor(file)) {
                    return
                }

                menu.addItem((item) => {
                    item
                        .setTitle(l10n.addHeading.title)
                        .setIcon("heading-1")
                        .onClick(async () => await this.add(file))
                })
            }),
        )
    }
}

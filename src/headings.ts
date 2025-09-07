import Store from "./main.ts"
import { HeadingCache, TFile, TFolder } from "obsidian"

enum Route {
    SKIP,
    INSERT,
    SHIFT,
}

type Processor = (data: string) => string

interface Data {
    route: Route
    file: TFile
    positions: number[]
    offset: number
    only: HeadingCache | null
}

function route(data: Data, headings: HeadingCache[], shiftable: boolean) {
    switch (headings.length) {
        case 0:
            break
        case 1:
            data.only = headings[0]
            if (data.only.heading.length != 0) {
                data.route = Route.SKIP
            }

            break
        default:
            if (shiftable) {
                data.route = Route.SHIFT
            } else {
                data.route = Route.SKIP
            }

            break
    }
}

function processor(d: Data): Processor | null {
    if (d.route == Route.SKIP) {
        return null
    }

    const h = heading(d.file)
    const insert = inserter(h, d.offset)

    if (d.route == Route.SHIFT) {
        // shift and then insert
        return (data) => insert(shifter(d.positions)(data))
    }

    if (d.only == null) {
        return insert
    }

    return replacer(h, d.only)
}

function shifter(positions: number[]): Processor {
    return (data) => {
        let result = ""

        let prev = 0
        positions.forEach((next) => {
            result += data.substring(prev, next)
            result += "#"
            prev = next
        })

        result += data.substring(prev) // until the end
        return result
    }
}

function inserter(heading: string, offset: number): Processor {
    return (data) => {
        return (
            data.substring(0, offset).trim() +
            heading +
            data.substring(offset).trim()
        ).trim()
    }
}

function replacer(heading: string, c: HeadingCache): Processor {
    const pos = c.position
    return (data) => {
        return (
            data.substring(0, pos.start.offset).trim() +
            heading +
            data.substring(pos.end.offset).trim()
        ).trim()
    }
}

function heading(f: TFile): string {
    return `\n\n# ${f.basename}\n\n`
}

function isMarkdown(f: TFile): boolean {
    return f.extension == "md"
}

function warn(f: TFile, msg: string) {
    console.warn(`store: headings: ${f.path}: ${msg}`)
}

export default class Headings {
    private readonly store: Store

    constructor(store: Store) {
        this.store = store
        this.addCommands()
        this.addMenus()
    }

    public fromFile(file: TFile | null): Data | null {
        if (file == null || !isMarkdown(file)) {
            return null
        }

        const meta = this.store.app.metadataCache.getFileCache(file)
        if (meta == null) {
            warn(file, "cache is empty")
            return null
        }

        const data: Data = {
            route: Route.INSERT,
            file: file,
            positions: [],
            offset: meta.frontmatterPosition?.end.offset || 0,
            only: null,
        }

        let shiftable = true
        const headings = (meta.headings || []).filter((h) => {
            if (h.level == 6) {
                shiftable = false
            }

            data.positions.push(h.position.start.offset)

            return h.level == 1
        })

        route(data, headings, shiftable)
        return data
    }

    public async process(data: Data) {
        const p = processor(data)
        if (p == null) {
            return
        }

        await this.store.app.vault.process(data.file, p)
    }

    private addCommands() {
        const store = this.store
        store.addCommand({
            id: "store-add-heading-in-active",
            name: "Add a heading in active note",
            checkCallback: (checking) => {
                const file = store.app.workspace.getActiveFile()
                if (file == null || store.activeInStore()) {
                    return false
                }

                const data = this.fromFile(file)
                if (data == null || data.route == Route.SKIP) {
                    return false
                }

                if (!checking) {
                    this.process(data)
                }

                return true
            },
        })
    }

    private addMenus() {
        const store = this.store
        store.registerEvent(
            store.app.workspace.on("file-menu", (menu, afile) => {
                if (afile instanceof TFolder || store.inStore(afile.path)) {
                    return
                }

                const file = afile as TFile

                const data = this.fromFile(file)
                if (data == null || data.route == Route.SKIP) {
                    return
                }

                menu.addItem((item) => {
                    item
                        .setTitle("Add a heading")
                        .setIcon("heading-1")
                        .onClick(async () => await this.process(data))
                })
            }),
        )
    }
}

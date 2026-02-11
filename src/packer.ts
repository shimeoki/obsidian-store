import Store from "@/main.ts"
import { normalizePath, TFile, TFolder } from "obsidian"

export default class Packer {
    private readonly plugin: Store
    private readonly translation

    constructor(plugin: Store) {
        this.plugin = plugin
        this.translation = plugin.translation
        this.addCommands()
        this.addMenus()
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
        const path = this.plugin.settings.data.pack

        const folder = vault.getFolderByPath(path)
        if (folder) {
            return folder
        }

        await vault.createFolder(path)
        return await this.getFolder()
    }

    private async copy(files: TFile[]) {
        const vault = this.plugin.app.vault
        const pack = await this.getFolder()

        for (let file of files) {
            const parent = file.parent?.path || ""

            const folder = normalizePath(`${pack.path}/${parent}`)
            if (!vault.getFolderByPath(folder)) {
                await vault.createFolder(folder)
            }

            const packed = normalizePath(`${pack.path}/${file.path}`)
            if (!vault.getFileByPath(packed)) {
                await vault.copy(file, packed)
            }
        }
    }

    private async pack(file: TFile) {
        await this.copy(this.allLinkedFiles(file))
    }

    private addCommands() {
        const l10n = this.translation.commands
        const plugin = this.plugin
        plugin.addCommand({
            id: "pack-active",
            name: l10n.packActive.name,
            checkCallback: (checking) => {
                const file = plugin.app.workspace.getActiveFile()
                if (!file) {
                    return false
                }

                if (!checking) {
                    this.pack(file)
                }

                return true
            },
        })
    }

    private addMenus() {
        const plugin = this.plugin
        const l10n = this.translation.menus
        plugin.registerEvent(
            plugin.app.workspace.on("file-menu", (menu, afile) => {
                if (afile instanceof TFolder) {
                    return
                }

                const file = afile as TFile

                menu.addItem((item) => {
                    item
                        .setTitle(l10n.pack.title)
                        .setIcon("package")
                        .onClick(async () => await this.pack(file))
                })
            }),
        )
    }
}

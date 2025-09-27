import Store from "@/main.ts"
import { normalizePath, TFile, TFolder } from "obsidian"

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

    private async copy(files: TFile[]) {
        const pack = await this.getFolder()
        if (pack.getFileCount() != 0) {
            // TODO: send notice
            return
        }

        const vault = this.plugin.app.vault

        for (let file of files) {
            const parent = file.parent?.path || ""

            const folder = normalizePath(`${pack.path}/${parent}`)
            if (!vault.getFolderByPath(folder)) {
                await vault.createFolder(folder)
            }

            const packPath = normalizePath(`${pack.path}/${file.path}`)
            await vault.copy(file, packPath)
        }
    }

    private addCommands() {
        const plugin = this.plugin
        plugin.addCommand({
            id: "store-pack-active",
            name: "Pack active",
            checkCallback: (checking) => {
                const file = plugin.app.workspace.getActiveFile()
                if (!file) {
                    return false
                }

                if (!checking) {
                    this.copy(this.allLinkedFiles(file))
                }

                return true
            },
        })
    }
}

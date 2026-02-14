import { App, FuzzySuggestModal, normalizePath, TFile, TFolder } from "obsidian"
import { isMarkdown } from "./main"

export class TemplatesModal extends FuzzySuggestModal<TFile> {
    private readonly templates: string
    private readonly cb: (file: TFile) => void

    constructor(app: App, templates: string, cb: (file: TFile) => void) {
        super(app)
        this.templates = normalizePath(templates)
        this.cb = cb
    }

    override getItems(): TFile[] {
        const folder = this.app.vault.getFolderByPath(this.templates)
        if (!folder) {
            return []
        }

        const files: TFile[] = []

        const queue = [folder]
        while (queue.length > 0) {
            const f = queue.shift()
            if (!f) {
                break
            }

            for (const file of f.children) {
                if (file instanceof TFolder) {
                    queue.push(file)
                } else if (file instanceof TFile) {
                    if (!isMarkdown(file)) {
                        continue
                    }

                    files.push(file)
                }
            }
        }

        return files
    }

    override getItemText(item: TFile): string {
        if (!item.parent || this.templates == "/") {
            return item.basename
        }

        const path = item.path
        return path.slice(this.templates.length + 1, path.length - 3)
    }

    override onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent) {
        this.cb(item)
    }
}

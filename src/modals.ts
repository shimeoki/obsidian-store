import { App, FuzzySuggestModal, normalizePath, TFile } from "obsidian"
import { forEachFile, isNote } from "@/files.ts"

export class TemplatesModal extends FuzzySuggestModal<TFile> {
    private readonly templates: string
    private readonly cb: (f: TFile) => void

    constructor(app: App, templates: string, cb: (f: TFile) => void) {
        super(app)
        this.templates = normalizePath(templates)
        this.cb = cb
    }

    override getItems(): TFile[] {
        const notes: TFile[] = []

        const folder = this.app.vault.getFolderByPath(this.templates)
        if (folder) {
            forEachFile(folder, (f) => isNote(f) && notes.push(f))
        }

        return notes
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

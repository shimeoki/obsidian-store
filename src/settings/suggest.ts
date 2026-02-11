import { AbstractInputSuggest, TAbstractFile, TFile, TFolder } from "obsidian"

abstract class PathSuggest<T extends TAbstractFile>
    extends AbstractInputSuggest<T> {
    protected abstract items(): T[]

    protected override getSuggestions(query: string): T[] | Promise<T[]> {
        const items = this.items()
        const match = query.toLowerCase()
        return items.filter((item) => item.path.toLowerCase().includes(match))
    }

    override renderSuggestion(value: T, el: HTMLElement) {
        const query = this.getValue().toLowerCase()
        const path = value.path

        const index = path.toLowerCase().indexOf(query)
        if (index == -1) {
            el.createSpan({ text: path })
            return
        }

        el.createSpan({ text: path.substring(0, index) })
        el.createEl("b", { text: path.substring(index, index + query.length) })
        el.createSpan({ text: path.substring(index + query.length) })
    }

    override selectSuggestion(value: T, _evt: MouseEvent | KeyboardEvent) {
        this.setValue(value.path)
        this.textInputEl.trigger("input") // NOTE: unofficial api
        this.close()
    }
}

export class NoteSuggest extends PathSuggest<TFile> {
    protected override items(): TFile[] {
        return this.app.vault.getMarkdownFiles()
    }
}

export class FolderSuggest extends PathSuggest<TFolder> {
    protected override items(): TFolder[] {
        return this.app.vault.getAllFolders(true)
    }
}

import Store from "./main.ts"
import {
    AbstractInputSuggest,
    App,
    PluginSettingTab,
    Setting,
    TAbstractFile,
    TFile,
    TFolder,
} from "obsidian"

export default class StoreSettingTab extends PluginSettingTab {
    plugin: Store

    constructor(app: App, plugin: Store) {
        super(app, plugin)
        this.plugin = plugin
    }

    override display() {
        const { containerEl } = this
        containerEl.empty()

        this.addFolder(containerEl)
        this.addTemplate(containerEl)
    }

    private addFolder(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName("Folder location")
            .setDesc(
                "Path to the store folder. Created on demand if doesn't exist.",
            )
            .addText((text) => {
                text
                    .setPlaceholder("Default: store")
                    .setValue(this.plugin.folder())
                    .onChange(async (path) => await this.plugin.setFolder(path))

                new FolderSuggest(this.app, text.inputEl)
            })
    }

    private addTemplate(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName("Template location")
            .setDesc("Path to the template for new files.")
            .addText((text) => {
                text
                    .setPlaceholder("Example: templates/store.md")
                    .setValue(this.plugin.settings.template)
                    .onChange(async (path) =>
                        await this.plugin.setTemplate(path)
                    )

                new FileSuggest(this.app, text.inputEl)
            })
    }
}

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
        this.textInputEl.trigger("input") // note: unofficial api
        this.close()
    }
}

class FileSuggest extends PathSuggest<TFile> {
    protected override items(): TFile[] {
        return this.app.vault.getMarkdownFiles()
    }
}

class FolderSuggest extends PathSuggest<TFolder> {
    protected override items(): TFolder[] {
        return this.app.vault.getAllFolders(true)
    }
}

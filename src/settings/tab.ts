import Store from "@/main.ts"
import { App, PluginSettingTab, Setting } from "obsidian"
import { FolderSuggest, NoteSuggest } from "@/settings/suggest.ts"

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
            .setDesc("Path to the template for new notes.")
            .addText((text) => {
                text
                    .setPlaceholder("Example: templates/store.md")
                    .setValue(this.plugin.template())
                    .onChange(async (path) =>
                        await this.plugin.setTemplate(path)
                    )

                new NoteSuggest(this.app, text.inputEl)
            })
    }
}

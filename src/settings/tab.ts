import Store from "@/main.ts"
import Settings from "@/settings/settings.ts"
import { FolderSuggest, NoteSuggest } from "@/settings/suggest.ts"
import { DEFAULT_SETTINGS } from "@/settings/data.ts"
import { App, PluginSettingTab, Setting } from "obsidian"

export default class SettingTab extends PluginSettingTab {
    plugin: Store
    settings: Settings

    constructor(app: App, plugin: Store) {
        super(app, plugin)
        this.plugin = plugin
        this.settings = plugin.settings
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
                    .setPlaceholder(DEFAULT_SETTINGS.folder)
                    .setValue(this.settings.folder)
                    .onChange(async (path) => {
                        this.settings.folder = path
                        await this.settings.save()
                    })

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
                    .setValue(this.settings.template)
                    .onChange(async (path) => {
                        this.settings.template = path
                        await this.settings.save()
                    })

                new NoteSuggest(this.app, text.inputEl)
            })
    }
}

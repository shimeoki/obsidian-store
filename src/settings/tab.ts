import Store from "@/main.ts"
import Settings from "@/settings/settings.ts"
import { FolderSuggest, NoteSuggest } from "@/settings/suggest.ts"
import { App, PluginSettingTab, Setting } from "obsidian"

export default class SettingTab extends PluginSettingTab {
    plugin: Store
    private settings: Settings
    private readonly translation

    constructor(app: App, plugin: Store) {
        super(app, plugin)
        this.plugin = plugin
        this.settings = plugin.settings
        this.translation = plugin.translation.settings
    }

    override display() {
        const { containerEl } = this
        containerEl.empty()

        this.addFolder(containerEl)
        this.addTemplate(containerEl)
    }

    private addFolder(containerEl: HTMLElement) {
        const l10n = this.translation.folder
        new Setting(containerEl)
            .setName(l10n.name)
            .setDesc(l10n.description)
            .addText((text) => {
                text
                    .setPlaceholder(l10n.placeholder)
                    .setValue(this.settings.folder)
                    .onChange(async (path) => {
                        this.settings.folder = path
                        await this.settings.save()
                    })

                new FolderSuggest(this.app, text.inputEl)
            })
    }

    private addTemplate(containerEl: HTMLElement) {
        const l10n = this.translation.template
        new Setting(containerEl)
            .setName(l10n.name)
            .setDesc(l10n.description)
            .addText((text) => {
                text
                    .setPlaceholder(l10n.placeholder)
                    .setValue(this.settings.template)
                    .onChange(async (path) => {
                        this.settings.template = path
                        await this.settings.save()
                    })

                new NoteSuggest(this.app, text.inputEl)
            })
    }
}

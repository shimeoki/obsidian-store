import { App, PluginSettingTab, Setting, SettingGroup } from "obsidian"

import Store from "@/main.ts"
import { FolderSuggest, NoteSuggest } from "@/suggest.ts"

export default class SettingTab extends PluginSettingTab {
    plugin: Store

    constructor(app: App, plugin: Store) {
        super(app, plugin)
        this.plugin = plugin
    }

    override display() {
        const { containerEl } = this
        containerEl.empty()

        new SettingGroup(containerEl)
            .addSetting((s) => this.addFolder(s))
            .addSetting((s) => this.addTemplate(s))
            .addSetting((s) => this.addPack(s))
    }

    private addFolder(setting: Setting) {
        const l10n = this.plugin.translation.settings.folder
        setting.setName(l10n.name).setDesc(l10n.description)
            .addText((text) => {
                text
                    .setPlaceholder(l10n.placeholder)
                    .setValue(this.plugin.settings.folder)
                    .onChange(async (path) => {
                        this.plugin.settings.folder = path
                        await this.plugin.saveSettings()
                    })

                new FolderSuggest(this.app, text.inputEl)
            })
    }

    private addTemplate(setting: Setting) {
        const l10n = this.plugin.translation.settings.template
        setting.setName(l10n.name).setDesc(l10n.description)
            .addText((text) => {
                text
                    .setPlaceholder(l10n.placeholder)
                    .setValue(this.plugin.settings.template)
                    .onChange(async (path) => {
                        this.plugin.settings.template = path
                        await this.plugin.saveSettings()
                    })

                new NoteSuggest(this.app, text.inputEl)
            })
    }

    private addPack(setting: Setting) {
        const l10n = this.plugin.translation.settings.pack
        setting.setName(l10n.name).setDesc(l10n.description)
            .addText((text) => {
                text
                    .setPlaceholder(l10n.placeholder)
                    .setValue(this.plugin.settings.pack)
                    .onChange(async (path) => {
                        this.plugin.settings.pack = path
                        await this.plugin.saveSettings()
                    })

                new FolderSuggest(this.app, text.inputEl)
            })
    }
}

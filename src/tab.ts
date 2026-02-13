import { App, PluginSettingTab, Setting, SettingGroup } from "obsidian"

import Store from "@/main.ts"
import { FolderSuggest, NoteSuggest } from "@/suggest.ts"
import { DEFAULT_SETTINGS } from "@/settings.ts"

interface FolderData {
    name: string
    desc: string
    placeholder: string
    value: string
    cb: (path: string) => any
}

export default class SettingTab extends PluginSettingTab {
    plugin: Store

    constructor(app: App, plugin: Store) {
        super(app, plugin)
        this.plugin = plugin
    }

    override display() {
        const { containerEl } = this
        containerEl.empty()

        this.addFolders(containerEl)
        this.addNotes(containerEl)
    }

    private addFolders(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.folders
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) =>
            this.addFolder(s, {
                name: l10n.notes.name,
                desc: l10n.notes.desc,
                placeholder: DEFAULT_SETTINGS.folders.notes,
                value: this.plugin.settings.folders.notes,
                cb: (p) => (this.plugin.settings.folders.notes = p),
            })
        ).addSetting((s) =>
            this.addFolder(s, {
                name: l10n.assets.name,
                desc: l10n.assets.desc,
                placeholder: DEFAULT_SETTINGS.folders.assets,
                value: this.plugin.settings.folders.assets,
                cb: (p) => (this.plugin.settings.folders.assets = p),
            })
        ).addSetting((s) =>
            this.addFolder(s, {
                name: l10n.archive.name,
                desc: l10n.archive.desc,
                placeholder: DEFAULT_SETTINGS.folders.archive,
                value: this.plugin.settings.folders.archive,
                cb: (p) => (this.plugin.settings.folders.archive = p),
            })
        ).addSetting((s) =>
            this.addFolder(s, {
                name: l10n.pack.name,
                desc: l10n.pack.desc,
                placeholder: DEFAULT_SETTINGS.folders.pack,
                value: this.plugin.settings.folders.pack,
                cb: (p) => (this.plugin.settings.folders.pack = p),
            })
        )
    }

    private addNotes(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.notes
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) => {
            s.setName(l10n.template.name).setDesc(l10n.template.desc)
                .addText((text) => {
                    text.setPlaceholder(l10n.template.placeholder)
                        .setValue(this.plugin.settings.notes.template)
                        .onChange(async (v) => {
                            this.plugin.settings.notes.template = v
                            await this.plugin.saveSettings()
                        })

                    new NoteSuggest(this.app, text.inputEl)
                })
        }).addSetting((s) => {
            s.setName(l10n.templates.name).setDesc(l10n.templates.desc)
                .addText((text) => {
                    text.setPlaceholder(l10n.templates.placeholder)
                        .setValue(this.plugin.settings.notes.templates)
                        .onChange(async (v) => {
                            this.plugin.settings.notes.templates = v
                            await this.plugin.saveSettings()
                        })

                    new FolderSuggest(this.app, text.inputEl)
                })
        })
    }

    private addFolder(setting: Setting, data: FolderData) {
        setting.setName(data.name).setDesc(data.desc)
            .addText((text) => {
                text.setPlaceholder(data.placeholder).setValue(data.value)
                    .onChange(async (path) => {
                        data.cb(path)
                        await this.plugin.saveSettings()
                    })

                new FolderSuggest(this.app, text.inputEl)
            })
    }
}

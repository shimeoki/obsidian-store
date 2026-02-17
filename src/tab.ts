import { App, PluginSettingTab, Setting, SettingGroup } from "obsidian"

import Store from "@/main.ts"
import { FolderSuggest, NoteSuggest } from "@/suggest.ts"
import { DEFAULT_SETTINGS } from "@/settings.ts"

type SettingOpts = {
    name: string
    desc: string
}

type FolderSettingOpts = SettingOpts & {
    value: string
    placeholder: string
    cb: (v: string) => void
}

type EnableSettingOpts = SettingOpts & {
    value: boolean
    cb: (v: boolean) => void
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

        this.addGeneral(containerEl)
        this.addTemplates(containerEl)
        this.addPack(containerEl)
        this.addH1(containerEl)
        this.addAliases(containerEl)
        this.addAssets(containerEl)
        this.addArchive(containerEl)
    }

    private addFolder(s: Setting, opts: FolderSettingOpts) {
        s.setName(opts.name).setDesc(opts.desc).addText((text) => {
            text.setPlaceholder(opts.placeholder).setValue(opts.value)
                .onChange(async (v) => {
                    opts.cb(v)
                    await this.plugin.saveSettings()
                })

            new FolderSuggest(this.app, text.inputEl)
        })
    }

    private addEnable(s: Setting, opts: EnableSettingOpts) {
        s.setName(opts.name).setDesc(opts.desc).addToggle((toggle) => {
            toggle.setValue(opts.value).onChange(async (v) => {
                opts.cb(v)
                await this.plugin.saveSettings()
            })
        })
    }

    private addGeneral(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.general
        new SettingGroup(el).addSetting((s) => {
            this.addFolder(s, {
                name: l10n.folder.name,
                desc: l10n.folder.desc,
                placeholder: DEFAULT_SETTINGS.folder,
                value: this.plugin.settings.folder,
                cb: (v) => this.plugin.settings.folder = v,
            })
        })
    }

    private addTemplates(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.templates
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) => {
            s.setName(l10n.default.name).setDesc(l10n.default.desc)
                .addText((text) => {
                    text.setPlaceholder(l10n.default.placeholder)
                        .setValue(this.plugin.settings.templates.default)
                        .onChange(async (v) => {
                            this.plugin.settings.templates.default = v
                            await this.plugin.saveSettings()
                        })

                    new NoteSuggest(this.app, text.inputEl)
                })
        }).addSetting((s) => {
            this.addFolder(s, {
                name: l10n.folder.name,
                desc: l10n.folder.name,
                placeholder: l10n.folder.placeholder,
                value: this.plugin.settings.templates.folder,
                cb: (v) => this.plugin.settings.templates.folder = v,
            })
        })
    }

    private addPack(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.pack
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) => {
            this.addFolder(s, {
                name: l10n.folder.name,
                desc: l10n.folder.desc,
                placeholder: DEFAULT_SETTINGS.pack.folder,
                value: this.plugin.settings.pack.folder,
                cb: (v) => this.plugin.settings.pack.folder = v,
            })
        })
    }

    private addH1(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.h1
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) => {
            this.addEnable(s, {
                name: l10n.enable.name,
                desc: l10n.enable.desc,
                value: this.plugin.settings.h1.enable,
                cb: (v) => this.plugin.settings.h1.enable = v,
            })
        })
    }

    private addAliases(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.aliases
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) => {
            this.addEnable(s, {
                name: l10n.enable.name,
                desc: l10n.enable.desc,
                value: this.plugin.settings.aliases.enable,
                cb: (v) => this.plugin.settings.aliases.enable = v,
            })
        })
    }

    private addAssets(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.assets
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) => {
            this.addEnable(s, {
                name: l10n.enable.name,
                desc: l10n.enable.desc,
                value: this.plugin.settings.assets.enable,
                cb: (v) => this.plugin.settings.assets.enable = v,
            })
        }).addSetting((s) => {
            this.addFolder(s, {
                name: l10n.folder.name,
                desc: l10n.folder.desc,
                placeholder: DEFAULT_SETTINGS.assets.folder,
                value: this.plugin.settings.assets.folder,
                cb: (v) => this.plugin.settings.assets.folder = v,
            })
        })
    }

    private addArchive(el: HTMLElement) {
        const l10n = this.plugin.translation.settings.archive
        new SettingGroup(el).setHeading(l10n.heading).addSetting((s) => {
            this.addEnable(s, {
                name: l10n.enable.name,
                desc: l10n.enable.desc,
                value: this.plugin.settings.archive.enable,
                cb: (v) => this.plugin.settings.archive.enable = v,
            })
        }).addSetting((s) => {
            this.addFolder(s, {
                name: l10n.folder.name,
                desc: l10n.folder.desc,
                placeholder: DEFAULT_SETTINGS.archive.folder,
                value: this.plugin.settings.archive.folder,
                cb: (v) => this.plugin.settings.archive.folder = v,
            })
        }).addSetting((s) => {
            s.setName(l10n.tag.name).setDesc(l10n.tag.desc)
                .addText((text) => {
                    text.setPlaceholder(DEFAULT_SETTINGS.archive.tag)
                        .setValue(this.plugin.settings.archive.tag)
                        .onChange(async (text) => {
                            this.plugin.settings.archive.tag = text
                            await this.plugin.saveSettings()
                        })
                })
        })
    }
}

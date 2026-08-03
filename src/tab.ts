import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian"

import Store from "@/main.ts"

export default class SettingTab extends PluginSettingTab {
    plugin: Store

    constructor(app: App, plugin: Store) {
        super(app, plugin)
        this.plugin = plugin
    }

    override getSettingDefinitions(): SettingDefinitionItem[] {
        const l10n = this.plugin.translation.settings
        return [
            {
                name: l10n.general.folder.name,
                desc: l10n.general.folder.desc,
                control: {
                    type: "folder",
                    key: "folder",
                    defaultValue: "store",
                },
            },
            {
                type: "group",
                heading: l10n.templates.heading,
                items: [
                    {
                        name: l10n.templates.default.name,
                        desc: l10n.templates.default.desc,
                        control: {
                            type: "file",
                            key: "templatesDefault",
                            filter: (f) => f.extension.toLowerCase() == "md",
                        },
                    },
                    {
                        name: l10n.templates.folder.name,
                        desc: l10n.templates.folder.desc,
                        control: {
                            type: "folder",
                            key: "templatesFolder",
                        },
                    },
                ],
            },
            {
                type: "group",
                heading: l10n.pack.heading,
                items: [
                    {
                        name: l10n.pack.folder.name,
                        desc: l10n.pack.folder.desc,
                        control: {
                            type: "folder",
                            key: "packFolder",
                            defaultValue: "pack",
                        },
                    },
                ],
            },
            {
                type: "group",
                heading: l10n.h1.heading,
                items: [
                    {
                        name: l10n.h1.enable.name,
                        desc: l10n.h1.enable.desc,
                        control: {
                            type: "toggle",
                            key: "h1Enabled",
                            defaultValue: true,
                        },
                    },
                ],
            },
            {
                type: "group",
                heading: l10n.aliases.heading,
                items: [
                    {
                        name: l10n.aliases.enable.name,
                        desc: l10n.aliases.enable.desc,
                        control: {
                            type: "toggle",
                            key: "aliasesEnabled",
                            defaultValue: true,
                        },
                    },
                ],
            },
            {
                type: "group",
                heading: l10n.assets.heading,
                items: [
                    {
                        name: l10n.assets.enable.name,
                        desc: l10n.assets.enable.desc,
                        control: {
                            type: "toggle",
                            key: "assetsEnabled",
                            defaultValue: true,
                        },
                    },
                    {
                        name: l10n.assets.folder.name,
                        desc: l10n.assets.folder.desc,
                        control: {
                            type: "folder",
                            key: "assetsFolder",
                            defaultValue: "assets",
                        },
                    },
                ],
            },
            {
                type: "group",
                heading: l10n.archive.heading,
                items: [
                    {
                        name: l10n.archive.enable.name,
                        desc: l10n.archive.enable.desc,
                        control: {
                            type: "toggle",
                            key: "archiveEnabled",
                            defaultValue: true,
                        },
                    },
                    {
                        name: l10n.archive.folder.name,
                        desc: l10n.archive.folder.desc,
                        control: {
                            type: "folder",
                            key: "archiveFolder",
                            defaultValue: "archive",
                        },
                    },
                    {
                        name: l10n.archive.tag.name,
                        desc: l10n.archive.tag.desc,
                        control: {
                            type: "text",
                            key: "archiveTag",
                            defaultValue: "archive",
                        },
                    },
                ],
            },
        ]
    }
}

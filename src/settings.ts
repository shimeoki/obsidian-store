import { App, PluginSettingTab, Setting } from "obsidian";
import Store from "./main";

export default class StoreSettingTab extends PluginSettingTab {
	plugin: Store;

	constructor(app: App, plugin: Store) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		let { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("Folder").addText((text) => {
			text.setPlaceholder("Store folder").setValue(
				this.plugin.settings.folder,
			).onChange(async (folder) => {
				this.plugin.settings.folder = folder;
				await this.plugin.saveSettings();
			});
		});

		new Setting(containerEl).setName("Template").addText((text) => {
			text.setPlaceholder("Template file").setValue(
				this.plugin.settings.template,
			).onChange(async (template) => {
				this.plugin.settings.template = template;
				await this.plugin.saveSettings();
			});
		});
	}
}

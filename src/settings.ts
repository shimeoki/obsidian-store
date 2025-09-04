import {
	AbstractInputSuggest,
	App,
	PluginSettingTab,
	Setting,
	TAbstractFile,
} from "obsidian";
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

		this.addFolder(containerEl);
		this.addTemplate(containerEl);
	}

	addFolder(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Folder location")
			.setDesc("Path to the store folder.")
			.addText((text) => {
				text
					.setPlaceholder("Default: store")
					.setValue(this.plugin.settings.folder)
					.onChange(async (folder) => {
						this.plugin.settings.folder = folder;
						await this.plugin.saveSettings();
					});
			});
	}

	addTemplate(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Template location")
			.setDesc("Path to the template for new files.")
			.addText((text) => {
				text
					.setPlaceholder("Example: templates/store.md")
					.setValue(this.plugin.settings.template)
					.onChange(async (template) => {
						this.plugin.settings.template = template;
						await this.plugin.saveSettings();
					});
			});
	}
}

abstract class PathSuggest<T extends TAbstractFile>
	extends AbstractInputSuggest<T> {
	protected abstract items(): T[];
}

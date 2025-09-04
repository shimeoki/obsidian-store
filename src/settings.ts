import {
	AbstractInputSuggest,
	App,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	TFile,
	TFolder,
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
					.onChange(async (path) => {
						this.plugin.setFolder(path);
						await this.plugin.saveSettings();
					});

				new FolderSuggest(this.app, text.inputEl);
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
					.onChange(async (path) => {
						this.plugin.setTemplate(path);
						await this.plugin.saveSettings();
					});

				new FileSuggest(this.app, text.inputEl);
			});
	}
}

abstract class PathSuggest<T extends TAbstractFile>
	extends AbstractInputSuggest<T> {
	protected abstract items(): T[];

	protected getSuggestions(query: string): T[] | Promise<T[]> {
		const items = this.items();
		const match = query.toLowerCase();
		return items.filter((item) => item.path.toLowerCase().includes(match));
	}

	renderSuggestion(value: T, el: HTMLElement) {
		const query = this.getValue().toLowerCase();
		const path = value.path;

		const index = path.toLowerCase().indexOf(query);
		if (index == -1) {
			el.createSpan({ text: path });
			return;
		}

		el.createSpan({ text: path.substring(0, index) });
		el.createEl("b", { text: path.substring(index, index + query.length) });
		el.createSpan({ text: path.substring(index + query.length) });
	}

	selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent) {
		this.setValue(value.path);
		this.textInputEl.trigger("input"); // note: unofficial api
		this.close();
	}
}

class FileSuggest extends PathSuggest<TFile> {
	protected items(): TFile[] {
		return this.app.vault.getMarkdownFiles();
	}
}

class FolderSuggest extends PathSuggest<TFolder> {
	protected items(): TFolder[] {
		return this.app.vault.getAllFolders(true);
	}
}

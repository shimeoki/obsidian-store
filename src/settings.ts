import { App, PluginSettingTab } from "obsidian";
import Store from "./main";

export default class StoreSettingsTab extends PluginSettingTab {
	plugin: Store;

	constructor(app: App, plugin: Store) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		let { containerEl } = this;
		containerEl.empty();
	}
}

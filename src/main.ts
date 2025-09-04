import { normalizePath, Plugin, TFolder } from "obsidian";

interface StoreSettings {
	directory: string;
}

const DEFAULT_SETTINGS: Partial<StoreSettings> = {
	directory: normalizePath("/store"),
};

export default class Store extends Plugin {
	settings: StoreSettings;

	async onload() {
		await this.loadSettings();

		console.log(this.settings.directory);
	}

	async onunload() {
		await this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	name(): string {
		return crypto.randomUUID();
	}

	async rename(path: string) {
		const file = this.app.vault.getFileByPath(path);
		if (file == null) {
			return;
		}

		const newPath = `${file.parent.path}/${this.name()}.${file.extension}`;
		await this.app.fileManager.renameFile(file, normalizePath(newPath));
	}

	async renameActive() {
		const file = this.app.workspace.getActiveFile();
		if (file == null) {
			return;
		}

		await this.rename(file.path);
	}

	async directory(): Promise<TFolder> {
		const vault = this.app.vault;
		const directory = this.settings.directory;

		const fromVault = vault.getFolderByPath(directory);
		if (fromVault != null) {
			return fromVault;
		}

		await vault.createFolder(directory);
		return await this.directory();
	}
}

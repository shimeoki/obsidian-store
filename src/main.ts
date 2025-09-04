import { normalizePath, Plugin, TFolder } from "obsidian";

interface StoreSettings {
	directory: string;
}

const DEFAULT_SETTINGS: Partial<StoreSettings> = {
	directory: normalizePath("/store"),
};

export default class Store extends Plugin {
	settings: StoreSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		console.log(this.settings.directory);
	}

	async onunload(): Promise<void> {
		await this.saveSettings();
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	name(): string {
		return crypto.randomUUID();
	}

	async rename(path: string): Promise<void> {
		const file = this.app.vault.getFileByPath(path);
		if (file == null) {
			return;
		}

		const newPath = `${file.parent.path}/${this.name()}.${file.extension}`;
		await this.app.fileManager.renameFile(file, normalizePath(newPath));
	}

	async renameActive(): Promise<void> {
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

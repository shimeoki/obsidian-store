import { normalizePath, Plugin, TFile, TFolder } from "obsidian";

interface StoreSettings {
	folder: string;
}

const DEFAULT_SETTINGS: Partial<StoreSettings> = {
	folder: normalizePath("/store"),
};

export default class Store extends Plugin {
	settings: StoreSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "store-create",
			name: "Create",
			callback: async () => await this.createAndOpen(),
		});

		console.log(this.settings.folder);
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

	async folder(): Promise<TFolder> {
		const vault = this.app.vault;
		const folder = this.settings.folder;

		const fromVault = vault.getFolderByPath(folder);
		if (fromVault != null) {
			return fromVault;
		}

		await vault.createFolder(folder);
		return await this.folder();
	}

	async create(): Promise<TFile> {
		// note: unofficial api
		return await this.app.fileManager.createNewMarkdownFile(
			await this.folder(),
			this.name(),
			"", // todo: template
		);
	}

	async createAndOpen() {
		const file = await this.create();

		// todo: customization
		const newLeaf = this.app.workspace.getLeaf("split");

		await newLeaf.openFile(file);
	}
}

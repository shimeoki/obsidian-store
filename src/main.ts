import { normalizePath, Plugin } from "obsidian";

interface StoreSettings {
	directory: string;
}

const DEFAULT_SETTINGS: Partial<StoreSettings> = {
	directory: normalizePath("/store"),
};

export default class Store extends Plugin {
	async onload(): Promise<void> {
		console.log("generating a random uuid:");
		console.log(crypto.randomUUID());
	}

	async onunload(): Promise<void> {
		console.log("unloading");
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
}

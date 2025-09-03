import { Plugin } from "obsidian";

export default class Store extends Plugin {
	async onload(): Promise<void> {
		console.log("generating a random uuid:");
		console.log(crypto.randomUUID());
	}

	async onunload(): Promise<void> {
		console.log("unloading");
	}
}

import { normalizePath } from "obsidian"

export interface SettingsData {
    version: number
    folder: string
    template: string
}

export const DEFAULT_SETTINGS: SettingsData = {
    version: 0,
    folder: normalizePath("store"),
    template: "",
}

import { normalizePath } from "obsidian"

export interface SettingsData {
    version: number
    folder: string
    template: string
    pack: string
}

export const DEFAULT_SETTINGS: SettingsData = {
    version: 0,
    folder: normalizePath("store"),
    template: "",
    pack: normalizePath("pack"),
}

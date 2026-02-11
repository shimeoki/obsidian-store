export interface SettingsData {
    version: number
    folder: string
    template: string
    pack: string

    archive: {
        folder: string
        tag: string
    }
}

export const DEFAULT_SETTINGS: SettingsData = {
    version: 0,
    folder: "store",
    template: "",
    pack: "pack",

    archive: {
        folder: "archive",
        tag: "archive",
    },
}

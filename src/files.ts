import { TFile, TFolder } from "obsidian"

export function isNote(f: TFile): boolean {
    return f.extension.toLowerCase() == "md"
}

export function forEachFile(f: TFolder, cb: (f: TFile) => void) {
    const folders = [f]
    while (folders.length > 0) {
        const folder = folders.shift()
        if (!folder) {
            break
        }

        for (const file of folder.children) {
            if (file instanceof TFolder) {
                folders.push(file)
            } else if (file instanceof TFile) {
                cb(file)
            }
        }
    }
}

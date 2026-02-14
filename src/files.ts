import { TFile, TFolder } from "obsidian"

export function isNote(f?: TFile): boolean {
    if (!f || f.extension.toLowerCase() != "md") {
        return false
    }

    if (f.path.toLowerCase().endsWith(".excalidraw.md")) {
        return false
    }

    return true
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

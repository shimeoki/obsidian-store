import { TFile, TFolder } from "obsidian"

type FileCallback = (f: TFile) => Promise<void>

export function isNote(f: TFile): boolean {
    return f.extension.toLowerCase() == "md"
}

export async function recurseFiles(f: TFolder, cb: FileCallback) {
    const folders = [f]
    while (folders.length > 0) {
        const folder = folders.shift()
        if (!folder) {
            break
        }

        const children = [...folder.children] // snapshot
        for (const file of children) {
            if (file instanceof TFolder) {
                folders.push(file)
            } else if (file instanceof TFile) {
                await cb(file)
            }
        }
    }
}

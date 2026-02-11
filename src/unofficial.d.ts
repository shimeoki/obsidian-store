import "obsidian"

declare module "obsidian" {
    interface AbstractInputSuggest<T> {
        textInputEl: HTMLDivElement | HTMLInputElement
    }
}

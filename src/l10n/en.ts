import Translation from "@/i18n.ts"

export const ENGLISH: Translation = {
    settings: {
        folder: {
            name: "Folder Location",
            description:
                "Path to the store folder. Created on demand if doesn't exist.",
            placeholder: "store",
        },

        template: {
            name: "Template location",
            description: "Path to the template for new notes.",
            placeholder: "Example: templates/store.md",
        },
    },
}

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

        pack: {
            name: "Pack location",
            description: "Path to the folder for packed files",
            placeholder: "pack",
        },
    },

    commands: {
        createVerticalSplit: {
            name: "Create new note in a vertical split",
        },

        createHorizontalSplit: {
            name: "Create new note in a horizontal split",
        },

        createTab: {
            name: "Create new note in a tab",
        },

        moveActive: {
            name: "Move active file to the store",
        },

        addHeadingActive: {
            name: "Add first-level heading in active note",
        },

        addAliasesActive: {
            name: "Add aliases in active note",
        },

        packActive: {
            name: "Pack active note",
        },
    },

    menus: {
        move: {
            title: "Move to the store",
        },

        addHeading: {
            title: "Add first-level heading",
        },

        addAliases: {
            title: "Add aliases",
        },
    },

    ribbonActions: {
        new: {
            title: "Create new note in the store",
        },
    },
}

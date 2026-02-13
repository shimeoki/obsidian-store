import Translation from "@/i18n.ts"

export default {
    settings: {
        folders: {
            heading: "Folders",

            notes: {
                name: "Notes",
                desc: "Location for all stored notes.",
            },

            assets: {
                name: "Assets",
                desc:
                    "Location for all stored immutable assets: PNG, JPEG and PDF files.",
            },

            archive: {
                name: "Archive",
                desc:
                    "Location for all archived notes. It's recommended to keep this folder in Obsidian's 'excluded files'.",
            },

            pack: {
                name: "Pack",
                desc: "Location for the 'packed' files.",
            },
        },

        notes: {
            heading: "Notes",

            template: {
                name: "Template",
                desc: "Location of the default template for new notes.",
                placeholder: "Example: templates/store.md",
            },

            templates: {
                name: "Templates",
                desc: "Location of the template folder for new notes.",
                placeholder: "Example: templates",
            },
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

        archiveActive: {
            name: "Archive active note",
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

        pack: {
            title: "Pack",
        },

        archiveNotes: {
            title: "Archive notes in folder",
            folder: (p) => `Archiving notes in '${p}'...`,
            count: (n) => `Archived ${n} note(s).`,
            empty: "No notes archived.",
        },

        archiveNote: {
            title: "Archive note",
        },
    },

    ribbonActions: {
        new: {
            title: "Create new note in the store",
        },
    },
} as const satisfies Translation

import Translation from "@/i18n.ts"

export default {
    settings: {
        general: {
            folder: {
                name: "Store folder location",
                desc: "Stored notes will be placed here.",
            },
        },

        templates: {
            heading: "Templates",

            default: {
                name: "File location",
                desc: "Choose a note to use as a default template.",
                placeholder: "Example: templates/default.md",
            },

            folder: {
                name: "Folder location",
                desc: "Notes in this folder will be available as templates.",
                placeholder: "Example: templates",
            },
        },

        pack: {
            heading: "Pack",

            folder: {
                name: "Folder location",
                desc: "Packed files will be placed here.",
            },
        },

        h1: {
            heading: "H1",

            enable: {
                name: "Automatic generation",
                desc:
                    "Whether to enable level 1 heading generation based on the filename.",
            },
        },

        aliases: {
            heading: "Aliases",

            enable: {
                name: "Automatic generation",
                desc:
                    "Whether to enable aliases generation based on the filename and level 1 heading.",
            },
        },

        assets: {
            heading: "Assets",

            enable: {
                name: "Storing",
                desc:
                    "Whether to enable storing for other files (not notes) in the vault.",
            },

            folder: {
                name: "Folder location",
                desc: "Stored assets will be placed here.",
            },
        },

        archive: {
            heading: "Archive",

            enable: {
                name: "Archiving",
                desc: "Whether to enable archiving for notes.",
            },

            folder: {
                name: "Folder location",
                desc: "Archived notes will be placed here.",
            },

            tag: {
                name: "Tag name",
                desc: "Notes with this tag will be archived",
            },
        },
    },

    commands: {
        createNewTabDefault: {
            name: "Create new note in new tab (default template)",
        },

        createCurrentTabDefault: {
            name: "Create new note in current tab (default template)",
        },

        createVerticalSplitDefault: {
            name: "Create new note in vertical split (default template)",
        },

        createHorizontalSplitDefault: {
            name: "Create new note in horizontal split (default template)",
        },

        createNewTabSelect: {
            name: "Create new note in new tab (select template)",
        },

        createCurrentTabSelect: {
            name: "Create new note in current tab (select template)",
        },

        createVerticalSplitSelect: {
            name: "Create new note in vertical split (select template)",
        },

        createHorizontalSplitSelect: {
            name: "Create new note in horizontal split (select template)",
        },

        storeCurrent: {
            name: "Store current file",
        },

        packCurrent: {
            name: "Pack current file",
        },
    },

    menus: {
        store: {
            title: "Store",
        },

        pack: {
            title: "Pack",
        },
    },
} as const satisfies Translation

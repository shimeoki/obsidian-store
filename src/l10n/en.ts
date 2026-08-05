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
                name: "Default template location",
                desc: "Choose a note to use as a default template.",
                placeholder: "Example: templates/default.md",
            },

            folder: {
                name: "Template folder location",
                desc: "Notes in this folder will be available as templates.",
                placeholder: "Example: templates",
            },
        },

        pack: {
            heading: "Pack",

            folder: {
                name: "Pack folder location",
                desc: "Packed files will be placed here.",
            },
        },

        h1: {
            heading: "H1",

            enable: {
                name: "Enable automatic heading generation",
                desc:
                    "Whether to enable level 1 heading generation based on the filename while storing.",
            },
        },

        aliases: {
            heading: "Aliases",

            enable: {
                name: "Enable automatic aliases generation",
                desc:
                    "Whether to enable aliases generation based on the filename and level 1 heading while storing.",
            },
        },

        assets: {
            heading: "Assets",

            enable: {
                name: "Enable asset storing",
                desc:
                    "Whether to enable storing for other files (not notes) in the vault.",
            },

            folder: {
                name: "Assets folder location",
                desc: "Stored assets will be placed here.",
            },
        },

        archive: {
            heading: "Archive",

            enable: {
                name: "Enable archiving",
                desc: "Whether to enable archiving for notes.",
            },

            folder: {
                name: "Archive folder location",
                desc: "Archived notes will be placed here.",
            },

            tag: {
                name: "Archive tag name",
                desc: "Notes with this tag will be archived.",
            },
        },

        tagme: {
            heading: "TAGME",

            enableAddition: {
                name: "Enable automatic addition",
                desc:
                    "Whether to enable automatic addition of the TAGME tag if a stored note doesn't have any tags.",
            },

            enableDeletion: {
                name: "Enable automatic deletion",
                desc:
                    "Whether to disable automatic deletion of the TAGME tag if a stored note has other tags.",
            },

            tag: {
                name: "TAGME tag name",
                desc: "Notes with no tags will receive this tag.",
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

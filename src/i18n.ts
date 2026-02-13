interface FolderSetting {
    name: string
    desc: string
}

interface Command {
    name: string
}

interface Menu {
    title: string
}

interface RibbonAction {
    title: string
}

export default interface Translation {
    settings: {
        folders: {
            heading: string
            notes: FolderSetting
            assets: FolderSetting
            archive: FolderSetting
            pack: FolderSetting
        }

        notes: {
            heading: string

            template: {
                name: string
                desc: string
                placeholder: string
            }
        }
    }

    commands: {
        createVerticalSplit: Command
        createHorizontalSplit: Command
        createTab: Command
        moveActive: Command
        addHeadingActive: Command
        addAliasesActive: Command
        packActive: Command
        archiveActive: Command
    }

    menus: {
        move: Menu
        addHeading: Menu
        addAliases: Menu
        pack: Menu

        archiveNotes: Menu & {
            folder: (p: string) => string
            count: (n: number) => string
            empty: string
        }

        archiveNote: Menu
    }

    ribbonActions: {
        new: RibbonAction
    }
}

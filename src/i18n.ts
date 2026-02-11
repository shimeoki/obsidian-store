interface Setting {
    name: string
    description: string
    placeholder: string
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
        folder: Setting
        template: Setting
        pack: Setting
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

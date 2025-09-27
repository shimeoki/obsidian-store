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
    }

    menus: {
        move: Menu
        addHeading: Menu
        addAliases: Menu
    }

    ribbonActions: {
        new: RibbonAction
    }
}

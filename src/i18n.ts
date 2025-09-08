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
    }

    commands: {
        createVerticalSplit: Command
        createHorizontalSplit: Command
        createTab: Command
        moveActive: Command
        addHeadingActive: Command
    }

    menus: {
        move: Menu
        addHeading: Menu
    }

    ribbonActions: {
        new: RibbonAction
    }
}

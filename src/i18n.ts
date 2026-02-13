type Setting = {
    name: string
    desc: string
}

type PlaceholderSetting = Setting & {
    placeholder: string
}

type Command = {
    name: string
}

type Menu = {
    title: string
}

type RibbonAction = {
    title: string
}

export default interface Translation {
    settings: {
        folders: {
            title: string
            notes: Setting
            assets: Setting
            archive: Setting
            pack: Setting
        }

        notes: {
            title: string
            template: PlaceholderSetting
            templates: PlaceholderSetting
            heading: Setting
            aliases: Setting
        }

        assets: {
            title: string
            enable: Setting
        }

        archive: {
            title: string
            enable: Setting
            tag: Setting
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

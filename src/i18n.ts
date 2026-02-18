type SettingGroup = {
    heading: string
}

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

export default interface Translation {
    settings: {
        general: {
            folder: Setting
        }

        templates: SettingGroup & {
            default: PlaceholderSetting
            folder: PlaceholderSetting
        }

        pack: SettingGroup & {
            folder: Setting
        }

        h1: SettingGroup & {
            enable: Setting
        }

        aliases: SettingGroup & {
            enable: Setting
        }

        assets: SettingGroup & {
            enable: Setting
            folder: Setting
        }

        archive: SettingGroup & {
            enable: Setting
            folder: Setting
            tag: Setting
        }
    }

    commands: {
        createNewTabDefault: Command
        createCurrentTabDefault: Command
        createVerticalSplitDefault: Command
        createHorizontalSplitDefault: Command

        createNewTabSelect: Command
        createCurrentTabSelect: Command
        createVerticalSplitSelect: Command
        createHorizontalSplitSelect: Command

        storeCurrent: Command
        packCurrent: Command
    }

    menus: {
        store: Menu
        pack: Menu
    }
}

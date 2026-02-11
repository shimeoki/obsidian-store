import Translation from "@/i18n.ts"

export default {
    settings: {
        folder: {
            name: "Место папки",
            description:
                "Путь до папки стора. Будет создана если не существует.",
            placeholder: "store",
        },

        template: {
            name: "Место шаблона",
            description: "Путь до шаблона для новых заметок.",
            placeholder: "Пример: templates/store.md",
        },

        pack: {
            name: "Место упаковки",
            description: "Путь до папки с упакованными файлами.",
            placeholder: "pack",
        },
    },

    commands: {
        createVerticalSplit: {
            name: "Создать новую заметку в вертикальном разделении",
        },

        createHorizontalSplit: {
            name: "Создать новую заметку в горизонтальном разделении",
        },

        createTab: {
            name: "Создать новую заметку во вкладке",
        },

        moveActive: {
            name: "Переместить активный файл в стор",
        },

        addHeadingActive: {
            name: "Добавить заголовок первого уровня в активную заметку",
        },

        addAliasesActive: {
            name: "Добавить псевдонимы в активную заметку",
        },

        packActive: {
            name: "Упаковать активную заметку",
        },

        archiveActive: {
            name: "Заархивировать активную заметку",
        },
    },

    menus: {
        move: {
            title: "Переместить в стор",
        },

        addHeading: {
            title: "Добавить заголовок первого уровня",
        },

        addAliases: {
            title: "Добавить псевдонимы",
        },

        pack: {
            title: "Упаковать",
        },

        archiveNotes: {
            title: "Заархивировать заметки в папке",
            folder: (p) => `Заметки архивируются в '${p}'...`,
            count: (n) => `Заархивировано заметок: ${n}.`,
            empty: "Заметки для архивации не были найдены.",
        },

        archiveNote: {
            title: "Заархивировать заметку",
        },
    },

    ribbonActions: {
        new: {
            title: "Создать новую заметку в сторе",
        },
    },
} as const satisfies Translation

import Translation from "@/i18n.ts"

export default {
    settings: {
        folders: {
            heading: "Папки",

            notes: {
                name: "Заметки",
                desc: "Место склада заметок.",
            },

            assets: {
                name: "Ресурсы",
                desc: "Место неизменяемых ресурсов: PNG, JPEG и PDF файлов.",
            },

            archive: {
                name: "Архив",
                desc:
                    "Место архива заметок. Рекомендуется указать эту папку в 'исключённых папках' Obsidian'а.",
            },

            pack: {
                name: "Пакет",
                desc: "Место 'упакованных' заметок.",
            },
        },

        notes: {
            heading: "Заметки",

            template: {
                name: "Шаблон",
                desc: "Место шаблона по умолчанию для новых заметок.",
                placeholder: "Пример: templates/store.md",
            },

            templates: {
                name: "Шаблоны",
                desc: "Место папки с шаблонами для новых заметок.",
                placeholder: "Пример: templates",
            },
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

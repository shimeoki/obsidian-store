interface Setting {
    name: string
    description: string
    placeholder: string
}

export default interface Translation {
    settings: {
        folder: Setting
        template: Setting
    }
}

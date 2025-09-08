import { getLanguage } from "obsidian"
import Translation from "@/i18n.ts"
import { ENGLISH } from "@/l10n/en.ts"
import { RUSSIAN } from "@/l10n/ru.ts"

export default function translation(): Translation {
    switch (getLanguage()) {
        case "en":
            return ENGLISH
        case "ru":
            return RUSSIAN
        default:
            return ENGLISH
    }
}

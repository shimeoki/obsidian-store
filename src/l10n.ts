import { getLanguage } from "obsidian"
import Translation from "@/i18n.ts"

// keep-sorted start
import en from "@/l10n/en.ts"
import ru from "@/l10n/ru.ts"
// keep-sorted end

export default function getTranslation(): Translation {
    switch (getLanguage()) {
        case "en":
            return en
        // case "ru":
        //     return ru
        default:
            return en
    }
}

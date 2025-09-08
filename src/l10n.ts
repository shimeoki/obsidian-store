import { getLanguage } from "obsidian"
import Translation from "@/i18n.ts"
import { ENGLISH } from "@/l10n/en.ts"

export default function translation(): Translation {
    switch (getLanguage()) {
        case "en":
            return ENGLISH
        default:
            return ENGLISH
    }
}

import iconv from "iconv-lite";

export const normalizeFilename = (filename) => {
    try {
        if (/[а-яА-ЯёЁ]/.test(filename)) {
            return filename;
        }

        try {
            const utf8Decoded = decodeURIComponent(escape(filename));
            if (/[а-яА-ЯёЁ]/.test(utf8Decoded)) {
                return utf8Decoded;
            }
        } catch (e) {}

        try {
            const win1251Decoded = iconv.decode(
                Buffer.from(filename, "binary"),
                "win1251"
            );
            if (/[а-яА-ЯёЁ]/.test(win1251Decoded)) {
                return win1251Decoded;
            }
        } catch (e) {}

        return filename;
    } catch (error) {
        console.error("Filename normalization error:", error);
        return filename;
    }
};

export const sanitizeFilename = (filename) => {
    return filename
        .replace(/[\/\\|:*?"<>]/g, "_")
        .normalize("NFC")
        .replace(/[\u0300-\u036f]/g, "");
};

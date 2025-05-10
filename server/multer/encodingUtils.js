import iconv from "iconv-lite";

// Функция для корректного декодирования имен файлов
export const decodeFileName = (filename) => {
    try {
        // Если уже есть кириллица - возвращаем как есть
        if (/[а-яА-ЯёЁ]/.test(filename)) {
            return filename;
        }

        // Пробуем декодировать из UTF-8
        try {
            const decoded = decodeURIComponent(escape(filename));
            if (/[а-яА-ЯёЁ]/.test(decoded)) {
                return decoded;
            }
        } catch (e) {}

        // Пробуем декодировать из Windows-1251
        try {
            const decoded = iconv.decode(
                Buffer.from(filename, "binary"),
                "win1251"
            );
            if (/[а-яА-ЯёЁ]/.test(decoded)) {
                return decoded;
            }
        } catch (e) {}

        return filename;
    } catch (error) {
        console.error("Filename decoding error:", error);
        return filename;
    }
};

// Функция для создания безопасного имени файла
export const safeFileName = (filename) => {
    const decoded = decodeFileName(filename);
    return decoded
        .replace(/[\/\\|:*?"<>]/g, "_") // Заменяем опасные символы
        .normalize("NFC") // Нормализуем Unicode
        .replace(/[\u0300-\u036f]/g, ""); // Удаляем диакритические знаки
};

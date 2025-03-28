import React, { useState } from "react";
import { MyButton } from "../uikit";
import { Icon } from "../ui/icons";
import WordIcon from "@/app/assets/icons/word-icon.svg";
import PDFIcon from "@/app/assets/icons/pdf-icon.svg";
import ImageIcon from "@/app/assets/icons/image-icon.svg";
import FileIcon from "@/app/assets/icons/file-icon.svg";
import EllipsisVertical from "@/app/assets/icons/ellipsis-vertical.svg";
import "./FileComp.scss";
import { downloadFile } from "@/app/api/uploadFileAPI";

const getFileType = (fileUrl) => {
    if (!fileUrl) {
        return "file";
    }

    const extension = fileUrl.split(".").pop().toLowerCase();
    switch (extension) {
        case "doc":
        case "docx":
            return "word";
        case "pdf":
            return "pdf";
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
            return "image";
        case "xls":
        case "xlsx":
            return "excel";
        case "txt":
            return "text";
        default:
            return "file";
    }
};

const getFileIcon = (fileType) => {
    switch (fileType) {
        case "word":
            return <Icon src={WordIcon} alt="word-icon" />;
        case "pdf":
            return <Icon src={PDFIcon} alt="pdf-icon" />;
        case "image":
            return <Icon src={ImageIcon} alt="image-icon" />;
        default:
            return <Icon src={FileIcon} alt="file-icon" />;
    }
};

const decodeFileName = (fileName) => {
    if (!fileName) {
        return "Файл";
    }

    try {
        // Пробуем декодировать как URI компонент
        try {
            const uriDecoded = decodeURIComponent(fileName);
            if (!/[�]/.test(uriDecoded)) {
                return uriDecoded;
            }
        } catch (e) {}

        // Пробуем декодировать из UTF-8
        try {
            const utf8Decoded = unescape(encodeURIComponent(fileName));
            if (!/[�]/.test(utf8Decoded)) {
                return utf8Decoded;
            }
        } catch (e) {}

        // Если ничего не помогло, возвращаем оригинальное имя
        return fileName;
    } catch (error) {
        console.error("Ошибка декодирования названия файла:", error);
        return fileName;
    }
};

export const FileItem = ({ fileUrl, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!fileUrl) {
        return null;
    }

    const fileType = getFileType(fileUrl);
    const fileName = decodeFileName(
        fileUrl.replace(/\\/g, "/").split("/").pop(),
    );

    const handleDownload = async () => {
        try {
            const normalizedPath = fileUrl.replace(/\\/g, "/");

            const downloadPath = normalizedPath.includes("uploads/")
                ? normalizedPath.split("uploads/")[1]
                : normalizedPath;

            await downloadFile(downloadPath);
        } catch (error) {
            console.error("Download failed:", error);
            alert(`Не удалось скачать файл: ${error.message}`);
        } finally {
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="file-item">
            <div className="file-icon">{getFileIcon(fileType)}</div>
            <span className="file-name">{fileName}</span>
            <div className="file-actions">
                <MyButton
                    className="file-item-menu"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Icon src={EllipsisVertical} alt="elipsis-vertical" />
                </MyButton>
                {isMenuOpen && (
                    <div className="file-menu">
                        <MyButton
                            className="file-menu-item"
                            onClick={handleDownload}
                        >
                            Скачать
                        </MyButton>
                        {onDelete && (
                            <MyButton
                                className="file-menu-item"
                                onClick={onDelete}
                            >
                                Удалить
                            </MyButton>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

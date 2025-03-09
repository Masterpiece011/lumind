import React from "react";
import { MyButton } from "../uikit";
import { Icon } from "../ui/icons";
import WordIcon from "@/app/assets/icons/word-icon.svg";
import PDFIcon from "@/app/assets/icons/pdf-icon.svg";
import ImageIcon from "@/app/assets/icons/image-icon.svg";
import FileIcon from "@/app/assets/icons/file-icon.svg";

import "./FileComp.scss";

const getFileType = (fileUrl) => {
  
    if (!fileUrl) {
        return "file"; // Возвращаем значение по умолчанию, если fileUrl отсутствует
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
        const byteArray = new Uint8Array(
            fileName.split("").map((char) => char.charCodeAt(0)),
        );
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(byteArray);
    } catch (error) {
        console.error("Ошибка декодирования названия файла:", error);
        return fileName;
    }
};

export const FileItem = ({ fileUrl, onDelete }) => {
    if (!fileUrl) {
        return null;
    }

    const fileType = getFileType(fileUrl);
    const fileName = decodeFileName(
        fileUrl.replace(/\\/g, "/").split("/").pop(),
    );

    return (
        <div className="file-item">
            <div className="file-icon">{getFileIcon(fileType)}</div>
            <span className="file-name">{fileName}</span>
            {onDelete && (
                <MyButton className="file-item-delete" onClick={onDelete}>
                    Удалить
                </MyButton>
            )}
        </div>
    );
};

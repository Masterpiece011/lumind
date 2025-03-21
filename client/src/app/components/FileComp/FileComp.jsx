import React, { useState } from "react";
import { MyButton } from "../uikit";
import { Icon } from "../ui/icons";
import WordIcon from "@/app/assets/icons/word-icon.svg";
import PDFIcon from "@/app/assets/icons/pdf-icon.svg";
import ImageIcon from "@/app/assets/icons/image-icon.svg";
import FileIcon from "@/app/assets/icons/file-icon.svg";
import EllipsisVertical from "@/app/assets/icons/ellipsis-vertical.svg";

import "./FileComp.scss";

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!fileUrl) {
        return null;
    }

    const fileType = getFileType(fileUrl);
    const fileName = decodeFileName(
        fileUrl.replace(/\\/g, "/").split("/").pop(),
    );

    const handleDownload = () => {
    
        const file = new Blob([fileUrl], { type: "application/octet-stream" });

        const url = URL.createObjectURL(file);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        setIsMenuOpen(false);
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

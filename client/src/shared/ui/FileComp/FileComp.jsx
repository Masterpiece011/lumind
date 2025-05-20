import React, { useState, useRef, useEffect, memo } from "react";
import "./FileComp.scss";

import { MyButton } from "@/shared/uikit/MyButton";
import { Icon } from "@/shared/uikit/icons";

import WordIcon from "@/app/assets/icons/word-icon.svg";
import PDFIcon from "@/app/assets/icons/pdf-icon.svg";
import ImageIcon from "@/app/assets/icons/image-icon.svg";
import FileIcon from "@/app/assets/icons/file-icon.svg";
import EllipsisVertical from "@/app/assets/icons/ellipsis-vertical.svg";
import CloudDowloadArrow from "@/app/assets/icons/cloud-arrow-down-solid.svg";

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
        try {
            const uriDecoded = decodeURIComponent(fileName);
            if (!/[�]/.test(uriDecoded)) {
                return uriDecoded;
            }
        } catch (e) {}

        try {
            const utf8Decoded = unescape(encodeURIComponent(fileName));
            if (!/[�]/.test(utf8Decoded)) {
                return utf8Decoded;
            }
        } catch (e) {}

        return fileName;
    } catch (error) {
        console.error("Ошибка декодирования названия файла:", error);
        return fileName;
    }
};

export const FileItem = memo(
    ({
        fileUrl,
        fileName,
        onDownload,
        onDelete,
        disabled = false,
        additionalInfo,
        simpleView = false,
        compact = false,
    }) => {
        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const menuRef = useRef(null);
        const buttonRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    menuRef.current &&
                    !menuRef.current.contains(event.target) &&
                    buttonRef.current &&
                    !buttonRef.current.contains(event.target)
                ) {
                    setIsMenuOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

        if (!fileUrl) {
            return null;
        }

        const fileType = getFileType(fileUrl);
        const fullFileName = decodeFileName(
            fileName || fileUrl.replace(/\\/g, "/").split("/").pop(),
        );
        const displayFileName = fullFileName.split("-").pop();

        const handleDownloadClick = async (e) => {
            e.stopPropagation();
            e.preventDefault();

            try {
                if (onDownload) {
                    await onDownload();
                } else {
                    console.warn("No download handler provided");
                }
            } catch (error) {
                console.error("Download failed:", error);
                alert(`Не удалось скачать файл: ${error.message}`);
            } finally {
                setIsMenuOpen(false);
            }
        };

        const handleDeleteClick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onDelete) {
                onDelete();
            }
            setIsMenuOpen(false);
        };

        const handleMenuToggle = (e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsMenuOpen(!isMenuOpen);
        };

        return (
            <div className={`file-item ${compact ? "file-item--compact" : ""}`}>
                <div className="file-icon">{getFileIcon(fileType)}</div>
                <div className="file-info">
                    <span className="file-name" title={fullFileName}>
                        {compact
                            ? displayFileName.length > 20
                                ? `${displayFileName.substring(0, 17)}...`
                                : displayFileName
                            : displayFileName}
                    </span>
                    {!compact && additionalInfo && (
                        <span className="file-additional-info">
                            {additionalInfo}
                        </span>
                    )}
                </div>

                {compact ? (
                    <MyButton
                        className="file-download-compact"
                        onClick={handleDownloadClick}
                        disabled={disabled}
                        style={{
                            minWidth: "20px",
                            width: "20px",
                            height: "20px",
                            padding: "2px",
                        }}
                    >
                        <Icon
                            src={CloudDowloadArrow}
                            alt="download"
                            style={{
                                width: "12px",
                                height: "12px",
                            }}
                        />
                    </MyButton>
                ) : (
                    <div className="file-actions" ref={buttonRef}>
                        <MyButton
                            className="file-item-menu"
                            onClick={handleMenuToggle}
                            disabled={disabled}
                        >
                            <Icon src={EllipsisVertical} alt="menu" />
                        </MyButton>
                        {isMenuOpen && (
                            <div className="file-menu" ref={menuRef}>
                                <MyButton
                                    className="file-menu-item"
                                    onClick={handleDownloadClick}
                                    disabled={disabled}
                                >
                                    <Icon
                                        src={CloudDowloadArrow}
                                        alt="download"
                                    />
                                    <p>Скачать</p>
                                </MyButton>
                                {onDelete && (
                                    <MyButton
                                        className="file-menu-item"
                                        onClick={handleDeleteClick}
                                        disabled={disabled}
                                    >
                                        Удалить
                                    </MyButton>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    },
);

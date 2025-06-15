"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUserFiles } from "@/shared/lib/hooks/useUserFiles";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { FileItem } from "@/shared/ui/FileComp";
import "./FilesPage.scss";
import { useSelector } from "react-redux";
import { downloadFile } from "@/shared/api/filesAPI";

const FilesPage = () => {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q") || "";
    const userId = useSelector((state) => state.user.user?.id);
    const { files, loading } = useUserFiles(userId);

    const [filteredFiles, setFilteredFiles] = useState([]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredFiles(
                files.filter(
                    (file) =>
                        file.original_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        (file.assignmentTitle &&
                            file.assignmentTitle
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())),
                ),
            );
        } else {
            setFilteredFiles(files);
        }
    }, [files, searchQuery]);

    const handleDownload = async (fileId, fileName) => {
        try {
            await downloadFile({ fileId, fileName });
        } catch (error) {
            console.error("Ошибка скачивания файла:", error);
            alert("Не удалось скачать файл");
        }
    };

    if (loading) return <ClockLoader className="files__loading" />;

    return (
        <div className="files">
            <div className="files__list">
                {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => (
                        <div key={file.id} className="files__item">
                            <FileItem
                                fileUrl={file.file_url}
                                fileName={file.original_name}
                                additionalInfo={file.assignmentTitle}
                                onDownload={() =>
                                    handleDownload(file.id, file.original_name)
                                }
                                showDownloadButton={false}
                            />
                        </div>
                    ))
                ) : (
                    <p className="files__empty">
                        {searchQuery ? "Файлы не найдены" : "Нет файлов"}
                    </p>
                )}
            </div>
        </div>
    );
};

export { FilesPage };

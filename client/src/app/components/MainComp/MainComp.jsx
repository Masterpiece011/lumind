"use client";

import React from "react";
import { HeaderComp } from "../HeaderComp";
import Link from "next/link";
import * as styles from "./MainComp.module.scss";
import { useRouter } from "next/navigation";

const MainComp = () => {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <header>
                <HeaderComp />
            </header>
            <div className={styles.mainContent}>
                <aside className={styles.sidebar}>
                    <ul>
                        <li>
                            <Link href="/teams">Команды</Link>
                        </li>
                        <li>
                            <Link href="/assignments">Задания</Link>
                        </li>
                        <li>
                            <Link href="/notifications">Уведомления</Link>
                        </li>
                    </ul>
                </aside>
                <section className={styles.pageContent}>
                    {router.pathname === "/teams" && <TeamsPage />}
                </section>
            </div>
        </div>
    );
};

export { MainComp };

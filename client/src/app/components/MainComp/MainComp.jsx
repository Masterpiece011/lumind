import React from "react";
import { HeaderComp } from "../HeaderComp";
import * as styles from "./MainComp.module.scss";

function MainComp() {
    return (
        <div className={styles.container}>
            <header>
                <HeaderComp />
            </header>
        </div>
    );
}

export { MainComp };

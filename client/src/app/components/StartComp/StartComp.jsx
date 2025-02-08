import React from "react";
import Image from "next/image";
import * as styles from "./StartComp.module.scss";
import { MyButton } from "../uikit";
import { HeaderComp } from "../HeaderComp/HeaderComp";

function StartComp() {
    return (
        <div className={styles.container}>
            <header>
                <HeaderComp />
            </header>
        </div>
    );
}

export { StartComp };

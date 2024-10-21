import React from "react"
import { HeaderComp } from '../components/HeaderComp/HeaderComp';
import { URLS } from "../routes"

export default function Page() {
    return (
        <div>
            <h1>Hello, Test page!</h1>
            <HeaderComp />
            <a href={URLS.MAIN_URL}>Перейти на главную</a>
        </div>
    )
}
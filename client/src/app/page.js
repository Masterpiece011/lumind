import { MainComp } from "./components/MainComp";
import { HeaderComp } from "./components/HeaderComp";
import { URLS } from "./routes";
import { FooterComp } from "./components/FooterComp";

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <header>
                <HeaderComp></HeaderComp>
                <div>
                    <a href={URLS.TEST_URL}>Перейти на тест</a>
                </div>
                <a href={URLS.MAIN_URL}>Перейти на главную</a>
                <a href={URLS.DASHBOARD_URL}>Перейти на Dashboard</a>
                <a href={URLS.DOCUMENTATION_URL}>Перейти к документации</a>
            </header>
            <main>
                <MainComp />
            </main>
            <footer>
                <FooterComp />
            </footer>
        </div>
    );
}

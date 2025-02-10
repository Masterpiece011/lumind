import { MainComp } from "./components/MainComp";
import { URLS } from "./routes";
import { FooterComp } from "./components/FooterComp";
import { StartComp } from "./components/StartComp";

export default function Home() {
    return (
        <div>
            <main>
                <StartComp />
            </main>
        </div>
    );
}

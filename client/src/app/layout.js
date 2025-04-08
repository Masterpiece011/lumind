import { Inter } from "next/font/google";
import "./scss/global.scss";
import ReduxProvider from "./store/ReduxProvider";
import AppRouter from "./Router/AppRouter";
import { ModalProvider } from "./components/uikit/UiModal/ModalProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    weight: ["200", "400", "500", "600", "700", "800"],
});

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <ReduxProvider>
                    <ModalProvider>
                        <AppRouter>{children}</AppRouter>
                    </ModalProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}

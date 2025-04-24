import { Inter } from "next/font/google";
import "@/shared/styles/global.scss";
import ReduxProvider from "./providers/Redux/ReduxProvider";
import AppRouter from "./providers/AppRouter/AppRouter";
import { ModalProvider } from "@/shared/uikit/UiModal/ModalProvider";
import { ThemeProvider } from "./providers/ThemeProvider/ThemeProvider";

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
                    <ThemeProvider>
                        <ModalProvider>
                            <AppRouter>{children}</AppRouter>
                        </ModalProvider>
                    </ThemeProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}

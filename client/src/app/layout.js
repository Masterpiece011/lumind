import "@/app/scss/global.scss";
import { Roboto } from "next/font/google";
import ReduxProvider from "./store/ReduxProvider";
import AppRouter from "./Router/AppRouter";

const roboto = Roboto({
    weight: "700",
    subsets: ["latin", "cyrillic"],
    display: "swap",
});

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={roboto.className}>
                <ReduxProvider>
                    <AppRouter>{children}</AppRouter>
                </ReduxProvider>
            </body>
        </html>
    );
}

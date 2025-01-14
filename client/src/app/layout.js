import "./globals.css";
import { Roboto } from "next/font/google";
import ReduxProvider from "./store/ReduxProvider";

const roboto = Roboto({
    weight: "700",
    subsets: ["latin", "cyrillic"],
    display: "swap",
});

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={roboto.className}>
                <ReduxProvider>{children}</ReduxProvider>
            </body>
        </html>
    );
}

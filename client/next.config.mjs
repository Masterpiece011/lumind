/** @type {import('next').NextConfig} */
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const nextConfig = {
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: "css-loader",
                    options: { sourceMap: true },
                },
                {
                    loader: "sass-loader",
                    options: { sourceMap: true },
                },
            ],
        });

        config.plugins.push(
            new MiniCssExtractPlugin({
                filename: "static/css/[name].[contenthash].css",
            }),
        );

        return config;
    },
};

export default nextConfig;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import sharp from "sharp";

dotenv.config();

/**
 * Load vars
*/
let browserPromise;
const API_SECRET = process.env.API_SECRET || "";
const PORT = process.env.PORT || 8080;
const app = express();

app.use( express.json( { limit: "50mb" } ) ); 
app.use( express.urlencoded({ extended: true }) );
app.use( cors() );

/**
 * Verify API key
*/
app.use((req, res, next) => {
    const apiKey = req.headers[ "x-api-key" ];
    if ( apiKey !== API_SECRET ) {
        return res.status(403).json({ 
            status: "error",
            message: "Unauthorized",
            data: {}
        });
    }
    next();
});

/**
 * Kill zombie process
*/
process.on( "SIGINT", async () => {
    if (browserPromise) {
        const browser = await browserPromise;
        await browser.close();
    }
    process.exit(0);
});

/**
 * Load browser
*/
async function getBrowser() {
    if (!browserPromise) {
        browserPromise = puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
    }
    return browserPromise;
}

/**
 * Middleware
*/
app.use((req, res, next) => {
    if ( req.method !== "GET" && !req.headers["content-type"]?.includes("application/json") ) {
        return res.status(415).json({
            status: "error",
            message: "Content-Type must be application/json",
            data: {}
        });
    }
    next();
});

/**
 * Load SVG to PNG Endpoint
*/
app.post( "/svg", async (req, res) => {

    try {

        const { svg, width, height, background } = req.body;

        if ( !svg || typeof svg !== "string" ) {
            return res.status(400).json({
                status: "error",
                message: "SVG code is required",
                data: {}
            });
        }

        const finalWidth  = Number(width)  || 512;
        const finalHeight = Number(height) || 512;

        const buffer = Buffer.from(svg);

        const image = sharp(buffer, { density: 300 })
            .resize(finalWidth, finalHeight, {
                fit: "contain"
            });

        if (background && background !== "transparent") {
            image.flatten({ background });
        }

        const pngBuffer = await image.png().toBuffer();
        const base64 = pngBuffer.toString("base64");

        return res.status(200).json({
            status: "success",
            data: {
                mime: "image/png",
                width: finalWidth,
                height: finalHeight,
                image: base64
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "SVG conversion failed",
            data: {}
        });
    }

});

/**
 * Load HTML to PNG Endpoint
*/
app.post( "/poster", async (req, res) => {

    const startTime = Date.now();
    let browser;
    let page;

    res.setHeader("X-Render-Engine", "puppeteer");
    res.setHeader("X-Render-Time", Date.now() - startTime);

    try {

        const {
            html,
            width = 1200,
            height = 1600,
            deviceScaleFactor = 2,
            background = true
        } = req.body;

        if (!html || typeof html !== "string") {
            return res.status(400).json({
                status: "error",
                message: "HTML is required",
                data: {}
            });
        }

        browser = await getBrowser();
        page = await browser.newPage();

        page.setDefaultNavigationTimeout(10_000);
        page.setDefaultTimeout(10_000);

        await page.setJavaScriptEnabled(false);

        await page.setViewport({
            width: Number(width),
            height: Number(height),
            deviceScaleFactor: Number(deviceScaleFactor)
        });
        
        await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: 10_000
        });

        const buffer = await page.screenshot({
            type: "png",
            fullPage: false,
            omitBackground: !background
        });

        const base64 = buffer.toString("base64");

        return res.status(200).json({
            status: "success",
            data: {
                mime: "image/png",
                width,
                height,
                image: base64
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "HTML rendering failed",
            data: {}
        });

    } finally {
        if (page) await page.close();
    }

});

/**
 * Middleware
*/
app.use((err, req, res, next) => {

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            status: "error",
            message: "Invalid JSON syntax",
            data: {}
        });
    }

    return res.status(500).json({
        status: "error",
        message: "Internal server error",
        data: {}
    });

});

app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "REST route not found",
        data: {}
    });
});

/**
 * Load API
*/
app.listen( PORT, () => console.log( `Focusposters API running on port ${PORT}` ) );
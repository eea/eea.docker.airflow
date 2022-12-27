const express = require('express')
const app = express()
const port = 3000
const puppeteer = require('puppeteer')

const fs = require('fs')
const fp = require('path')
const screenshotDir = '/tmp/screenshot/'
const pdfDir = '/tmp/pdf/'
const hbs = require('express-hbs')
const mustache = require('mustache')

// request header
// User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Firefox/77.0
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Firefox/77.0'
// need to add this header for some request
// Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
// const accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
// Accept-Language: en-US,en;q=0.5
// const acceptLang = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
// Accept-Encoding: gzip, deflate, br
// const acceptEncoding = 'gzip, deflate, br'
// Upgrade-Insecure-Requests: 1
// Connection: keep-alive

let browser

(async () => { 
    browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: [
            "--no-sandbox",
            "--disable-gpu",
        ]
    }); 
    fs.mkdir(screenshotDir, { recursive: true }, (err) => {
        if (err) throw err;
    });
    console.log("screenshot dir created")
    fs.mkdir(pdfDir, { recursive: true }, (err) => {
        if (err) throw err;
    });
    console.log("pdf dir created")
    
})();

function relative(path) {
    return fp.join(__dirname, path);
}

app.use(express.json());

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static(relative('public')));

app.get('/', (req, res) => {
    res.send('headless chrome api is ready to serve')
}) 

app.get('/generate/:template', (req, res) => {
    const template = req.params.template
    const data = req.query;
    console.log(data)
    try {
        var content = fs.readFileSync(relative('templates/' + template), 'utf8');
        const html = mustache.render(content, data)
        res.send(html)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})


app.post('/content', async (req, res) => {
    const url = req.body.url
    var raw = req.body.raw
    const js = req.body.js
    try {
        if (url) {
            console.log('open: ' + url)
            const {html, status} = await ssr(url, js)
            if (raw) {
                res.status(status).send(html)
            } else {
                res.status(status).json(html)
            }
        } else {
            res.status(400).send("missing input value")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})

app.post('/screenshot', async (req, res) => {
    const url = req.body.url
    const js = req.body.js
    let ext
    if (req.body.ext) {
        ext = req.body.ext
    } else {
        ext = 'png'
    }
    const date = Date.now()
    let screenshotData = {
        path: screenshotDir + date + '.' + ext
    }
    try {
        if (url) {
            console.log('open for screenshot: ' + url)
            const context = await browser.createIncognitoBrowserContext();
            const { page } = await loadPage(context, url, js)
            await page.screenshot(screenshotData)
            page.close()
            context.close()
            const filename = screenshotData.path
            res.sendFile(filename)
            res.on('finish', function() {
                removeFile(filename)
            });
        } else {
            res.status(400).send("missing input value")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }  
})

app.post('/pdf', async (req, res) => {
    const url = req.body.url
    const js = req.body.js
    const date = Date.now()
    var landscape = req.body.landscape
    
    let pdfData = {
        path: pdfDir + date + '.pdf',
        format: 'A4',
        landscape: landscape
    }
    try {
        if (url) {
            console.log('open for screenshot: ' + url)
            const context = await browser.createIncognitoBrowserContext();
            const { page } = await loadPage(context, url, js)
            await page.pdf(pdfData)
            page.close()
            context.close()
            const filename = pdfData.path
            res.sendFile(filename)
            res.on('finish', function() {
                removeFile(filename)
            });
        } else {
            res.status(400).send("missing input value")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    } 
})

function removeFile(filename) {
    fs.unlink(filename, (err) => {
        if (err) throw err;
        console.log('file deleted :' + filename);
    });
}

async function loadPage(context, url, js = false) {
    const page = await context.newPage();
    let status;
    await page.setUserAgent(userAgent);
//    page.setExtraHTTPHeaders({
//        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//        'Accept-Language': 'en-US,en;q=0.5'
//    });
    if (js) {
        page.setJavaScriptEnabled(true)
        const resp = await page.goto(url, { waitUntil: 'networkidle0' });
        status = resp.status();
    } else {
        const resp = await page.goto(url);
        status = resp.status();
    }
    console.log(await page.title())
    return {page:page, status:status}
}

async function ssr(url, js = false) {
    const { page, status } = await loadPage(browser, url, js)
    const html = await page.content(); // serialized HTML of page DOM.
    page.close()
    return {html:html, status: status};
}


app.listen(port, () => {
    console.log(`Headless chrome api listening on port ${port}!`)
})

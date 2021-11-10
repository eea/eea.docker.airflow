# HEADLESS CHROME HEADLESS
Based on https://github.com/mailtarget/headless-chrome-api

Is docker image to get html content of url for server side rendering using puppeteer, a chrome headless java script wrapper.

### Usage

    docker run -p 3000:3000 eeacms/headless-chrome-api


    POST http://localhost:3000/content

    {
        "url": "https://www.eea.europa.eu/",
        "js": true // default false
        "raw": true //default false
    }



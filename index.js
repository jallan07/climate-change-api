const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const newspapers = require('./sources')
const PORT = process.env.PORT || 9090
const app = express()

const articles = []

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text().trim()
                const url = $(this).attr('href')
                const fullUrl = url.includes('http') ? url : `${newspaper.base}${url}`
                articles.push({ title, fullUrl, source: newspaper.name })
            })
        })
        .catch(err => console.log(err))
})

// scrap a single webpage and store any climate-related articles in our articles array
app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].base
    const newspaperName = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].name
    
    axios.get(newspaperAddress)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []
            
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text().trim()
                const url = $(this).attr('href')
                const fullUrl = url.includes('http') ? url : `${newspaperBase}${url}`
                specificArticles.push({ 
                    title, 
                    fullUrl, 
                    source: newspaperName 
                })
            })
            res.json(specificArticles)
        })
        .catch(err => console.log(err))
})

// set the routes
app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API')
})




// set express to listen on our port
app.listen(PORT, () => console.log(`Server running »» http://localhost:${PORT}`))
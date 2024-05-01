const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';
 
app.get('/', (req, res) => {
    axios.get(url).then((response) => {
        if(response.status === 200){
            const html = response.data;
            const $ = cheerio.load(html);
            const dataLinks = []
            const promises = [];

            $('#mw-pages a').each((index, element) => {
                const link = $(element).attr('href');
                const promise = scrappingLink(link).then((dataLink)=>{
                    dataLinks.push(dataLink)
                })

                promises.push(promise);
            })

            Promise.all(promises).then(() => {
                console.log(dataLinks)
                res.send(dataLinks);
            });

        };
    });
});


function scrappingLink(link){
    const url = `https://es.wikipedia.org${link}`;

    return new Promise((resolve) => {
        axios.get(url).then((response) => {
            if(response.status === 200){
                const html = response.data;
                const $ = cheerio.load(html);

                const pageTitle = $('title').text();

                const imgs = [];
                $('img').each((index, element) => {
                    const img = $(element).attr('src');
                    imgs.push(img);
                });

                const parags = [];
                $('p').each((index, element) => {
                    const p = $(element).text();
                    parags.push(p);
                });

                const dataLink = {
                    title: pageTitle,
                    images: imgs,
                    text: parags,
                }

                resolve(dataLink);
            };
        })
    });
};


app.listen(3000, () => {
    console.log('express está escuchando el puerto http://localhost:3000');
});
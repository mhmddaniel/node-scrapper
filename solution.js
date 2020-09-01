
const promise = require('bluebird');
const superagent = promise.promisifyAll(require('superagent'));
const cheerio = promise.promisifyAll(require('cheerio'));
const fs = require('fs');

let base_url = 'https://www.cermati.com';
superagent.getAsync(base_url + '/artikel').then((res) => {

    const $ = cheerio.load(res.res.text);

    let articles = [];

    $('div.article-list-item').each(function (i, elem) {
        const child = cheerio.load($(this).html());
        const link = child('a').attr("href");


        superagent.getAsync(base_url + link).then((article) => {

            const content = cheerio.load(article.res.text);

            const url = link;
            const title = content('h1.post-title').text().trim();
            const author = content('span.author-name').text().trim();
            const postingDate = content('span.post-date').text().trim();

            let relatedArticles = [];

            content('ul.panel-items-list').each(function (idx, item) {
                const related = cheerio.load($(this).html());
                const new_link = related('a').attr("href");
                const new_title = related('h5.item-title').text().trim();
                relatedArticles.push(
                    {
                        url: new_link,
                        title: new_title
                    });
            });

            let obj = {
                url: url,
                title: title,
                author: author,
                postingDate: postingDate,
                relatedArticles: relatedArticles
            };

            articles.push(obj);

            const dump_json = JSON.stringify({ articles: articles }, null, 4);

            fs.writeFile('solution.json', dump_json, (err) => {
                if (err) {
                    throw err;
                }
            });

        });
    });

    // console.log(JSON.stringify(articles));


}).catch(console.error);
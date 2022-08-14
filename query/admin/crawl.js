const pool = require("../../database");
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router()
const moment = require('moment')
const axios = require("axios");
const cheerio = require("cheerio");

router.get('/crawl', (req, res) => {
    const url = "http://rkjewellersspot.in/Liverate.html";

    // let body = req.body;
    let body = req.query;
    async function scrapeData() {
        try {
            // Fetch HTML of the page we want to scrape
            const { data } = await axios.get(url);
            // Load HTML we fetched in the previous line
            const $ = cheerio.load(data);
            console.log("data", data)
            // Select all the list items in plainlist class
            const listItems = $("h5 .h .e");
            // Stores data for all countries
            const countries = [];
            // Use .each method to loop through the li we selected
            // console.log("listItems", listItems)
            listItems.each((idx, el) => {
                // console.log("el", el)
                // Object holding data for each country/jurisdiction
                const country = { name: "", iso3: "" };
                // Select the text content of a and span elements
                // Store the textcontent in the above object
                country.name = $(el).children("a").text();
                country.iso3 = $(el).children("span").text();
                // Populate countries array with country data
                countries.push(country);
            });
            // Logs countries array to the console
            // console.log("countries", countries);
            return res.status(200).json({
                success: true,
                messagecode: 101,
                message: "records",
                data: countries,
            });
            // Write countries array in countries.json file
            // fs.writeFile("coutries.json", JSON.stringify(countries, null, 2), (err) => {
            //     if (err) {
            //         console.error(err);
            //         return;
            //     }
            //     console.log("Successfully written data to file");
            // });
        } catch (err) {
            console.error(err);
        }
    }
    // const submit = async () => {
    //     return res.status(200).json({
    //         success: true,
    //         messagecode: 101,
    //         message: "records",
    //         data: data,
    //     });
    // let sql = `SELECT * FROM gmb_trans AS GT INNER JOIN gmb_user AS GU ON GT.userid = GU.id INNER JOIN gmb_stock_list AS GSL ON GSL.id = GT.stockid where GU.id = ${body.id}`
    // pool.query(
    //   sql,
    //   async function (err, data) {
    //     if (err) {
    //       return res.status(442).json({
    //         success: false,
    //         messagecode: 442,
    //         message: err,
    //       });
    //     } else {
    //       console.log("data", data)
    //       return res.status(200).json({
    //         success: true,
    //         messagecode: 101,
    //         message: "records",
    //         data: data,
    //       });
    //     }
    //   }
    // )
    scrapeData()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


module.exports = router
const pool = require("../../database");
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router()
const moment = require('moment')


router.get('/gmb_admin_login', (req, res) => {
  // let body = req.body;
  let body = req.query;
  const submit = async () => {
    let sql = `SELECT * FROM gmb_admin WHERE name = '${body.name}' and password = '${body.password}'`
    pool.query(
      sql,
      async function (err, data) {
        if (err) {
          return res.status(442).json({
            success: false,
            messagecode: 442,
            message: err,
          });
        } else {
          return res.status(200).json({
            success: true,
            messagecode: 101,
            message: "records",
            records: data,
          });
        }
      }
    )

  }
  submit()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})


module.exports = router
const pool = require("../../database");
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router()
const moment = require('moment')

router.post('/contact', (req, res) => {
  let body = req.body;
  const submit = async () => {

    if (body.action === "INSERT") {
      pool.query(
        `INSERT INTO contact ( name, cnumber, frim, msg ) 
              VALUES ( '${body.name}', '${body.cnumber}', '${body.frim}', '${(body.msg)}');`,
        async function (err, data) {
          if (data && data.affectedRows) {
            return res.status(200).json({
              success: true,
              messagecode: 101,
              message: "record added",
            });
          }
          if (err) {
            return res.status(200).json({
              success: false,
              messagecode: 440,
              message: err.sqlMessage
            });
          }
        }
      );
    } else if (body.action === "DELETE") {
      pool.query(
        `DELETE FROM contact WHERE id=${body.id};`,
        async function (err, data) {
          if (data && data.affectedRows) {
            // res.send(req.files)
            return res.status(200).json({
              success: true,
              messagecode: 101,
              message: "record updated",
            });
          }
          if (err) {
            return res.status(200).json({
              success: false,
              messagecode: 440,
              message: err.sqlMessage
            });
          }
        }
      );
    }
  }
  submit()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.get('/contact', (req, res) => {
  let body = req.body;
  const submit = async () => {
    let sSQL;
    // let sSQL = `SELECT name, userid, k_user_bill.id, SUM(k_user_bill.debit)as totaldbt, SUM(k_user_bill.credit) as totalcrdt, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill INNER JOIN k_user ON k_user.id = k_user_bill.userid GROUP BY k_user.id`;
    sSQL = `SELECT *  FROM contact`;
    pool.query(
      sSQL,
      async function (err, data) {
        if (err) {
          return res.status(200).json({
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
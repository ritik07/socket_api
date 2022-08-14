const pool = require("../../database");
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router()
const moment = require('moment')



router.post('/kuser', (req, res) => {
  let body = req.body;
  console.log("body", body)
  const submit = async () => {
    if (body.action === "INSERT") {
      pool.query(
        `SELECT COUNT(*) AS cnt FROM k_user WHERE name = '${body.name}'`,
        async function (err, data) {
          if (data && data[0].cnt > 0) {
            return res.status(200).json({
              success: false,
              messagecode: 442,
              message: "name already exist",
            });
          } else {
            pool.query(
              `INSERT INTO k_user ( name ) VALUES ( '${body.name}')`,
              async function (err, data) {
                if (data && data.affectedRows) {
                  console.log("Employee Id:- " + data.insertId);
                  pool.query(
                    `INSERT INTO k_user_bill ( userid, debit, credit, created_at ) 
                          VALUES ( ${data.insertId}, ${body.debit ? body.debit : 0}, ${body.credit ? body.credit : 0}, '${moment().subtract(1, 'days').format("YYYY-MM-DD")}');`,
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
                          messagecode: 99,
                          message: "error",
                        });
                      }
                    }
                  );
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
      )
    } else if (body.action === "UPDATE") {
      pool.query(
        `SELECT COUNT(*) AS cnt FROM k_user WHERE name = '${body.name}' and id!=${body.id}`,
        async function (err, data) {
          if (data && data[0].cnt > 0) {
            return res.status(200).json({
              success: false,
              messagecode: 442,
              message: "name already exist",
            });
          } else {
            pool.query(
              `Update k_user SET name='${body.name}' WHERE id=${body.id};`,
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
                  eCode = 440;
                  valid = false
                  eMsg = err.sqlMessage;
                  console.log("err", err)
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
      )
    }
  }
  submit()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})



router.get('/kuser', (req, res) => {
  let body = req.body;
  const submit = async () => {
    let sSQL = `Select * from k_user `;
    if (body.id > 0) sSQL = sSQL + `where id=${id}`;
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

module.exports = router
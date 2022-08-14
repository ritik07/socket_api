const pool = require("../../database");
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router()
const moment = require('moment')


router.post('/kuserbill', (req, res) => {
  let body = req.body;
  const submit = async () => {

    if (body.action === "INSERT") {
      pool.query(
        `INSERT INTO k_user_bill ( userid, debit, credit, created_at, type ) 
              VALUES ( ${body.userid}, ${body.debit}, ${body.credit}, '${moment(body.created_at).format("YYYY-MM-DD")}','${body.type}');`,
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
    } else if (body.action === "UPDATE") {
      pool.query(
        `Update k_user_bill SET 
        created_at='${body.date}',
        debit=${body.debit}, 
        credit=${body.credit} WHERE id=${body.id};`,
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
    else if (body.action === "DELETE") {
      pool.query(
        `DELETE FROM k_user_bill WHERE id=${body.id};`,
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


// SELECT name, SUM(k_user_bill.debit)as totaldbt, SUM(k_user_bill.credit) as totalcrdt, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill INNER JOIN k_user ON k_user.id = k_user_bill.userid and created_at >= '2021-11-21' and created_at <= '2021-11-22' GROUP BY k_user.id

router.get('/kuserbill', (req, res) => {
  let body = req.body;
  const submit = async () => {
    let sSQL;
    // let sSQL = `SELECT name, userid, k_user_bill.id, SUM(k_user_bill.debit)as totaldbt, SUM(k_user_bill.credit) as totalcrdt, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill INNER JOIN k_user ON k_user.id = k_user_bill.userid GROUP BY k_user.id`;
    sSQL = `SELECT *, SUM(credit) as todayscredit, SUM(debit) as todaysdebit  FROM k_user_bill INNER JOIN k_user ON k_user.id = k_user_bill.userid where created_at='${req.query.date}' GROUP BY k_user_bill.userid`;
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

router.get('/userclosingbalance', (req, res) => {
  let body = req.body;
  const submit = async () => {
    'SELECT (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill where userid = 2 GROUP BY userid'
    let sSQL = `SELECT (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill where userid = ${req.query.userid} GROUP BY userid`;
    // if (req.params.body.fromdate) {
    //   let from = req.params.body.fromdate;
    //   let to = req.params.body.todate
    //   sSQL = `SELECT name, SUM(k_user_bill.debit)as totaldbt, SUM(k_user_bill.credit) as totalcrdt, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill INNER JOIN k_user ON k_user.id = k_user_bill.userid and created_at >= ${from} and created_at <= ${to} GROUP BY k_user.id`;
    // }
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

router.get('/userclosingbalancetillyest', (req, res) => {
  let body = req.body;
  const submit = async () => {
    // SELECT (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill where created_at < '2021-11-27' GROUP BY userid
    let sSQL
    if (req.query.userid) {
      sSQL = `SELECT (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill where userid = ${req.query.userid} and created_at < '${moment(req.query.date).subtract(1, 'days').format("YYYY-MM-DD")}'`;
    }
    else if (req.query.date !== moment().format("YYYY-MM-DD")) {
      sSQL = `SELECT userid, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill where created_at <= '${moment(req.query.date).subtract(1, 'days').format("YYYY-MM-DD")}' GROUP BY userid`;
    } else {
      sSQL = `SELECT userid, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill where created_at <= '${moment().subtract(1, 'days').format("YYYY-MM-DD")}' GROUP BY userid`;
    }
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

router.get('/allcb', (req, res) => {
  let body = req.body;
  const submit = async () => {
    // SELECT (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill where created_at < '2021-11-27' GROUP BY userid

    if (req.query.date !== moment().format("YYYY-MM-DD")) {
      sSQL = `SELECT userid, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill where created_at <='${moment(req.query.date).subtract(1, 'days').format("YYYY-MM-DD")}' GROUP BY userid`;
    } else {
      sSQL = `
      SELECT userid, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill WHERE created_at <= '${moment().subtract(1, 'days').format("YYYY-MM-DD")}' GROUP BY userid`;
    }
    console.log("final sql", sSQL)
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



//userser data group by user having net amount

//SELECT name, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill INNER JOIN k_user ON k_user.id = k_user_bill.userid and created_at = '2021-11-29' GROUP BY k_user.id

router.get('/userlist', (req, res) => {
  let body = req.body;
  const submit = async () => {
    // SELECT (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill where created_at < '2021-11-27' GROUP BY userid
    // sSQL = `SELECT * FROM k_user GROUP BY id ORDER BY name ASC`;
    sSQL = `SELECT name, k_user.id, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS netamt FROM k_user_bill INNER JOIN k_user ON k_user.id = k_user_bill.userid WHERE created_at <= '${req.query.date}' GROUP BY k_user.id`
    // if (req.query.date !== moment().format("YYYY-MM-DD")) {
    //   sSQL = `SELECT userid, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill where created_at <='${moment(req.query.date).subtract(1, 'days').format("YYYY-MM-DD")}' GROUP BY userid`;
    // } else {
    //   sSQL = `
    //   SELECT userid, (SUM(k_user_bill.credit)-SUM(k_user_bill.debit)) AS closingbalance FROM k_user_bill WHERE created_at <= '${moment().subtract(1, 'days').format("YYYY-MM-DD")}' GROUP BY userid`;
    // }
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


router.get('/completebalance', (req, res) => {
  let body = req.body;
  const submit = async () => {
    console.log("req.query.from", req.query.from)
    console.log("req.query.to", req.query.to)
    console.log("req.query.to && req.query.from", req.query.to && req.query.from)
    if (req.query.to !== "no") {
      sSQL = `SELECT * FROM k_user INNER JOIN k_user_bill ON k_user_bill.userid = k_user.id WHERE k_user.id = ${req.query.userid} and created_at = '${req.query.to}' and created_at <= '${req.query.from}' ORDER by k_user_bill.created_at desc`;
    } else {
      sSQL = `SELECT * FROM k_user INNER JOIN k_user_bill ON k_user_bill.userid = k_user.id WHERE k_user.id = ${req.query.userid} ORDER by k_user_bill.created_at desc`;
    }
    console.log("sSQL", sSQL)
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



router.get('/todaydebit', (req, res) => {
  let body = req.body;
  const submit = async () => {
    sSQL = `SELECT userid, debit, name, credit, k_user_bill.id FROM k_user INNER JOIN k_user_bill ON k_user_bill.userid = k_user.id WHERE created_at = '${req.query.date}' and debit > 0 ORDER by k_user_bill.created_at ASC`;
    console.log("sSQL", sSQL)
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

router.get('/todaycredit', (req, res) => {
  let body = req.body;
  const submit = async () => {
    sSQL = `SELECT userid, credit, name, credit, k_user_bill.id FROM k_user INNER JOIN k_user_bill ON k_user_bill.userid = k_user.id WHERE created_at = '${req.query.date}' and credit > 0 ORDER by k_user_bill.created_at ASC`;
    console.log("sSQL", sSQL)
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
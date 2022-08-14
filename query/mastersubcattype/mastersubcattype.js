const pool = require("../../database");
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router()

const imageStorage = multer.diskStorage({
  destination: 'images', // Destination to store image 
  filename: (req, file, cb) => {
    let tempDate = Date.now();
    let dbImageName = file.fieldname + '_' + tempDate + path.extname(file.originalname)
    // console.log("dbImageName", dbImageName)
    cb(null, dbImageName)
    // file.fieldname is name of the field (image), path.extname get the uploaded file extension
  }
});


const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000   // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {     // upload only png and jpg format
      return cb(new Error('Please upload a Image'))
    }
    cb(undefined, true)
  }
})

// For Single image upload
// router.post('/imastersubcat', imageUpload.single('image'), (req, res) => {
//     res.send(req.file)
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })

// For Multiple image uplaod
router.post('/imastersubcattype', imageUpload.fields([{
  name: 'mainimage', maxCount: 6
}, {
  name: 'images', maxCount: 10
}]), (req, res) => {
  let body = req.body;
  let tempImages = []
  req.files.images.map((data) => {
    tempImages.push(data.filename)
  })

  let tempMainImage = [];
  req.files.mainimage.map((bannerdata) => {
    tempMainImage.push(bannerdata.filename)
  });
  const submit = async () => {
    if (body.action === "insert") {
      pool.query(
        `SELECT COUNT(*) AS cnt FROM g_master_subcategory_type WHERE name = '${body.name}'`,
        async function (err, data) {
          if (data && data[0].cnt > 0) {
            valid = false;
            eCode = 442;
            eMsg = "Name already exist"
            return res.status(200).json({
              success: false,
              messagecode: 442,
              message: "name already exist",
            });
          } else {
            pool.query(
              `INSERT INTO g_master_subcategory_type ( name, images, mainimage, subcatid ) 
              VALUES ( '${body.name}', '${tempImages}', '${tempMainImage}', ${body.subcatid});`,
              async function (err, data) {
                if (data && data.affectedRows) {
                  // res.send(req.files)
                  return res.status(200).json({
                    success: true,
                    messagecode: 101,
                    message: "record added",
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
    } else if (body.action === "update") {
      pool.query(
        `SELECT COUNT(*) AS cnt FROM g_master_subcategory_type WHERE name = '${body.name} and id !=${body.id}'`,
        async function (err, data) {
          if (data && data[0].cnt > 0) {
            valid = false;
            eCode = 442;
            eMsg = "Name already exist"
            return res.status(200).json({
              success: false,
              messagecode: 442,
              message: "name already exist",
            });
          } else {
            pool.query(
              `Update g_master_subcategory_type SET 
              name='${body.name}',images='${tempImages.toString()}', images='${tempMainImage}', subcatid=${body.subcatid}, mainimage=${tempMainImage}
              WHERE id=${body.id};`,
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


router.get('/imastersubcattype', (req, res) => {
  const submit = async () => {
    pool.query(
      `SELECT * FROM g_master_subcategory_type`,
      async function (err, data) {
        console.log("here", err)
        if (data) {
          return res.status(200).json({
            status: true,
            messagecode: 101,
            data: data,
            message: "fetched",
          });
        } else {
          return res.status(200).json({
            status: false,
            messagecode: 442,
            message: "error",
          });
        }
      }
    )
  }
  submit()
})

module.exports = router
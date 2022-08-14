const pool = require("../../database");

exports.loginUser = async (data, callback) => {
  const email = data.email === undefined ? "" : data.email;
  const password = data.password === undefined ? "" : data.password;

  let valid = true,
    eMsg = "Record Added successfully",
    eCode = 101;

  if (email === "" || password === "") {
    valid = false;
    eMsg = "Email or password cannot be empty!"
    eCode = 901
  }

  if (valid) {
    await pool.query(
      `SELECT COUNT(*) AS cnt FROM ratna_users WHERE email = '${email}' and password = '${password}'`,
      async function (err, data) {
        if (data[0].cnt > 0) {
          eCode = 101;
          eMsg = "Logged in!!!"
        } else {
          valid = false;
          eMsg = "Email or password wrong, please check again!"
          eCode = 903
        }
        return callback(eMsg, eCode);
      }
    )
  }
};

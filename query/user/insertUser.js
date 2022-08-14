const pool = require("../../database");

exports.insertUser = async (data, callback) => {
  const email = data.email === undefined ? "" : data.email;
  const password = data.password === undefined ? "" : data.password;
  const name = data.name === undefined ? "" : data.name;
  const number = data.number === undefined ? 0 : data.number;


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
      `SELECT COUNT(*) AS cnt FROM ratna_users WHERE email = '${email}'`,
      async function (err, data) {
        if (data[0].cnt > 0) {
          valid = false;
          eCode = 902;
          eMsg = "Email Already exist"
        } else {
          await pool.query(
            `INSERT INTO ratna_users ( email, password, name, number ) VALUES ( '${email}', '${password}', '${name}', ${number}  );`
          );
        }
        return callback(eMsg, eCode);
      }
    )
  }
};

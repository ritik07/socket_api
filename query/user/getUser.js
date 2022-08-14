const pool = require("../../database");

exports.getUser = async (data, callback) => {
  const id = data.id === undefined ? 0 : data.id;
  let valid = true,
    eCode = "All Record Found",
    eMsg = 100;

  let sSQL = `Select * from ratna_users `;
  if (id > 0) sSQL = sSQL + `where id=${id}`;

  try {
    pool.query(sSQL, (err, result) => {
      if (err) {
        return callback(1000, err.toString(), null);
      } else {
        if (result.length > 0)
          return callback(eMsg, eCode, result);
        else return callback(99, "No Record Found", result);
      }
    });
  } catch (e) {
    valid = false;
    eCode = e.toString();
    eMsg = 1000;
    return callback(eMsg, eCode, null);
  }
};

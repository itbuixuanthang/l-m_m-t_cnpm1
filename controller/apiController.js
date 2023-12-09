const pool = require("../model/connectDB");

let GET_DeleteUser = async (req, res) => {
  res.json("get delete user");
};

let getAllusers = async (req, res) => {
  console.log("get all");
  const [rows, fields] = await pool.execute("SELECT * FROM `datausers`");
  res.status(200).json({
    message: "eric",
    data: rows,
  });
};

let getOneUser = async (req, res) => {
  const idUser = req.params.id;
  const [rows, fields] = await pool.execute(
    "SELECT * FROM `datausers` WHERE id = ?",
    [idUser]
  );

  const result = rows.length === 0 ? "id không tồn tại , err client" : rows;

  console.log(result);
  res.status(200).json({
    data: result,
  });
};

let CreateUser = async (req, res) => {
  let username = req.body.UserName;
  let password = req.body.PassWord;
  let confirmpassword = req.body.ConfirmPassWord;
  let email = req.body.Email;

  console.log("create user");
  if (password !== confirmpassword) {
    return res.json("không khớp mật khẩu");
  }

  if (!username || !confirmpassword || !password || !email) {
    return res.status(200).json("không để trống các trường dữ liệu");
  }
  const [rows, fields] = await pool.execute(
    "INSERT INTO datausers(username,password,email,admin) VALUES(?,?,?,?)",
    [username, password, email, 0]
  );
  res.status(200).json("tạo thành công ");
};

let UpdateUser = async (req, res) => {
  let username = req.body.UserName;
  let password = req.body.PassWord;
  let email = req.body.Email;

  const idUser = req.params.id;
  const [users, fields] = await pool.execute(
    "SELECT * FROM `datausers` WHERE id = ?",
    [idUser]
  );

  if (users.length === 0) {
    return res.status(200).json("id không tồn tại , err client");
  }

  if (!username || !password || !email || !idUser) {
    console.log("rong du lieu");
    return res.status(200).json("không để trống các trường dữ liệu");
  }
  console.log("updata");
  const user = await pool.execute(
    "UPDATE datausers SET username = ? , email = ? , password = ? WHERE id = ?",
    [username, email, password, idUser]
  );
  res.status(200).json("update thành công ");
};

// category
let UpdateCategory = async (req, res) => {
  let name = req.body.name;
  let radio = req.body.radio;
  const idUser = req.params.id;
  const [users, fields] = await pool.execute(
    "SELECT * FROM `category` WHERE id = ?",
    [idUser]
  );
  if (users.length === 0) {
    return res.status(500).json("id không tồn tại , err client");
  }
  console.log(name, radio);
  if (name.length != 0 && radio.length != 0) {
    console.log("updata category ");
    const user = await pool.execute(
      "UPDATE category SET name = ? , status = ?  WHERE id = ?",
      [name, radio, idUser]
    );
    return res.status(200).json("update thành công ");
  }
  console.log("rong du lieu");
  return res.status(501).json("không để trống các trường dữ liệu");
};

let DeleteUser = async (req, res) => {
  const idUser = req.params.id;
  const [users, fields] = await pool.execute(
    "select * from datausers where id = ?",
    [idUser]
  );
  console.log("delete user ", users);
  if (users.length === 0) {
    return res.status(200).json("id không tồn tại , err client");
  }

  if (users[0].id.toString().trim() === idUser.trim()) {
    const user = await pool.execute("delete from datausers where id = ?", [
      idUser,
    ]);
    res.status(200).json("delete thành công ");
  }
};

//  category

let DeleteCategory = async (req, res) => {
  const idCategory = req.params.id;
  const [users, fields] = await pool.execute(
    "select * from category where id = ?",
    [idCategory]
  );
  console.log("delete category ", users);
  if (users.length === 0) {
    return res.status(200).json("id không tồn tại , err client");
  }

  if (users[0].id.toString().trim() === idCategory.trim()) {
    const user = await pool.execute("delete from category where id = ?", [
      idCategory,
    ]);
    res.status(200).json("delete thành công ");
  }
};


// category
let CreateCategory = async (req, res) => {
  let name = req.body.name;
  let radio = req.body.radio;

  console.log("create category ", name, radio);

  // kiem tra xem da co san pham nay chua
  const [row, field] = await pool.execute(
    "SELECT * FROM `category` WHERE name = ?",
    [name]
  );
  console.log(row[0]);

  if (row[0] == undefined) {
    if (!name) {
      return res.status(200).json("không để trống các trường dữ liệu");
    }
    const [rows, fields] = await pool.execute(
      "INSERT INTO category(name,status) VALUES(?,?)",
      [name, radio]
    );
    res.status(200).json("tạo thành công ");
  } else {
    return res.status(409).json("trung san pham");
  }
};

//  CreateProduct

let CreateProduct = async (req, res) => {
  try {
    let databody = req.body;
    databody.image = req.file;

    // Kiểm tra xem có tồn tại file hay không
    if (!databody.image) {
      return res.status(510).json("Không tải được file");
    }

    // Kiểm tra xem các trường dữ liệu cần thiết có được cung cấp hay không
    if (
      !databody.name ||
      !databody.price ||
      !databody.sale_price ||
      !databody.category ||
      !databody.status
    ) {
      return res.status(200).json("Không để trống các trường dữ liệu");
    }

    // Kiểm tra xem đã có sản phẩm này trong cơ sở dữ liệu chưa
    const [row, field] = await pool.execute(
      "SELECT * FROM `product` WHERE image = ?",
      [databody.image.originalname]
    );

    if (row[0] === undefined) {
      const [rows, fields] = await pool.execute(
        "INSERT INTO product(name, price, sale_price, image, category_id, status) VALUES(?, ?, ?, ?, ?, ?)",
        [
          databody.name,
          databody.price,
          databody.sale_price,
          databody.image.originalname,
          databody.category,
          databody.status,
        ]
      );

      res.status(200).json("Tạo thành công");
    } else {
      return res.status(409).json("Trùng sản phẩm");
    }
  } catch (error) {
    console.error("Error during product creation:", error);
    res.status(500).json("Lỗi trong quá trình tạo sản phẩm");
  }
};

module.exports = {
  getOneUser,
  getAllusers,
  CreateUser,
  UpdateUser,
  DeleteUser,
  GET_DeleteUser,

  CreateCategory,
  DeleteCategory,
  UpdateCategory,

  CreateProduct,
};

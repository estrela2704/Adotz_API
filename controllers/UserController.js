const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    try {
      const { name, email, password, confirmpassword, phone } = req.body;

      if (!name) {
        return res.status(422).json({ message: "Preencha o campo nome!" });
      }

      if (!email) {
        return res.status(422).json({ message: "Preencha o campo email!" });
      }

      if (!password) {
        return res.status(422).json({ message: "Preencha o campo senha!" });
      }

      if (!confirmpassword) {
        return res
          .status(422)
          .json({ message: "Preencha o campo confirmação de senha!" });
      }

      if (!phone) {
        return res.status(422).json({ message: "Preencha o campo telefone!" });
      }

      if (password !== confirmpassword) {
        return res
          .status(422)
          .json({ message: "A senha e a confirmação não coincidem!" });
      }

      const userExists = await User.findOne({ email: email });

      if (userExists) {
        return res.status(422).json({
          message: "Já existe um usuário cadastrado com esse e-mail! ",
        });
      }

      const salt = await bcrypt.genSalt(12);
      const passHash = await bcrypt.hash(password, salt);

      const user = new User({
        name: name,
        email: email,
        phone: phone,
        password: passHash,
      });
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        res.status(422).json({ message: "Preencha o campo email!" });
        return;
      }

      if (!password) {
        res.status(422).json({ message: "Preencha o campo senha!" });
        return;
      }

      const user = await User.findOne({ email: email });

      if (!user) {
        res.status(422).json({
          message: "Não há usuario cadastrado com este email!",
        });
        return;
      }

      const comparePassword = await bcrypt.compare(password, user.password);

      if (!comparePassword) {
        res.status(422).json({
          message: "Senha incorreta!",
        });
        return;
      }
      await createUserToken(user, req, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async checkUser(req, res) {
    try {
      let currentUser;

      if (req.headers.authorization) {
        const token = getToken(req);
        const decoded = jwt.verify(token, "nossosecret");

        currentUser = await User.findById(decoded.id);
        currentUser.password = undefined;
      } else {
        currentUser = null;
      }

      return res.status(200).send(currentUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async getUserById(req, res) {
    try {
      const id = req.params.id;

      const user = await User.findById(id).select("-password");

      if (!user) {
        return res.status(422).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async editUser(req, res) {
    try {
      const token = await getToken(req);
      const user = await getUserByToken(token);

      const { name, email, phone, password, confirmpassword } = req.body;

      let image = "";

      if (req.file) {
        user.image = req.file.filename;
      }

      if (!name) {
        return res.status(422).json({ message: "Preencha o campo nome!" });
      }

      user.name = name;

      if (!email) {
        return res.status(422).json({ message: "Preencha o campo email!" });
      }

      const userExists = await User.findOne({ email: email });
      if (user.email !== email && userExists) {
        return res.status(422).json({
          message: "Por favor, utilize outro e-mail! ",
        });
      }

      user.email = email;

      if (!phone) {
        return res.status(422).json({ message: "Preencha o campo telefone!" });
      }

      user.phone = phone;

      if (password !== confirmpassword) {
        return res
          .status(422)
          .json({ message: "A senha e a confirmação não coincidem!" });
      } else if (password === confirmpassword && password != null) {
        const salt = await bcrypt.genSalt(12);
        const passHash = await bcrypt.hash(password, salt);

        user.password = passHash;
      }

      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      res.status(200).json({ message: "Usuario alterado com sucesso! " });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }
};

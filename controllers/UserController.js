const User = require("../models/User");
const bcrypt = require("bcrypt");
const createUserToken = require("../helpers/create-user-token");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, confirmpassword, phone } = req.body;

    if (!name) {
      res.status(422).json({ message: "Preencha o campo nome!" });
      return;
    }

    if (!email) {
      res.status(422).json({ message: "Preencha o campo email!" });
      return;
    }

    if (!password) {
      res.status(422).json({ message: "Preencha o campo senha!" });
      return;
    }

    if (!confirmpassword) {
      res
        .status(422)
        .json({ message: "Preencha o campo confirmação de senha!" });
      return;
    }

    if (!phone) {
      res.status(422).json({ message: "Preencha o campo telefone!" });
      return;
    }

    if (password !== confirmpassword) {
      res
        .status(422)
        .json({ message: "A senha e a confirmação não coincidem!" });
      return;
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({
        message: "Já existe um usuário cadastrado com esse e-mail! ",
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: name,
      email: email,
      phone: phone,
      password: passHash,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
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
  }
};

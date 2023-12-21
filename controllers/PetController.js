const Pet = require("../models/Pet");

const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const objectId = require("mongoose").Types.ObjectId;
module.exports = class PetController {
  static async create(req, res) {
    try {
      const { name, age, weight, color } = req.body;
      const images = req.files;

      if (!name) {
        return res.status(422).json({ message: "Preencha o campo nome!" });
      }

      if (!age) {
        return res.status(422).json({ message: "Preencha o campo idade!" });
      }

      if (!weight) {
        return res.status(422).json({ message: "Preencha o campo peso!" });
      }

      if (!color) {
        return res.status(422).json({ message: "Preencha o campo cor!" });
      }

      if (images.length === 0) {
        return res.status(422).json({ message: "A imagem é obrigatória!" });
      }

      const avaible = true;

      const token = getToken(req);
      const user = await getUserByToken(token);

      const pet = new Pet({
        name: name,
        age: age,
        weight: weight,
        color: color,
        avaible: avaible,
        images: [],
        user: {
          _id: user._id,
          name: user.name,
          image: user.image,
          phone: user.phone,
        },
      });

      images.map((image) => {
        pet.images.push(image.filename);
      });

      const newPet = await pet.save();
      res.status(201).json({ message: "Pet cadastrado com sucesso", newPet });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async getAll(req, res) {
    try {
      const pets = await Pet.find().sort("-createdAt");

      return res.status(200).json({ message: "Pets encontrados!", pets: pets });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async getAllUserPets(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);
      const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");

      return res.status(200).json({ message: "Pets encontrados!", pets: pets });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async getAllUserAdoptions(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);
      const pets = await Pet.find({ "adopter._id": user._id }).sort(
        "-createdAt"
      );

      return res
        .status(200)
        .json({ message: "Adoções encontrados!", pets: pets });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }

  static async getPetById(req, res) {
    try {
      const id = req.params.id;

      if (!objectId.isValid(id)) {
        return res.status(422).json({ message: "ID inválido!" });
      }

      const pets = await Pet.findOne({ _id: id });

      if (!pets) {
        return res.status(404).json({ message: "Pet não encontrado!" });
      }

      return res.status(200).json({ message: "Pet encontrado!", pets: pets });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Algo de errado aconteceu!" });
    }
  }
};

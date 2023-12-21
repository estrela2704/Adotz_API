const express = require("express");
const cors = require("cors");
const { dbConnect } = require("./db/conn");

const app = express();

// CONFIGURANDO JSON
app.use(express.json());

// CONFIGURANDO CORS
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// CONFIGURANDO PASTA PUBLICA
app.use(express.static("public"));

// ROTAS
const UserRoutes = require("./routes/UserRoutes");
app.use("/users", UserRoutes);
const PetRoutes = require("./routes/PetRoutes");
app.use("/pets", PetRoutes);

// INICIALIZANDO SERVIDOR APÓS CONEXÃO COM BANCO SER BEM SUCEDIDA
const port = 5000;
dbConnect()
  .then(() => {
    app.listen(port, (error) => {
      if (!error) {
        console.log("Servidor iniciado e conectado ao banco!");
      } else {
        console.log(error);
      }
    });
  })
  .catch((error) => {
    console.log("Houve um erro ao iniciar o servidor!", error);
  });

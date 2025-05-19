const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors"); // Já importado

const app = express();
// const port = 3001;

// Middleware para analisar o corpo das requisições POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware CORS para permitir requisições de TODAS as origens (apenas para desenvolvimento!)

 const corsOptions = {
  origin: "https://senhasparaordemdeservicos.onrender.com/", // Substitua pelo domínio do seu frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Se você precisar de cookies ou autenticação
  allowedHeaders: 'Content-Type,Authorization',
  exposedHeaders: 'Content-Length,Date,ETag',
  maxAge: 86400,
  optionsSuccessStatus: 204,
}; 

app.use(cors(corsOptions));

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database("./senhas.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
    db.run(`
            CREATE TABLE IF NOT EXISTS senhas_geradas (
                ordem_servico TEXT PRIMARY KEY,
                senha_4 TEXT NOT NULL,
                senha_6 TEXT NOT NULL,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
  }
});

function gerarHash(texto) {
  return crypto.createHash("sha256").update(texto).digest("hex");
}

function gerarSenhaDeterministica(sementeBase, comprimento, caracteres) {
  let seed = gerarHash(sementeBase);
  let random = function (seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  let senha = "";
  for (let i = 0; i < comprimento; i++) {
    const randomIndex = Math.floor(
      random(parseFloat("0." + seed.slice(0, 16)) + i) * caracteres.length
    );
    senha += caracteres.charAt(randomIndex);
    seed = gerarHash(seed + i); // Atualizar a semente para a próxima iteração
  }
  return senha;
}

// Rota para gerar e salvar as senhas
app.post("/gerar-senhas", (req, res) => {
  const { ordemServico } = req.body;

  if (ordemServico) {
    const caracteres4 = "0123456789";
    const caracteres6 =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const senha4 = gerarSenhaDeterministica(
      ordemServico + "_4",
      4,
      caracteres4
    );
    const senha6 = gerarSenhaDeterministica(
      ordemServico + "_6",
      6,
      caracteres6
    );

    db.run(
      `
            INSERT OR REPLACE INTO senhas_geradas (ordem_servico, senha_4, senha_6)
            VALUES (?, ?, ?)
        `,
      [ordemServico, senha4, senha6],
      function (err) {
        if (err) {
          console.error("Erro ao salvar no banco de dados:", err.message);
          res.status(500).json({ error: "Erro ao salvar as senhas." });
        } else {
          res.json({
            ordemServico: ordemServico,
            senha4: senha4,
            senha6: senha6,
          });
        }
      }
    );
  } else {
    res.status(400).json({ error: "A ordem de serviço é obrigatória." });
  }
});

// Rota para buscar as senhas por ordem de serviço
app.get("/buscar-senhas/:ordemServico", (req, res) => {
  const ordemServico = req.params.ordemServico;

  db.get(
    `
        SELECT senha_4, senha_6 FROM senhas_geradas WHERE ordem_servico = ?
    `,
    [ordemServico],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar no banco de dados:", err.message);
        res.status(500).json({ error: "Erro ao buscar as senhas." });
      } else if (row) {
        res.json({
          ordemServico: ordemServico,
          senha4: row.senha_4,
          senha6: row.senha_6,
        });
      } else {
        res
          .status(404)
          .json({
            message: "Nenhuma senha encontrada para esta ordem de serviço.",
          });
      }
    }
  );
});

// Use process.env.PORT para obter a porta configurada pelo Render
const port = process.env.PORT || 3001; // Use 3001 como padrão localmente

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

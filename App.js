//------------------------------
// EXPRESS, MYSQL2 Y CORS
//------------------------------
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//------------------------------
// BASE DE DATOS
//------------------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "boletin_db" // NOMBRE REAL DE TU BASE
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar DB:", err);
    return;
  }
  console.log("Base de datos conectada correctamente");

  // Asegurarse de que exista la columna de aprobación (permite aceptar/rechazar usuarios)
  db.query(
    `ALTER TABLE usuarios ADD COLUMN Aprobado TINYINT(1) NOT NULL DEFAULT 0`,
    (err) => {
      // ignorar error si ya existe
      if (err && !err.message.includes('Duplicate')) {
        console.warn('No se pudo agregar columna Aprobado:', err.message);
      }
    }
  );
});


// REGISTRO

app.post("/api/registro", (req, res) => {
  const { nombre, contrasena, dni, gmail, ciudad, rol, curso } = req.body;

  // by default Aprobado = 0; auto-approve administrators
  const aprobado = rol === 'Administrador' ? 1 : 0;

  const sql =
    "INSERT INTO usuarios (NombreyApellido, Contraseña, DNI, Gmail, Ciudad, Rol, Curso, Aprobado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [nombre, contrasena, dni, gmail, ciudad, rol, curso, aprobado],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});


// LOGIN

app.post("/api/login", (req, res) => {
  const { gmail, contrasena } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE Gmail = ? AND Contraseña = ?",
    [gmail, contrasena],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ success: false });
      }

      if (result.length === 0) {
        return res.json({ success: false, msg: "Credenciales incorrectas" });
      }

      const usuario = result[0];

      // si el usuario no está aprobado y no es administrador
      if (usuario.Aprobado === 0 && usuario.Rol !== 'Administrador') {
        return res.json({ success: false, msg: 'Cuenta pendiente de aprobación' });
      }

      //Devuelve el rol y el ID
      res.json({
        success: true,
        rol: usuario.Rol,
        nombre: usuario.NombreyApellido,
        id: usuario.ID_Usuarios
      });
    }
  );
});



// OBTENER USUARIOS (para administración)

app.get('/api/usuarios', (req, res) => {
  const sql = 'SELECT ID_Usuarios, NombreyApellido, Gmail, DNI, Rol, Curso, Ciudad, Aprobado FROM usuarios';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// cambiar rol de usuario
app.put('/api/usuarios/:id/rol', (req, res) => {
  const id = req.params.id;
  const { rol } = req.body;
  const sql = 'UPDATE usuarios SET Rol = ? WHERE ID_Usuarios = ?';
  db.query(sql, [rol, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// aprobar o rechazar usuario
app.put('/api/usuarios/:id/aprobar', (req, res) => {
  const id = req.params.id;
  const { aprobado } = req.body; // boolean 0/1
  const sql = 'UPDATE usuarios SET Aprobado = ? WHERE ID_Usuarios = ?';
  db.query(sql, [aprobado ? 1 : 0, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// eliminar usuario
app.delete('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM usuarios WHERE ID_Usuarios = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// OBTENER MATERIAS

app.get("/api/materias", (req, res) => {
  const sql = "SELECT ID_Materia, Name_Materias FROM materias";
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    res.json(results);
  });
});


// Buscar Alumno por DNI
app.post("/api/buscarAlumno", (req, res) => {
  const { dni } = req.body;

  const sql =
    "SELECT * FROM usuarios WHERE DNI = ?";

  db.query(sql, [dni], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false });
    }
  });
});


// GUARDAR NOTAS

app.post("/api/guardarNotas", async (req, res) => {
  const notas = req.body.notas;

  const sql =
    "INSERT INTO notas (ID_Usuarios, ID_Materia, Curso, Tipo_de_Nota, Nota, Periodo) VALUES (?, ?, ?, ?, ?, ?)";

  try {
    const queries = notas
      .filter(n => n.Nota !== "")
      .map(n =>
        new Promise((resolve, reject) => {
          db.query(sql, [
            n.ID_Usuarios,
            n.ID_Materia,
            n.Curso,
            n.Tipo_de_Nota,
            n.Nota,
            n.Periodo
          ], (err, result) => {
            if (err){
              console.error("ERROR MYSQL" , err);
              reject(err);
             } else resolve(result);
          });
        })
      );

    await Promise.all(queries);

    res.json({ ok: true, msg: "Notas guardadas correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error al guardar notas" });
  }
});

// TRAER NOTAS DE UN ALUMNO
app.get("/api/notasAlumno/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT m.Name_Materias, n.*
    FROM notas n
    JOIN materias m ON n.ID_Materia = m.ID_Materia
    WHERE n.ID_Usuarios = ?
    ORDER BY n.ID_Materia
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    res.json({ success: true, notas: results });
  });
});

 db.query("SELECT * FROM usuarios WHERE Rol = ?", ["Administrador"], (err, result) => {
  if (err) {
    console.log(err);
    return;
  }

  if (result.length === 0) {
    db.query(
      "INSERT INTO usuarios (NombreyApellido, Contraseña, DNI, Gmail, Rol, Curso, Ciudad) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["Administrador", "admin123", "00000000", "admin@admin.com", "Administrador", "Admin", "Sistema"],
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Administrador creado automáticamente");
      }
    );
  } else {
    console.log("El administrador ya existe");
  }
});

 db.query("SELECT * FROM usuarios WHERE Rol = ?", ["Dpto_Alumnados"], (err, result) => {
  if (err) {
    console.log(err);
    return;
  }

  if (result.length === 0) {
    db.query(
      "INSERT INTO usuarios (NombreyApellido, Contraseña, DNI, Gmail, Rol, Curso, Ciudad) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["Dpto_Alumnados", "alumnado123", "00000000", "alumnado@alumnado.com", "Dpto_Alumnados", "Admin", "Sistema"],
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Departamento de Alumnados creado automáticamente");
      }
    );
  } else {
    console.log("El departamento de alumnados ya existe");
  }
});


//------------------------------
// PUERTO
//------------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});

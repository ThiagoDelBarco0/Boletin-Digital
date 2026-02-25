

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `boletin_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `boletin_db`;

CREATE TABLE `boletin` (
  `ID_Boletin` int(11) NOT NULL,
  `ID_Usuarios` int(11) NOT NULL,
  `ID_Materia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



CREATE TABLE `materias` (
  `ID_Materia` int(11) NOT NULL,
  `Name_Materias` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `materias` (`ID_Materia`, `Name_Materias`) VALUES
(1, 'Hardware IV'),
(2, 'Prácticas Profesionalizantes II'),
(3, 'Autogestión'),
(4, 'Programación IV'),
(5, 'Marco Jurídico y D del T'),
(6, 'Matemáticas III'),
(7, 'Redes III'),
(8, 'Inglés Técnico'),
(9, 'Asistencia II');



CREATE TABLE `notas` (
  `ID_Notas` int(11) NOT NULL,
  `ID_Usuarios` int(11) NOT NULL,
  `ID_Materia` int(11) NOT NULL,
  `Curso` varchar(50) NOT NULL,
  `Tipo_de_Nota` varchar(50) NOT NULL,
  `Nota` varchar(50) NOT NULL,
  `Periodo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



CREATE TABLE `usuarios` (
  `ID_Usuarios` int(11) NOT NULL,
  `NombreyApellido` varchar(50) NOT NULL,
  `Contraseña` varchar(50) NOT NULL,
  `DNI` varchar(50) NOT NULL,
  `Gmail` varchar(50) NOT NULL,
  `Rol` enum('Estudiante','Administrador','Dpto_Alumnados') NOT NULL,
  `Curso` varchar(50) NOT NULL,
  `Ciudad` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `usuarios` (`ID_Usuarios`, `NombreyApellido`, `Contraseña`, `DNI`, `Gmail`, `Rol`, `Curso`, `Ciudad`) VALUES
(1, 'thiago', 'zxc.A120', '48118191', 'Thiagodbarco@gmail.com', 'Estudiante', '1', 'Rio Grande');

ALTER TABLE `boletin`
  ADD PRIMARY KEY (`ID_Boletin`),
  ADD UNIQUE KEY `ID_Usuarios` (`ID_Usuarios`,`ID_Materia`),
  ADD KEY `ID_Materia` (`ID_Materia`);


ALTER TABLE `materias`
  ADD PRIMARY KEY (`ID_Materia`);


ALTER TABLE `notas`
  ADD PRIMARY KEY (`ID_Notas`),
  ADD KEY `ID_Usuarios` (`ID_Usuarios`),
  ADD KEY `ID_Materia` (`ID_Materia`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID_Usuarios`);


ALTER TABLE `boletin`
  MODIFY `ID_Boletin` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `materias`
  MODIFY `ID_Materia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;


ALTER TABLE `notas`
  MODIFY `ID_Notas` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `usuarios`
  MODIFY `ID_Usuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;




ALTER TABLE `boletin`
  ADD CONSTRAINT `boletin_ibfk_1` FOREIGN KEY (`ID_Usuarios`) REFERENCES `usuarios` (`ID_Usuarios`) ON DELETE CASCADE,
  ADD CONSTRAINT `boletin_ibfk_2` FOREIGN KEY (`ID_Materia`) REFERENCES `materias` (`ID_Materia`) ON DELETE CASCADE;


ALTER TABLE `notas`
  ADD CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`ID_Usuarios`) REFERENCES `usuarios` (`ID_Usuarios`) ON DELETE CASCADE,
  ADD CONSTRAINT `notas_ibfk_2` FOREIGN KEY (`ID_Materia`) REFERENCES `materias` (`ID_Materia`) ON DELETE CASCADE;
COMMIT;



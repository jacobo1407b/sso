import express from "express";
import path from 'path'
import pool from "@config/db";
import dotenv from "dotenv";

import cors from "cors";
import { setupSwagger } from "@config/swagger";

import userRoutes from "@routes/user.routes";
import oauthRoutes from "@routes/oauth.routes";
import clientRouter from "@routes/client.router";
import rolsRouter from "@routes/role.router";
import companyRoutes from "@routes/company.router";
import mfa from '@routes/2fa.router';

import { authenticateRequest } from "@middleware/authMiddleware";
import { errorHandler } from "@middleware/errorMiddleware";
import { startConfig } from "@config/oauth";





dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

startConfig();

setupSwagger(app);
app.use("/api/v1", userRoutes);
app.use("/api/v1", clientRouter);
app.use("/api/v1", rolsRouter);
app.use("/api/v1", companyRoutes);
app.use("/api/v1", mfa);
app.use('/oauth', oauthRoutes);

//function can only be invoked for an authenticated request
app.get('/secure', authenticateRequest, (req, res) => {
    res.send('Secure data');
});
app.get('/docs-auth', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'oauth-docs.html')
    console.log('Buscando en:', filePath) // confirma el path
    res.sendFile(filePath)
})
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Conectar a PostgreSQL
        const client = await pool.connect();
        const res = await client.query("SELECT NOW()");
        console.log("✅ Conexión exitosa con PostgreSQL:", res.rows);

        client.release(); // Cerrar conexión

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🔥 Servidor corriendo en puerto ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Error al conectar con PostgreSQL:", err);
        process.exit(1);
    }
};

startServer();

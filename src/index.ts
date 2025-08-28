import express from "express";
import { Request, Response,NextFunction } from "express";
import pool from "@config/db";
import dotenv from "dotenv";
import cors from "cors";
import { setupSwagger } from "@config/swagger";

import userRoutes from "@routes/user.routes";
import oauthRoutes from "@routes/oauth.routes";
import clientRouter from "@routes/client.router";
import rolsRouter from "@routes/role.router";
import companyRoutes from "@routes/company.router";

import { authenticateRequest } from "@middleware/authMiddleware";
import { startConfig } from "@config/oauth";


dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
startConfig();

setupSwagger(app);
app.use("/api/v1", userRoutes);
app.use("/api/v1", clientRouter);
app.use("/api/v1", rolsRouter);
app.use("/api/v1", companyRoutes)
app.use('/oauth', oauthRoutes);

//function can only be invoked for an authenticated request
app.get('/secure', authenticateRequest, (req, res) => {
    res.send('Secure data');
});
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(err.statusCode || 500).json(err);
});

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

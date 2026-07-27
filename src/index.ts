import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import routes from './routes';
import { swaggerSpec } from './swagger/swagger.config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});


app.use('/api/v1', routes);


app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        statusCode: 500,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong!'
        }
    });
});


AppDataSource.initialize()
    .then(() => {
        console.log('✅ Data Source has been initialized!');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
            console.log(`❤️  Health check: http://localhost:${PORT}/health`);
        });
    })
    .catch((error) => {
        console.error('❌ Error during Data Source initialization:', error);
        process.exit(1);
    });

export default app;

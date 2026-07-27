import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import { CreateSessionDto } from '../dto/session.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class SessionController {
    private sessionService: SessionService;

    constructor() {
        this.sessionService = new SessionService();
    }

    listSessions = async (req: Request, res: Response): Promise<void> => {
        try {
            const sessions = await this.sessionService.findAll();
            res.json(sessions);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const sessionId = parseInt(req.params.sessionId);
            const session = await this.sessionService.findById(sessionId);

            if (!session) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Session not found' }
                });
                return;
            }

            res.json(session);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    createSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = plainToInstance(CreateSessionDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                res.status(422).json({
                    statusCode: 422,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: errors.map(e => ({
                            field: e.property,
                            message: Object.values(e.constraints || {})[0]
                        }))
                    }
                });
                return;
            }

            const session = await this.sessionService.create(dto);
            res.status(201).json(session);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    deleteSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const sessionId = parseInt(req.params.sessionId);
            const deleted = await this.sessionService.delete(sessionId);

            if (!deleted) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Session not found' }
                });
                return;
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

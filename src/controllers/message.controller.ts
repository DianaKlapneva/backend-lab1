import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { CreateMessageDto, UpdateMessageDto } from '../dto/message.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    listMessages = async (req: Request, res: Response): Promise<void> => {
        try {
            const session_id = req.query.session_id ? parseInt(req.query.session_id as string) : undefined;
            const user_id = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;

            const messages = await this.messageService.findAll(session_id, user_id);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const messageId = parseInt(req.params.messageId);
            const message = await this.messageService.findById(messageId);

            if (!message) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Message not found' }
                });
                return;
            }

            res.json(message);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    createMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = plainToInstance(CreateMessageDto, req.body);
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

            const message = await this.messageService.create(dto);
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    updateMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const messageId = parseInt(req.params.messageId);
            const dto = plainToInstance(UpdateMessageDto, req.body);
            const errors = await validate(dto, { skipMissingProperties: true });

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

            const message = await this.messageService.update(messageId, dto);

            if (!message) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Message not found' }
                });
                return;
            }

            res.json(message);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    deleteMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const messageId = parseInt(req.params.messageId);
            const deleted = await this.messageService.delete(messageId);

            if (!deleted) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Message not found' }
                });
                return;
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

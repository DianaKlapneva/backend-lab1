import { Request, Response } from 'express';
import { DealService } from '../services/deal.service';
import { CreateDealDto, UpdateDealDto } from '../dto/deal.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class DealController {
    private dealService: DealService;

    constructor() {
        this.dealService = new DealService();
    }

    listDeals = async (req: Request, res: Response): Promise<void> => {
        try {
            const deals = await this.dealService.findAll();
            res.json(deals);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getDeal = async (req: Request, res: Response): Promise<void> => {
        try {
            const dealId = parseInt(req.params.dealId);
            const deal = await this.dealService.findById(dealId);

            if (!deal) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Deal not found' }
                });
                return;
            }

            res.json(deal);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    createDeal = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = plainToInstance(CreateDealDto, req.body);
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

            const deal = await this.dealService.create(dto);
            res.status(201).json(deal);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    updateDeal = async (req: Request, res: Response): Promise<void> => {
        try {
            const dealId = parseInt(req.params.dealId);
            const dto = plainToInstance(UpdateDealDto, req.body);
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

            const deal = await this.dealService.update(dealId, dto);

            if (!deal) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Deal not found' }
                });
                return;
            }

            res.json(deal);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    deleteDeal = async (req: Request, res: Response): Promise<void> => {
        try {
            const dealId = parseInt(req.params.dealId);
            const deleted = await this.dealService.delete(dealId);

            if (!deleted) {
                res.status(404).json({
                    statusCode: 404,
                    error: { code: 'NOT_FOUND', message: 'Deal not found' }
                });
                return;
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

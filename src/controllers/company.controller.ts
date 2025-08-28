import { Request, Response } from "express";
import { companyService } from "@services/company.service";

export const getOneBusinessController = async (req: Request, res: Response) => {
    try {
        const findCompany = await companyService.getOneBusiness(req.params.id);

        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: findCompany
        });
    } catch (err: any) {
        res.status(err.code || 500).json(err);
    }
}

export const listBusinessController = async (req: Request, res: Response) => {
    try {
        const allBu = await companyService.getAllBusinessUnits();
        res.status(200).json({
            code: 200,
            statusCode: 200,
            data: allBu
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const createBuController = async (req: Request, res: Response) => {
    try {
        const { bu, branch } = req.body
        const putBu = await companyService.createBusinessUnit(bu, branch);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: putBu
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const aptBuController = async (req: Request, res: Response) => {
    try {
        const updateBu = await companyService.updateBusiness(req.params.id, req.body);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: updateBu
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const aptBranchController = async (req: Request, res: Response) => {
    try {
        const loc = req.params.location;
        const bch = req.params.branch;
        const branch = await companyService.updateLocationBranch(req.body, loc, bch);

        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: branch
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const deleteBranchController = async (req: Request, res: Response) => {
    try {
        await companyService.deleteBranch(req.params.branch);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const deleteUnitController = async (req: Request, res: Response) => {
    try {
        await companyService.deleteUnit(req.params.unit);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: null
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

export const createBranchController = async (req: Request, res: Response) => {
    try {
        const branch = await companyService.createBranch(req.params.unit, req.body);
        res.status(201).json({
            code: 201,
            statusCode: 201,
            data: branch
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json(error);
    }
}

import prisma from "@config/prisma";

class CompanyService {

    //obtener bu unica
    async getOneBusiness(id: string) {
        const company = await prisma.sSO_BUSINESS_UNITS_T.findUnique({
            where: { unit_id: id },
            select: {
                unit_id: true,
                name: true,
                code: true,
                description: true,
                created_date: true,
                img_url: true,
                SSO_BUSINESS_UNIT_BRANCHES_T: {
                    select: {
                        branch_id: true,
                        name: true,
                        is_primary: true,
                        SSO_BUSINESS_LOCATIONS_T: {
                            select: {
                                location_id: true,
                                street_name: true,
                                street_number: true,
                                neighborhood: true,
                                city: true,
                                state: true,
                                postal_code: true,
                                country: true
                            }
                        }
                    }
                }
            }
        });

        return {
            unit_id: company?.unit_id,
            name: company?.name,
            code: company?.code,
            description: company?.description,
            created_date: company?.created_date,
            img_url: company?.img_url,
            branchs: company?.SSO_BUSINESS_UNIT_BRANCHES_T.map((b) => {
                return {
                    branch_id: b.branch_id,
                    name: b.name,
                    is_primary: b.is_primary,
                    location_id: b.SSO_BUSINESS_LOCATIONS_T?.location_id,
                    street_name: b.SSO_BUSINESS_LOCATIONS_T?.street_name,
                    street_number: b.SSO_BUSINESS_LOCATIONS_T?.street_number,
                    neighborhood: b.SSO_BUSINESS_LOCATIONS_T?.neighborhood,
                    city: b.SSO_BUSINESS_LOCATIONS_T?.city,
                    state: b.SSO_BUSINESS_LOCATIONS_T?.state,
                    postal_code: b.SSO_BUSINESS_LOCATIONS_T?.postal_code,
                    country: b.SSO_BUSINESS_LOCATIONS_T?.country
                }
            })
        }
    }

    //obtener lista de bu
    async getAllBusinessUnits() {
        const companys = await prisma.sSO_BUSINESS_UNITS_T.findMany({
            select: {
                unit_id: true,
                name: true,
                code: true,
                description: true,
                img_url: true,
                SSO_BUSINESS_UNIT_BRANCHES_T: {
                    select: {
                        branch_id: true,
                        name: true,
                        is_primary: true,
                        SSO_BUSINESS_LOCATIONS_T: {
                            select: {
                                location_id: true,
                                street_name: true,
                                street_number: true,
                                neighborhood: true,
                                city: true,
                                state: true,
                                postal_code: true,
                                country: true
                            }
                        }
                    }
                }
            }
        });

        return companys.map((c) => {
            const br = c.SSO_BUSINESS_UNIT_BRANCHES_T.map((b) => {
                return {
                    branch_id: b.branch_id,
                    name: b.name,
                    is_primary: b.is_primary,
                    location_id: b.SSO_BUSINESS_LOCATIONS_T?.location_id,
                    street_name: b.SSO_BUSINESS_LOCATIONS_T?.street_name,
                    street_number: b.SSO_BUSINESS_LOCATIONS_T?.street_number,
                    neighborhood: b.SSO_BUSINESS_LOCATIONS_T?.neighborhood,
                    city: b.SSO_BUSINESS_LOCATIONS_T?.city,
                    state: b.SSO_BUSINESS_LOCATIONS_T?.state,
                    postal_code: b.SSO_BUSINESS_LOCATIONS_T?.postal_code,
                    country: b.SSO_BUSINESS_LOCATIONS_T?.country
                }

            });
            return {
                unit_id: c.unit_id,
                name: c.name,
                code: c.code,
                description: c.description,
                img_url: c.img_url,
                branchs: br
            }
        });
    }
    //crear bu con datos de sucursal y localizacion
    async createBusinessUnit(dataUnit: any, branchData: Array<{ location: any, branch: any }>) {

        const unit = await prisma.sSO_BUSINESS_UNITS_T.create({
            data: dataUnit
        });
        const branchesCreate = await Promise.all(
            branchData.map(async (i) => {
                const lo = await prisma.sSO_BUSINESS_LOCATIONS_T.create({
                    data: i.location
                });
                const br = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.create({
                    data: {
                        ...i.branch,
                        location_id: lo.location_id,
                        unit_id: unit.unit_id
                    }
                });
                return {
                    branch_id: br.branch_id,
                    name: br.name,
                    is_primary: br.is_primary,
                    location_id: lo.location_id,
                    street_name: lo.street_name,
                    street_number: lo.street_number,
                    neighborhood: lo.neighborhood,
                    city: lo.city,
                    state: lo.state,
                    postal_code: lo.postal_code,
                    country: lo.country

                }
            })
        );

        return {
            ...unit,
            branchs: branchesCreate
        }
    }

    //actualizar solo info de bu
    async updateBusiness(bu_id: string, data: any) {
        await prisma.sSO_BUSINESS_UNITS_T.update({
            where: { unit_id: bu_id },
            data: data
        });
        return await this.getOneBusiness(bu_id);
    }

    //actualizar sucursales de bu y localizacion
    async updateLocationBranch(data: { location: any, branch: any }, location: string, branch: string) {
        const br = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.update({
            where: { branch_id: branch },
            data: data.branch
        });

        const lo = await prisma.sSO_BUSINESS_LOCATIONS_T.update({
            where: { location_id: location },
            data: data.location
        });
        return {
            branch_id: br.branch_id,
            name: br.name,
            is_primary: br.is_primary,
            location_id: lo.location_id,
            street_name: lo.street_name,
            street_number: lo.street_number,
            neighborhood: lo.neighborhood,
            city: lo.city,
            state: lo.state,
            postal_code: lo.postal_code,
            country: lo.country
        }
    }

    //eliminar branch y ubicacion
    async deleteBranch(branch_id: string) {
        await prisma.sSO_USER_BUSINESS_UNIT_T.updateMany({
            where: { branch_id: branch_id },
            data: {
                branch_id: null
            }
        });
        const location = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.findUnique({
            where: { branch_id: branch_id },
            select: {
                location_id: true
            }
        });
        if (location) {
            await prisma.sSO_BUSINESS_LOCATIONS_T.delete({
                where: { location_id: location?.location_id ?? "" }
            });
        }

        await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.delete({
            where: { branch_id: branch_id }
        });
    }

    //eliminar bu y datos relacionados
    async deleteUnit(unit_id: string) {
        await prisma.sSO_USER_BUSINESS_UNIT_T.updateMany({
            where: { unit_id: unit_id },
            data: {
                unit_id: null,
                branch_id: null
            }
        });
        const branches = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.findMany({
            where: { unit_id: unit_id },
            select: {
                location_id: true
            }
        });

        if (branches.length !== 0) {
            await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.deleteMany({
                where: { unit_id: unit_id }
            });
            await prisma.sSO_BUSINESS_LOCATIONS_T.deleteMany({
                where: {
                    location_id: {
                        in: branches.map((x) => x.location_id ?? "")
                    }
                }
            })
        }

        await prisma.sSO_BUSINESS_UNITS_T.delete({
            where: { unit_id: unit_id }
        })
    }

    //crear sucursal a una bu
    async createBranch(unit_id: string, data: Array<{ location: any, branch: any }>) {
        const br = await Promise.all(
            data.map(async (i) => {
                const lo = await prisma.sSO_BUSINESS_LOCATIONS_T.create({
                    data: i.location
                });
                const br = await prisma.sSO_BUSINESS_UNIT_BRANCHES_T.create({
                    data: {
                        ...i.branch,
                        location_id: lo.location_id,
                        unit_id: unit_id
                    }
                });
                return {
                    branch_id: br.branch_id,
                    name: br.name,
                    is_primary: br.is_primary,
                    location_id: lo.location_id,
                    street_name: lo.street_name,
                    street_number: lo.street_number,
                    neighborhood: lo.neighborhood,
                    city: lo.city,
                    state: lo.state,
                    postal_code: lo.postal_code,
                    country: lo.country

                }
            })
        );

        return br;
    }

    async updateImage(id: string, url: string) {
        await prisma.sSO_BUSINESS_UNITS_T.update({
            where: { unit_id: id },
            data: {
                img_url: url
            }
        })
    }
}

export const companyService = new CompanyService();
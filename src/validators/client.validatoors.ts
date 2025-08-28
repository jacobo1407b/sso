import { checkSchema } from 'express-validator';

export const esquemaAsignarGrants = checkSchema({
    id: {
        in: ['params'],
        notEmpty: { errorMessage: 'El ID es obligatorio' },
        isString: true,
        trim: true,
        escape: true
    },
    grantType: {
        in: ['body'],
        isArray: {
            errorMessage: 'grantType debe ser un arreglo'
        },
        custom: {
            options: (value: string[]) => {
                const tiposPermitidos = ['DELETE', 'UPDATE'];
                const invalidos = value.filter(v => !tiposPermitidos.includes(v));
                if (invalidos.length > 0) {
                    throw new Error(`Valores inválidos en grantType: ${invalidos.join(', ')}`);
                }
                return true;
            }
        }
    }
});
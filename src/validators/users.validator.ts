import { checkSchema } from 'express-validator';

export const validarUsuario = checkSchema({
    username: {
        notEmpty: { errorMessage: 'Username es obligatorio' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    email: {
        isEmail: { errorMessage: 'Email inválido' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    password: {
        isLength: {
            options: { min: 12 },
            errorMessage: 'Password mínimo 12 caracteres'
        },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    hire_date: {
        isISO8601: { errorMessage: 'Fecha inválida (formato ISO)' }
    }
});


export const getUser = checkSchema({
    page: {
        in: ['query'],
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: 'page debe ser un entero ≥ 1'
        },
        toInt: true
    },
    pageSize: {
        in: ['query'],
        optional: true,
        isInt: {
            options: { min: 1, max: 100 },
            errorMessage: 'pageSize debe estar entre 1 y 100'
        },
        toInt: true
    },
    user: {
        in: ['query'],
        optional: true,
        isString: {
            errorMessage: 'user debe ser texto'
        },
        trim: true,
        escape: true,
        stripLow: true
    }
});

export const PerfilUsuario = checkSchema({
    name: {
        in: ['body'],
        notEmpty: { errorMessage: 'El nombre es obligatorio' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    last_name: {
        in: ['body'],
        notEmpty: { errorMessage: 'El apellido paterno es obligatorio' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    second_last_name: {
        in: ['body'],
        optional: true,
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    phone: {
        in: ['body'],
        optional: true,
        matches: {
            options: [/^\d{10}$/],
            errorMessage: 'El teléfono debe tener exactamente 10 dígitos. Ejemplo: 5512345678'
        },
        trim: true,
        stripLow: true
    }
});


export const esquemaUploadArchivo = checkSchema({
    // Path param: id
    id: {
        in: ['params'],
        notEmpty: { errorMessage: 'El ID es obligatorio' },
        isString: true,
        trim: true,
        escape: true
    },

    // Query param: pub
    pub: {
        in: ['query'],
        optional: true,
        isString: {
            errorMessage: 'pub debe ser texto'
        },
        trim: true,
        escape: true,
        stripLow: true
    },

    // Body param: file (multipart/form-data)
    file: {
        in: ['body'],
        custom: {
            options: (_value, { req }) => {
                if (!req.file) throw new Error('Se requiere un archivo');
                const tiposPermitidos = ['image/png', 'image/jpeg'];
                if (!tiposPermitidos.includes(req.file.mimetype)) throw new Error('Tipo de archivo no permitido');

                return true;
            }
        }
    }
});


export const CambioPassword = checkSchema({
    // Path param: id
    id: {
        in: ['params'],
        notEmpty: { errorMessage: 'El ID es obligatorio' },
        isString: true,
        trim: true,
        escape: true
    },

    // Body param: last_pass
   /* last_pass: {
        in: ['body'],
        notEmpty: { errorMessage: 'La contraseña anterior es obligatoria' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },*/

    // Body param: pass (nueva contraseña)
    pass: {
        in: ['body'],
        notEmpty: { errorMessage: 'La nueva contraseña es obligatoria' },
        isLength: {
            options: { min: 12 },
            errorMessage: 'La nueva contraseña debe tener al menos 12 caracteres'
        },
        custom: {
            options: (value) => {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
                if (!regex.test(value)) {
                    throw new Error('La nueva contraseña debe incluir mayúsculas, minúsculas, números y símbolos');
                }
                return true;
            }
        },
        trim: true,
        stripLow: true
    }
});

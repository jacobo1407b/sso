import { checkSchema } from 'express-validator';

export const validarUsuario = checkSchema({
    username: {
        notEmpty: { errorMessage: 'USER:USERNAME_REQUIRED' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    email: {
        isEmail: { errorMessage: 'USER:EMAIL_INVALID' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    password: {
        isLength: {
            options: { min: 12 },
            errorMessage: 'USER:PASSWORD_SMAL'
        },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    hire_date: {
        isISO8601: { errorMessage: 'USER:DATE_INVALID' }
    }
});


export const getUser = checkSchema({
    page: {
        in: ['query'],
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: 'SYS:PAGE_ISNAN'
        },
        toInt: true
    },
    pageSize: {
        in: ['query'],
        optional: true,
        isInt: {
            options: { min: 1, max: 100 },
            errorMessage: 'SYS:PAGE_SIZE_TO_LONG'
        },
        toInt: true
    },
    user: {
        in: ['query'],
        optional: true,
        isString: {
            errorMessage: 'SYS:USER_ISNTXT'
        },
        trim: true,
        escape: true,
        stripLow: true
    }
});

export const PerfilUsuario = checkSchema({
    name: {
        in: ['body'],
        notEmpty: { errorMessage: 'USER:NAME_REQUIRED' },
        isString: true,
        trim: true,
        escape: true,
        stripLow: true
    },
    last_name: {
        in: ['body'],
        notEmpty: { errorMessage: 'USER:LAST_NAME_REQUIRED' },
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
            errorMessage: 'USER:PHONE_INVALID'
        },
        trim: true,
        stripLow: true
    }
});


export const esquemaUploadArchivo = checkSchema({
    // Path param: id
    id: {
        in: ['params'],
        notEmpty: { errorMessage: 'SYS:ID_INVALID' },
        isString: true,
        trim: true,
        escape: true
    },

    // Query param: pub
    pub: {
        in: ['query'],
        optional: true,
        isString: {
            errorMessage: 'SYS:PU_INVALID'
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
                if (!req.file) throw new Error('USER:FILE_REQUIRED');
                const tiposPermitidos = ['image/png', 'image/jpeg'];
                if (!tiposPermitidos.includes(req.file.mimetype)) throw new Error('USER:FILE_TYPE_INVALID');
                return true;
            }
        }
    }
});


export const CambioPassword = checkSchema({
    // Path param: id
    id: {
        in: ['params'],
        notEmpty: { errorMessage: 'SYS:ID_INVALID' },
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
        notEmpty: { errorMessage: 'USER:PASSWORD_REQUIRED' },
        isLength: {
            options: { min: 12 },
            errorMessage: 'USER:PASSWORD_SMAL'
        },
        custom: {
            options: (value) => {
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
                if (!regex.test(value)) {
                    throw new Error('USER_PASSWORD_INVALID');
                }
                return true;
            }
        },
        trim: true,
        stripLow: true
    }
});

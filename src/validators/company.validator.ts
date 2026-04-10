import { checkSchema } from 'express-validator';

export const validarBusinessUnit = checkSchema({
    'bu.name': {
        notEmpty: { errorMessage: 'BUS_UNIT:NAME_REQUIRED' },
        isString: true,
        trim: true
    },
    'bu.code': {
        notEmpty: { errorMessage: 'BUS_UNIT:CODE_REQUIRED' },
        isString: true,
        trim: true
    },
    branch: {
        isArray: { errorMessage: 'BUS_UNIT:BRANCHES_MUST_BE_ARRAY' },
        optional: true
    },
    'branch.*.name': {
        notEmpty: { errorMessage: 'BRANCH:NAME_REQUIRED' },
        isString: true
    }
});

export const validarBranch = checkSchema({
    name: {
        notEmpty: { errorMessage: 'BRANCH:NAME_REQUIRED' },
        isString: true,
        trim: true
    },
    unit_id: {
        in: ['params'],
        isUUID: { errorMessage: 'BRANCH:UNIT_ID_INVALID' }
    }
});

export const idParamRequired = checkSchema({
    id: {
        in: ['params'],
        isUUID: { errorMessage: 'SYS:ID_INVALID_UUID' }
    }
});

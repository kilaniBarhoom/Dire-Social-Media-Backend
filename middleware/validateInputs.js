import { body, validationResult } from 'express-validator'


const inputValidationRules = [
    body('userName').notEmpty().withMessage('Name is required')
        .isLength({ max: 10, min: 3 }).withMessage('Name should be between 3 and 10 characters').isAlphanumeric().withMessage("Username should be alphanumeic").trim(),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email').normalizeEmail().trim(),

    body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password should be atleast 8 characters').trim()
]

function inputValidation(request, response, next) {
    const errors = validationResult(request)

    if (errors.isEmpty()) {
        return response.status(400).send({
            errors: errors.array()
        })
    }
    next()
}

export { inputValidationRules, inputValidation }
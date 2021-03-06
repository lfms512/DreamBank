import express = require('express');
import {BadRequest} from './validators/BadRequest';
import {checkSchema, validationResult} from 'express-validator';
import ValidatorError from './validators/ValidatorError';
import {jwtMiddlewareValidator} from './validators/JwtMiddlewareValidator';
import {TransactionListValidator} from './validators/TransactionListValidator';
import {GetTransactionsUseCase} from '../../application/use_cases/GetTransactionsUseCase';

export const transactionListController: express.Router = express.Router();
const badRequest: BadRequest = new BadRequest();
const validatorError: ValidatorError = new ValidatorError();
const getTransactionsUseCase: GetTransactionsUseCase = new GetTransactionsUseCase();

transactionListController.post('/getTransactionList',
    checkSchema(TransactionListValidator),
    jwtMiddlewareValidator,
    (request: express.Request, response: express.Response) => {
        if (request.body.idNumber == request.body.tokenObject.idNumber) {
            let errors = validationResult(request)['errors'];
            if (errors && !errors.length) {
                getTransactionsUseCase.getTransactions(request.body.idNumber, request.body.idAccount)
                    .then((responseObject) => {
                        response.setHeader('authorization', 'Bearer ' + request.body.tokenObject.newToken);
                        response.send(responseObject);
                    });
            } else {
                validatorError.sendErrors(errors, response);
            }
        } else {
            response.sendStatus(401);
        }
    }
);


transactionListController.use('/getTransactionList', (request: express.Request, response: express.Response) => {
    badRequest.badRequest(response);
});
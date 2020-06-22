import * as qs from 'qs';

import axios from 'axios';

const sha512 = require('js-sha512');

const paymentUrl = {
    prod: 'https://secure.payu.in/',
    test: 'https://sandboxsecure.payu.in/',
};

const restUrl = {
    prod: 'https://www.payumoney.com/',
    test: 'https://test.payumoney.com/',
};

const API = {
    makePayment: '_payment',
    addInvoiceMerchant: 'payment/payment/addInvoiceMerchantAPI?',
    paymentResponse: 'payment/op/getPaymentResponse?',
    refundPayment: 'payment/merchant/refundPayment?',
    refundStatus: 'treasury/ext/merchant/getRefundDetailsByPayment?',
};

export default {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: 'YOUR-AUTHORIZATION-HEADER',
    },

    credentails: {
        'merchant-key': 'YOUR-MERCHANT-KEY',
        'merchant-salt': 'YOUR-SALT-KEY',
        service_provider: 'payu_paisa',
    },

    mode: 'test',

    isProdMode(mode: any) {
        if (mode) {
            this.mode = 'prod';
        } else {
            this.mode = 'test';
        }
    },

    setKeys(key: any, salt: any, authorization: string) {
        this.credentails['merchant-key'] = key;
        this.credentails['merchant-salt'] = salt;
        this.headers.authorization = authorization;
    },

    makePayment(
        data: { txnid: string; amount: string; productinfo: string; firstname: string; email: string },
        callback: (arg0: any, arg1: any) => void,
    ) {
        const hashData = {
            preHashString:
                this.credentails['merchant-key'] +
                '|' +
                data.txnid +
                '|' +
                data.amount +
                '|' +
                data.productinfo +
                '|' +
                data.firstname +
                '|' +
                data.email +
                '|||||||||||',
        };
        const hash = sha512(hashData.preHashString + this.credentails['merchant-salt']);
        const payuData = {
            key: this.credentails['merchant-key'],
            salt: this.credentails['merchant-salt'],
            service_provider: 'payu_paisa',
            hash: hash,
        };
        const params = Object.assign(payuData, data);

        axios({
            method: 'POST',
            url: restUrl['test'] + API.addInvoiceMerchant,
            data: qs.stringify(params),
            headers: this.headers,
        })
            .then((result: any) => {
                callback(null, result);
            })
            .catch((err: any) => {
                callback(err, null);
            });
    },

    paymentResponse(txnid: any, callback: (arg0: any, arg1: any) => void) {
        const params = {
            merchantKey: this.credentails['merchant-key'],
            merchantTransactionIds: txnid,
        };

        axios({
            method: 'POST',
            url: restUrl['test'] + API.paymentResponse,
            data: qs.stringify(params),
            headers: this.headers,
        })
            .then((result: any) => {
                callback(null, result.result);
            })
            .catch((err: any) => {
                callback(err, null);
            });
    },

    refundPayment(paymentId: any, amount: any, callback: (arg0: any, arg1: any) => void) {
        const params = {
            merchantKey: this.credentails['merchant-key'],
            paymentId: paymentId,
            refundAmount: amount,
        };

        axios({
            method: 'POST',
            url: restUrl['test'] + API.refundPayment,
            data: qs.stringify(params),
            headers: this.headers,
        })
            .then((result: any) => {
                callback(null, result.result);
            })
            .catch((err: any) => {
                callback(err, null);
            });
    },

    refundStatus(paymentId: string, callback: (arg0: null, arg1: null) => void) {
        axios({
            method: 'GET',
            url:
                restUrl['test'] +
                API.addInvoiceMerchant +
                'merchantKey=' +
                this.credentails['merchant-key'] +
                '&paymentId=' +
                paymentId,
            headers: this.headers,
        })
            .then((result: any) => {
                callback(null, result);
            })
            .catch((err: any) => {
                callback(err, null);
            });
    },
};

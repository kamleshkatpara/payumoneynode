const qs = require('qs');

const axios = require('axios');

const sha512 = require('js-sha512');

const payment_url = {
    'prod': 'https://secure.payu.in/',
    'test': 'https://sandboxsecure.payu.in/'
};

const rest_url = {
    'prod': "https://www.payumoney.com/",
    'test': 'https://test.payumoney.com/'
};

const API = {
    'makePayment': '_payment',
    'addInvoiceMerchant': 'payment/payment/addInvoiceMerchantAPI?',
    'paymentResponse': 'payment/op/getPaymentResponse?',
    'refundPayment': 'payment/merchant/refundPayment?',
    'refundStatus': 'treasury/ext/merchant/getRefundDetailsByPayment?',
};

let config = {

    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': 'YOUR-AUTHORIZATION-HEADER' //will be provided by payumoney
    },

    credentails: {
        'merchant-key': 'YOUR-MERCHANT-KEY', //will be provided by payumoney
        'merchant-salt': 'YOUR-SALT-KEY', //will be provided by payumoney
        'service_provider': 'payu_paisa' //do not modify
    },

    mode: 'test',

    isProdMode: function (mode: any) {
        if (mode) {
            this.mode = 'prod';
        } else {
            this.mode = 'test';
        }
    },

    setKeys: function (key: any, salt: any, authorization: string) {
        this.credentails["merchant-key"] = key;
        this.credentails["merchant-salt"] = salt;
        this.headers.authorization = authorization;
    },

    makePayment: function (data: { txnid: string; amount: string; productinfo: string; firstname: string; email: string; }, callback: (arg0: any, arg1: any) => void) {
        var hashData = { preHashString: this.credentails["merchant-key"] + '|' + data.txnid + '|' + data.amount + '|' + data.productinfo + '|' + data.firstname + '|' + data.email + '|||||||||||' };
        var hash = sha512(hashData.preHashString + this.credentails["merchant-salt"]);
        var payuData = {
            key: this.credentails["merchant-key"],
            salt: this.credentails["merchant-salt"],
            service_provider: 'payu_paisa',
            hash: hash
        };
        var params = Object.assign(payuData, data);

        axios({
            method: 'POST',
            url: rest_url['test'] + API.addInvoiceMerchant,
            data: qs.stringify(params),
            headers: this.headers
        }).then((result: any) => {
            callback(null, result)
        }).catch((err: any) => {
            callback(err, null)
        })
    },

    paymentResponse: function (txnid: any, callback: (arg0: any, arg1: any) => void) {
        var params = {
            merchantKey: this.credentails["merchant-key"],
            merchantTransactionIds: txnid
        };

        axios({
            method: 'POST',
            url: rest_url['test'] + API.paymentResponse,
            data: qs.stringify(params),
            headers: this.headers
        }).then((result: any) => {
            callback(null, result.result)
        }).catch((err: any) => {
            callback(err, null)
        })
    },

    refundPayment: function (paymentId: any, amount: any, callback: (arg0: any, arg1: any) => void) {
        var params = {
            merchantKey: this.credentails["merchant-key"],
            paymentId: paymentId,
            refundAmount: amount
        };

        axios({
            method: 'POST',
            url: rest_url['test'] + API.refundPayment,
            data: qs.stringify(params),
            headers: this.headers
        }).then((result: any) => {
            callback(null, result.result)
        }).catch((err: any) => {
            callback(err, null)
        })
    },

    refundStatus: function (paymentId: string, callback: (arg0: null, arg1: null) => void) {
        axios({
            method: 'GET',
            url: rest_url['test'] + API.addInvoiceMerchant + 'merchantKey=' + this.credentails["merchant-key"] + '&paymentId=' + paymentId,
            headers: this.headers
        }).then((result: any) => {
            callback(null, result)
        }).catch((err: any) => {
            callback(err, null)
        })
    }

}
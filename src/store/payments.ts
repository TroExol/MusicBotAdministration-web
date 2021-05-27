import axios from 'axios';

import { URLS } from '../common/constants';

export interface IPayment {
    id: number;
    date: string;
    amount?: string;
    userId: number;
    fio: string;
    url: string;
    subscriptionId: number;
    subscription: string;
}

// *** ACTIONS ***
// Get
export type getPaymentsActionType = () => Promise<[true, IPayment[]] | [false, string]>;

export const getPaymentsAction: getPaymentsActionType = async () => {
    try {
        const result = await axios.get(URLS.payments);

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const payments = result.data.result;

        return [true, payments];
    } catch (e) {
        return [false, 'Не удалось получить оплаты'];
    }
};

export type addPaymentActionType = (payment: IPayment) => Promise<[true, number] | [false, string]>;

export const addPaymentAction: addPaymentActionType = async (payment) => {
    try {
        const result = await axios.post(URLS.payment, {
            params: payment,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const paymentId = result.data.result;

        return [true, paymentId];
    } catch (e) {
        return [false, 'Не удалось добавить оплату'];
    }
};

export type deletePaymentActionType = (id: number) => Promise<[true] | [false, string]>;

export const deletePaymentAction: deletePaymentActionType = async (id) => {
    try {
        const result = await axios.delete(URLS.payment, {
            params: { id },
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        return [true];
    } catch (e) {
        return [false, 'Не удалось удалить оплат(у/ы)'];
    }
};

export const updatePaymentAction: addPaymentActionType = async (payment) => {
    try {
        const result = await axios.put(URLS.payment, {
            params: payment,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const paymentId = result.data.result;

        return [true, paymentId];
    } catch (e) {
        return [false, 'Не удалось изменить оплату'];
    }
};

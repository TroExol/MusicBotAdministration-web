import axios from 'axios';

import { URLS } from '../common/constants';
import { IQueryType } from './queryTypes';

export interface ISubscription {
    id: number;
    name: string;
    amount: string;
    queryTypes: IQueryType[];
}

// *** ACTIONS ***
// Get
export type getSubscriptionsActionType = () => Promise<[true, ISubscription[]] | [false, string]>;

export const getSubscriptionsAction: getSubscriptionsActionType = async () => {
    try {
        const result = await axios.get(URLS.subscriptions);

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const subscriptions = result.data.result;

        return [true, subscriptions];
    } catch (e) {
        return [false, 'Не удалось получить подписки'];
    }
};

export type addSubscriptionActionType = (
    subscription: ISubscription,
) => Promise<[true, number] | [false, string]>;

export const addSubscriptionAction: addSubscriptionActionType = async (subscription) => {
    try {
        const result = await axios.post(URLS.subscription, {
            params: subscription,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const subscriptionId = result.data.result;

        return [true, subscriptionId];
    } catch (e) {
        return [false, 'Не удалось добавить подписку'];
    }
};

export type editSubscriptionActionType = (
    subscription: ISubscription,
    oldSubscription: ISubscription,
) => Promise<[true, number] | [false, string]>;

export const updateSubscriptionAction: editSubscriptionActionType = async (
    subscription,
    oldSubscription,
) => {
    try {
        const result = await axios.put(URLS.subscription, {
            params: [subscription, oldSubscription],
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const subscriptionId = result.data.result;

        return [true, subscriptionId];
    } catch (e) {
        return [false, 'Не удалось изменить подписку'];
    }
};

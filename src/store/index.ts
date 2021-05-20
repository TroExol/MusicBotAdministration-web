// *** NPM ***
import { createStore, compose, combineReducers } from 'redux';
import { throttle } from 'lodash';

import { loadFromLocalStorage, saveToLocalStorage } from '../utils/local-storage';

import administratorReducer from './administrator';

const LOCAL_STORAGE_REDUX_NAME = 'REDUX_STATE';
const LOCAL_STORAGE_THROTTLE_TIME = 1000;

// *** REDUX STORE ***
const composeEnhancers =
    process.env.NODE_ENV === 'development'
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
        : compose;

const rootReducer = combineReducers({
    administrator: administratorReducer,
});

const store = createStore(
    rootReducer,
    loadFromLocalStorage<StoreType>(LOCAL_STORAGE_REDUX_NAME),
    composeEnhancers(),
);

store.subscribe(
    throttle(() => {
        saveToLocalStorage(
            { administrator: store.getState().administrator },
            LOCAL_STORAGE_REDUX_NAME,
        );
    }, LOCAL_STORAGE_THROTTLE_TIME),
);

export type StoreType = ReturnType<typeof rootReducer>;
export type StoreDispatchType = typeof store.dispatch;
export default store;

// *** NPM ***
import { createStore, compose, combineReducers } from 'redux';

// *** REDUX STORE ***
const composeEnhancers =
    process.env.NODE_ENV === 'development'
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
        : compose;

const rootReducer = combineReducers({});

const store = createStore(rootReducer, [], composeEnhancers());

export type StoreType = ReturnType<typeof rootReducer>;
export type StoreDispatchType = typeof store.dispatch;
export default store;

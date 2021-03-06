import { createStore, applyMiddleware, compose } from 'redux';
import promiseMiddleware from '../middlewares/PromiseMiddleware';
import createLogger from 'redux-logger';
import combinedReducers from '../reducers';
import { devTools, persistState } from 'redux-devtools';

// 掛上 reudx-devtools
let cs;
if ( window.$REDUX_DEVTOOL ) {
	cs = compose( devTools(), createStore );
}else {
	cs = createStore;
}

const logger = createLogger({
  level: 'info',
  collapsed: true,
  // predicate: (getState, action) => action.type !== AUTH_REMOVE_TOKEN
});

// jx: 改為支援 devTools
const createStoreWithMiddleware = applyMiddleware(
  promiseMiddleware,
  logger,
)(cs);

export default function configureStore( initialState = undefined  ) {

	// 重要：如果有 server rendering，就直接用預先埋好的資料而不用重撈了，省一趟
  const store = createStoreWithMiddleware( combinedReducers, initialState );

  // module 是 webpack 包過一層時提供的，signature 如下：
  // function(module, exports, __webpack_require__) {
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}

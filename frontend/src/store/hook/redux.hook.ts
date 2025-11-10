import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { AppDispatch, StoreType } from '../app/redux.store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<StoreType> = useSelector;

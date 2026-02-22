/**
 * @fileoverview usePriceAnalysis hook — wraps Redux dispatch + selector.
 */

import { useSelector, useDispatch } from 'react-redux';
import { analyzePrice, clearResult } from '../store/priceSlice';

export function usePriceAnalysis() {
  const dispatch = useDispatch();
  const { result, loading, error } = useSelector((state) => state.price);

  const analyze = (payload) => dispatch(analyzePrice(payload));
  const reset = () => dispatch(clearResult());

  return { result, loading, error, analyze, reset };
}

export default usePriceAnalysis;

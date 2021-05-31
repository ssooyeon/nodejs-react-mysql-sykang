import { useEffect, useRef } from "react";

export default function useInterval(callback, delay) {
  const saveCallback = useRef();

  // 마지막 콜백 저장해놓기
  useEffect(() => {
    saveCallback.current = callback;
  }, [callback]);

  // interval 설정
  useEffect(() => {
    function tick() {
      saveCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [callback, delay]);
}

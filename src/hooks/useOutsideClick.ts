import { useEffect, useRef, MutableRefObject } from 'react';

export const useOutsideClick = (cb: (args?: any) => any): MutableRefObject<any> => {
   const ref = useRef<any>();

   const handleOutsideClick = (e: MouseEvent) => {
      if (ref && ref.current && ref.current.contains(e.target)) {
         return;
      }
      cb();
   };
   useEffect(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
         document.removeEventListener('mousedown', handleOutsideClick);
      };
   }, []);

   return ref;
};

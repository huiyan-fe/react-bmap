import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';

export const AutocompletePropsSchema = z.object({
  onConfirm: z.function().optional().describe('选中联想词回调'),
  style: z.record(z.string(), z.any()).optional().describe('输入框样式'),
  inputId: z.string().optional().describe('输入框 DOM id'),
  map: z.any().optional(),
});

export type AutocompleteProps = z.infer<typeof AutocompletePropsSchema>;

export const Autocomplete: React.FC<AutocompleteProps> = (props) => {
  const { api: B } = useBMap();
  const inputIdRef = useRef(`suggestId_${Math.random().toString(36).slice(2)}`);
  const inputId = props.inputId || inputIdRef.current;

  useEffect(() => {
    const input = document.getElementById(inputId);
    if (!input || !B?.Autocomplete) return;

    const ac = new B.Autocomplete({ input } as any) as any;
    if (props.onConfirm) {
      ac.addEventListener('onconfirm', props.onConfirm);
    }

    return () => {
      ac.removeEventListener?.('onconfirm', props.onConfirm);
    };
  }, [props.onConfirm, inputId]);

  return <input style={props.style} id={inputId} />;
};

export default Autocomplete;

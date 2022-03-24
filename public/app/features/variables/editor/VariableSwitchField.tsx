import React, { ChangeEvent, PropsWithChildren, ReactElement } from 'react';
import { InlineField, InlineSwitch } from '@grafana/ui';
import { useUniqueId } from 'app/plugins/datasource/influxdb/components/useUniqueId';
interface VariableSwitchFieldProps {
  value: boolean;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  tooltip?: string;
  ariaLabel?: string;
}

export function VariableSwitchField({
  value,
  name,
  tooltip,
  onChange,
  disabled,
  ariaLabel,
}: PropsWithChildren<VariableSwitchFieldProps>): ReactElement {
  const uniqueId = useUniqueId();
  return (
    <InlineField label={name} labelWidth={20} tooltip={tooltip} disabled={disabled}>
      <InlineSwitch
        id={`var-switch-${uniqueId}`}
        label={name}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
      />
    </InlineField>
  );
}

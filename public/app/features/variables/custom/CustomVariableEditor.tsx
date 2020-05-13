import React, { FormEvent, PureComponent } from 'react';
import { CustomVariableModel, VariableWithMultiSupport } from '../types';
import { SelectionOptionsEditor } from '../editor/SelectionOptionsEditor';
import { OnPropChangeArguments, VariableEditorProps } from '../editor/types';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { MapDispatchToProps, MapStateToProps } from 'react-redux';
import { VerticalGroup, InlineFieldRow } from '@grafana/ui';
import { StoreState } from 'app/types';
import { changeVariableMultiValue } from '../state/actions';
import { VariableSectionHeader } from '../editor/VariableSectionHeader';
import { VariableTextAreaField } from '../editor/VariableTextAreaField';
import { VariableSwitchField } from '../editor/VariableSwitchField';
import { VariableIdentifier } from '../state/types';
import { ThunkResult } from '../../../types';

interface OwnProps extends VariableEditorProps<CustomVariableModel> {}

interface ConnectedProps {}

interface DispatchProps {
  changeVariableMultiValue: typeof changeVariableMultiValue;
}

export type Props = OwnProps & ConnectedProps & DispatchProps;

class CustomVariableEditorUnconnected extends PureComponent<Props> {
  onChange = (event: FormEvent<HTMLTextAreaElement>) => {
    this.props.onPropChange({
      propName: 'query',
      propValue: event.currentTarget.value,
    });
  };

  onNoClearChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onPropChange({
      propName: 'noclear',
      propValue: event.target.checked,
    });
  };

  onEditableChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onPropChange({
      propName: 'editable',
      propValue: event.target.checked,
    });
  };

  onSelectionOptionsChange = async ({ propName, propValue }: OnPropChangeArguments<VariableWithMultiSupport>) => {
    this.props.onPropChange({ propName, propValue, updateOptions: true });
  };

  onMultiChange = (identifier: VariableIdentifier, multi: boolean): ThunkResult<void> => {
    if (multi) {
      this.props.onPropChange({ propName: 'noclear', propValue: false });
      this.props.onPropChange({ propName: 'editable', propValue: false });
    }
    return this.props.changeVariableMultiValue(identifier, multi);
  };

  onBlur = (event: FormEvent<HTMLTextAreaElement>) => {
    this.props.onPropChange({
      propName: 'query',
      propValue: event.currentTarget.value,
      updateOptions: true,
    });
  };

  render() {
    return (
      <VerticalGroup spacing="xs">
        <VariableSectionHeader name="Custom options" />
        <VerticalGroup spacing="md">
          <VerticalGroup spacing="none">
            <VariableTextAreaField
              name="Values separated by comma"
              value={this.props.variable.query}
              placeholder="1, 10, mykey : myvalue, myvalue, escaped\,value"
              onChange={this.onChange}
              onBlur={this.onBlur}
              required
              width={50}
              labelWidth={27}
            />
          </VerticalGroup>
          <VerticalGroup spacing="none">
            <InlineFieldRow>
              <VariableSwitchField
                name="Do not clear"
                value={this.props.variable.noclear}
                disabled={this.props.variable.multi}
                onChange={this.onNoClearChange}
                tooltip="Keep text of current option in textbox to simplify copy-paste"
              />
            </InlineFieldRow>
            <InlineFieldRow>
              <VariableSwitchField
                name="Make editable"
                value={this.props.variable.editable}
                disabled={this.props.variable.multi}
                onChange={this.onEditableChange}
                tooltip="Add current option to dropdown list"
              />
            </InlineFieldRow>
          </VerticalGroup>
          <SelectionOptionsEditor
            variable={this.props.variable}
            onPropChange={this.onSelectionOptionsChange}
            onMultiChanged={this.onMultiChange}
          />{' '}
        </VerticalGroup>
      </VerticalGroup>
    );
  }
}

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = (state, ownProps) => ({});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  changeVariableMultiValue,
};

export const CustomVariableEditor = connectWithStore(
  CustomVariableEditorUnconnected,
  mapStateToProps,
  mapDispatchToProps
);

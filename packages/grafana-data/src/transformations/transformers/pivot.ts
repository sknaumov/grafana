import { map } from 'rxjs/operators';

import { DataFrame, Field, FieldType } from '../../types/dataFrame';
import {
  SpecialValue,
  DataTransformerInfo,
  TransformationApplicabilityLevels,
  DataTransformContext,
} from '../../types/transformations';
import { fieldMatchers } from '../matchers';
import { FieldMatcherID } from '../matchers/ids';

import { DataTransformerID } from './ids';
import { getSpecialValue, findMaxFields } from './utils';

export interface PivotTransformerOptions {
  columnField?: string;
  valueField?: string;
  emptyValue?: SpecialValue;
}

const MINIMUM_FIELDS_REQUIRED = 2;  // Need at least 2 fields (columns) to pivot


export const pivotTransformer: DataTransformerInfo<PivotTransformerOptions> = {
  id: DataTransformerID.pivot,
  name: 'Pivot',
  description: 'Pivot 2 columns (keys and values) into new columns, keeping other columns intact.',
  defaultOptions: {},
  isApplicable: (data: DataFrame[]) => {
    return findMaxFields(data) >= MINIMUM_FIELDS_REQUIRED
      ? TransformationApplicabilityLevels.Applicable
      : TransformationApplicabilityLevels.NotApplicable;
  },
  isApplicableDescription: (data: DataFrame[]) => {
    const maxFields = findMaxFields(data);
    return `Pivot requires at least ${MINIMUM_FIELDS_REQUIRED} fields to work. Currently there are ${maxFields} fields.`;
  },
  operator: (options, ctx) => (source) =>
    source.pipe(map((data) => pivotTransformer.transformer(options, ctx)(data))),

  transformer: (options: pivotTransformerOptions, ctx: DataTransformContext) => (data: DataFrame[]) => {
    const emptyValue = options.emptyValue || SpecialValue.Empty;
    return data.map((frame) => {
      // Check that provided column names exist in dataframe.
      const colFieldIdx = frame.fields.findIndex((f) => f.name === options.columnField);
      const valFieldIdx = frame.fields.findIndex((f) => f.name === options.valueField);
      if (colFieldIdx < 0 || valFieldIdx < 0) {
        return frame;
      }

      const colField = frame.fields[colFieldIdx];
      const valField = frame.fields[valFieldIdx];

      // Create array with empty values per new column, then add sparse values to them.
      const newColumns: { [key: string]: unknown[] } =
        uniqueValues(colField.values).reduce((dict, colName) => {
        dict[colName] = Array(valField.values.length).fill(getSpecialValue(emptyValue));
        return dict;
      }, {});
      for (let i = 0; i < valField.values.length; i++) {
        const colName = colField.values[i];
        const value = valField.values[i];
        newColumns[colName][i] = value;
      }

      // Exclude transformed columns, keep other columns, add new columns.
      const fields: Field[] = [
        ...frame.fields.filter((_, idx) => idx !== colFieldIdx && idx !== valFieldIdx),
        ...Object.entries(newColumns).map(([colName, values]) => {
            return {
                name: colName?.toString() ?? null,
                values: values,
                config: valField.config,
                type: valField.type
            };
        })
      ];

      return {
        ...frame,
        fields: fields,
        length: valField.values.length  // all frame fields have the same length
      };
    });
  }
};

function uniqueValues<T>(values: T[]): T[] {
  const unique = new Set<T>(values);
  return Array.from(unique);
}

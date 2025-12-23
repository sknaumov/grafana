import { toDataFrame } from '../../dataframe/processDataFrame';
import { FieldType, Field } from '../../types/dataFrame';
import { DataTransformerConfig, SpecialValue } from '../../types/transformations';
import { mockTransformationsRegistry } from '../../utils/tests/mockTransformationsRegistry';
import { transformDataFrame } from '../transformDataFrame';

import { pivotTransformerOptions, pivotTransformer } from './pivot';
import { DataTransformerID } from './ids';

describe('Pivot', () => {
  beforeAll(() => {
    mockTransformationsRegistry([pivotTransformer]);
  });

  it('pivot 2 columns', async () => {
    const cfg: DataTransformerConfig<pivotTransformerOptions> = {
      id: DataTransformerID.pivot,
      options: {
        columnField: 'Serie',
        valueField: 'Value',
      },
    };

/*
    | Year | Serie   | Value | Report        |     | Year | Report        | Revenue | Profit | Taxes |
    | ---- | ------- | ----- | ------------- |     | ---- | ------------- | ------- | ------ | ----- |
    | 2024 | Revenue |   100 | 2024.xls      |     | 2024 | 2024.xls      |     100 |        |       |
    | 2024 | Profit  |    10 | 2024.xls      |     | 2024 | 2024.xls      |         |     10 |       |
    | 2024 | Taxes   |    20 | 2024.xls      | --> | 2024 | 2024.xls      |         |        |    20 |
    | 2025 | Revenue |   120 | 2025-rev.xlsx |     | 2025 | 2025-rev.xlsx |     120 |        |       |
    | 2025 | Profit  |     5 | 2025-pft.xlsx |     | 2025 | 2025-pft.xlsx |         |      5 |       |
    | 2025 | Taxes   |    30 | 2025-tax.xlsx |     | 2025 | 2025-tax.xlsx |         |        |    30 |
*/

    const seriesA = toDataFrame({
      name: 'A',
      fields: [
        { name: 'Year', type: FieldType.number,
          values: [2024, 2024, 2024, 2025, 2025, 2025] },
        { name: 'Serie', type: FieldType.string,
          values: ['Revenue', 'Profit', 'Taxes', 'Revenue', 'Profit', 'Taxes'] },
        { name: 'Value', type: FieldType.number,
          values: [100, 10, 20, 120, 5, 30] },
        { name: 'Report', type: FieldType.string,
          values: ['2024.xls', '2024.xls', '2024.xls', '2025-rev.xlsx', '2025-pft.xlsx', '2025-tax.xlsx'] },
      ],
    });

    await expect(transformDataFrame([cfg], [seriesA])).toEmitValuesWith((received) => {
      const processed = received[0];
      const expected: Field[] = [
        { name: 'Year', type: FieldType.number,
          values: [2024, 2024, 2024, 2025, 2025, 2025] },
        { name: 'Report', type: FieldType.string,
          values: ['2024.xls', '2024.xls', '2024.xls', '2025-rev.xlsx', '2025-pft.xlsx', '2025-tax.xlsx'] },
        { name: 'Revenue', type: FieldType.number,
          values: [100, '', '', 120, '', ''] },
        { name: 'Profit', type: FieldType.number,
          values: ['', 10, '', '', 5, ''] },
        { name: 'Taxes', type: FieldType.number,
          values: ['', '', 20, '', '', 30] },
      ];
      expect(processed[0].fields).toEqual(expected);
    });
  });
});
